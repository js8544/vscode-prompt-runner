import * as assert from 'assert';
import { extractMessages } from '../prompt-file/extractMessages';
import { Message } from '../utils/types';

suite('extractMessages', () => {
  test('should correctly parse the input string into messages', () => {
    const input = `
      <system>
        System-level instructions.
      </system>

      This is also a user message.

      <user>
        Hello, this is a user message.
        <img src="https://example.com/image.jpg" />
        <text>Some more text after the image.</text>
      </user>

      <text>user message again, the image below is also user image</text>
      <img src="https://example.com/image.jpg" />

      <assistant></assistant>
      <assistant>
        <img src="https://example.com/image.jpg" />
        <text>Assistant response.</text>
      </assistant>
    `;

    const expectedOutput: Message[] = [
      {
        role: 'system',
        content: 'System-level instructions.'
      },
      {
        role: 'user',
        content: 'This is also a user message.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Hello, this is a user message.' },
          { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
          { type: 'text', text: 'Some more text after the image.' },
        ]
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'user message again, the image below is also user image' },
          { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
        ]
      },
      {
        role: 'assistant',
        content: []
      },
      {
        role: 'assistant',
        content: [
          { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
          { type: 'text', text: 'Assistant response.' }
        ]
      }
    ];

    const result = extractMessages(input);
    assert.deepStrictEqual(result, expectedOutput);
  });

  test('should parse only system message tag', () => {
    const input = `
      <system>
        System-level instructions.
      </system>

      This is a user message.
    `;

    const expectedOutput: Message[] = [
      {
        role: 'system',
        content: 'System-level instructions.'
      },
      {
        role: 'user',
        content: 'This is a user message.'
      },
    ];

    const result = extractMessages(input);
    assert.deepStrictEqual(result, expectedOutput);
  });

  test('should parse a few shot example', () => {
    const input = `
      <system>
        System-level instructions.
      </system>

      <user>
        This is the first user message.
      </user>

      <assistant>
        This is the first assistant message.
      </assistant>
      
      <user>
        This is the second user message.
      </user>

      <assistant>
        This is the second assistant message.
      </assistant>

      <user>
        What is the result?
      </user>
    `;

    const expectedOutput: Message[] = [
      {
        role: 'system',
        content: 'System-level instructions.'
      },
      {
        role: 'user',
        content: 'This is the first user message.'
      },
      {
        role: 'assistant',
        content: 'This is the first assistant message.'
      },
      {
        role: 'user',
        content: 'This is the second user message.'
      },
      {
        role: 'assistant',
        content: 'This is the second assistant message.'
      },
      {
        role: 'user',
        content: 'What is the result?'
      },
    ];

    const result = extractMessages(input);
    assert.deepStrictEqual(result, expectedOutput);
  });

  test('image only message', () => {
    const input = `
        <img src="https://example.com/image.jpg" />
    `;

    const expectedOutput: Message[] = [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } }
        ]
      },
    ];

    const result = extractMessages(input);
    assert.deepStrictEqual(result, expectedOutput);
  });
});
