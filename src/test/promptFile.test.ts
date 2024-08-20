import 'mocha';
import * as assert from 'assert';
import { compilePrompt } from '../prompt-file/promptFile';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { beforeEach, afterEach, test } from 'mocha';
import { Content } from '../utils/types';

suite('PromptFile Tests', () => {

  beforeEach(() => {
    // Stub the VSCode showInputBox to simulate user input
    sinon.stub(vscode.window, 'showInputBox').callsFake(async (options) => {
      if (options?.prompt?.includes('context')) { return 'test context'; }
      if (options?.prompt?.includes('sentence')) { return 'test sentence'; }
      return undefined;
    });

    // Stub the VSCode getConfiguration function
    sinon.stub(vscode.workspace, 'getConfiguration').returns(
      {
        get: (key: string) => {
          if (key === 'providers') {
            return [
              {
                name: 'openai',
                type: 'openai',
                models: ['gpt-4o'],
              }
            ];
          }
        }
      } as vscode.WorkspaceConfiguration
    );
  });

  afterEach(() => {
    // Restore the original methods
    sinon.restore();
  });

  test('should correctly parse YAML and compile Handlebars template', async () => {
    const content = `
---
model: gpt-4o
temperature: 0.7
max_tokens: 256
provider: openai
---
Autocomplete the sentence.

Context: {{context}}

{{sentence}}
    `;

    const result = await compilePrompt(content);

    // Check the config
    assert.strictEqual(result.promptConfig.model, 'gpt-4o');
    assert.strictEqual(result.promptConfig.temperature, 0.7);
    assert.strictEqual(result.promptConfig.max_tokens, 256);
    assert.strictEqual(result.promptConfig.provider, 'openai');

    // Check the compiled prompt
    assert.strictEqual(result.messages[0].content, 'Autocomplete the sentence.\n\nContext: test context\n\ntest sentence');
  });

  test('should reject an unsupported provider or model', async () => {
    const content1 = `
---
model: gpt-4o
temperature: 0.7
max_tokens: 256
provider: closeai
---
Autocomplete the sentence.

Context: {{context}}

{{sentence}}
    `;

    const content2 = `
    ---
    model: gpt-5
    temperature: 0.7
    max_tokens: 256
    provider: openai
    ---
    Autocomplete the sentence.
    
    Context: {{context}}
    
    {{sentence}}
        `;


    assert.rejects(
      async () => {
        await compilePrompt(content1);
      },
      new Error('Provider closeai not found.')
    );

    assert.rejects(
      async () => {
        await compilePrompt(content2);
      },
      new Error('Model gpt-5 not supported by provider openai.')
    );
  });

  test('should handle templates without YAML', async () => {
    const content = `
Autocomplete the sentence.

Context: {{context}}

{{sentence}}
    `;

    const result = await compilePrompt(content);

    // The config should be empty since there's no YAML
    assert.deepStrictEqual(result.promptConfig, {});

    // Check the compiled prompt
    assert.strictEqual(result.messages[0].content, 'Autocomplete the sentence.\n\nContext: test context\n\ntest sentence');
  });

  test('should throw an error if user cancels input', async () => {
    sinon.restore(); // Restore to ensure we can stub with different behavior
    sinon.stub(vscode.window, 'showInputBox').resolves(undefined); // Simulate canceling input

    const content = `
Autocomplete the sentence.

Context: {{context}}

{{sentence}}
    `;

    await assert.rejects(
      async () => {
        await compilePrompt(content);
      },
      new Error('No input provided for variable: context')
    );
  });

  test('can include file in prompt', async () => {
    const content = `
Context: {{include "test-data/context.txt"}}

{{sentence}}
    `;

    const result = await compilePrompt(content);

    // Check the compiled prompt
    assert.strictEqual(result.messages[0].content, 'Context: You are a software engineering expert. You are extremely good at software engineering principles and practices. Now you will write unit tests for this project.\n\n\ntest sentence');
  });

  test('should not escape HTML special characters',
    async () => {
      const content = `\`\`\`\n\/\\`;

      const result = await compilePrompt(content);

      assert.strictEqual(result.messages[0].content, '\`\`\`\n\/\\');
    }
  );

  test("can encode image in prompt", async () => {
    const content = `
    {{image "test-data/1x1.png"}}
    `;

    const result = await compilePrompt(content);

    assert.equal((result.messages[0].content[0] as Content).image_url?.url, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII='
    );
  });

  test("can parse with html tags", async () => {
    const content = `
<assistant>
You are a helpful assistant
</assistant>
<user>
<h1>Test</h1>
<p>Test</p>
</user>
    `;

    const result = await compilePrompt(content);

    assert.equal(result.messages[1].content, '<h1>Test</h1>\n<p>Test</p>');
  });
});
