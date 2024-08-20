import * as vscode from 'vscode';
import { compilePrompt } from '../prompt-file/promptFile';
import { displayInOutputChannel, displayInWebviewPanel } from '../utils/outputHandlers';
export function compilePromptFile() {
  return vscode.commands.registerCommand('prompt-runner.compilePromptFile', async () => {
    const config = vscode.workspace.getConfiguration('prompt-runner');
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found.");
      return;
    }

    const document = editor.document;

    const prompt = document.getText();

    const { promptConfig, messages, inputValues } = await compilePrompt(prompt, document);

    if (!messages || messages.length === 0) {
      vscode.window.showErrorMessage("Failed to compile prompt.");
      return;
    }

    // Make a stream for promptConfig and compiledPrompt
    const stream: AsyncIterable<string> = {
      [Symbol.asyncIterator]: async function* () {
        for (const message of messages) {
          yield JSON.stringify(message, null, 2);
        }
      }
    };

    const outputLocation = config.get<string>('outputLocation');
    switch (outputLocation) {
      case 'webview panel':
        displayInWebviewPanel(stream);
        break;
      case 'output channel':
      default:
        displayInOutputChannel(stream);
    }
  });
}
