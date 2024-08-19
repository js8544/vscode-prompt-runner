import 'mocha';
import * as assert from 'assert';
import { compilePrompt } from '../prompt-file/promptFile';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { beforeEach, afterEach, test } from 'mocha';

suite('PromptFile Tests', () => {

  beforeEach(() => {
    // Stub the VSCode showInputBox to simulate user input
    sinon.stub(vscode.window, 'showInputBox').callsFake(async (options) => {
      if (options?.prompt?.includes('context')) { return 'test context'; }
      if (options?.prompt?.includes('sentence')) { return 'test sentence'; }
      return undefined;
    });
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
    assert.strictEqual(result.compiledPrompt, 'Autocomplete the sentence.\n\nContext: test context\n\ntest sentence');
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
    assert.strictEqual(result.compiledPrompt, 'Autocomplete the sentence.\n\nContext: test context\n\ntest sentence');
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
    assert.strictEqual(result.compiledPrompt, 'Context: You are a software engineering expert. You are extremely good at software engineering principles and practices. Now you will write unit tests for this project.\n\n\ntest sentence');
  });
});
