import * as vscode from 'vscode';
import { Provider } from './types';
import { executePromptOpenAI } from '../providers/openai';
import { executePromptOllama } from '../providers/ollama';
// import { executePromptAnthropic } from '../providers/anthropic';
import { executePromptCopilot } from '../providers/copilot';
import { displayInOutputChannel, displayInWebviewPanel } from './outputHandlers';

export async function executePromptWithProviderAndModel(providers: Provider[], providerName: string, model: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return;
  }

  const document = editor.document;
  const prompt = document.getText();

  const provider = providers.find(p => p.name === providerName);
  if (!provider) {
    vscode.window.showErrorMessage(`Provider ${providerName} not found.`);
    return;
  }

  const config = vscode.workspace.getConfiguration('prompt-runner');
  const outputLocation = config.get<string>('outputLocation');

  try {
    var stream;
    switch (provider.type) {
      case 'openai':
        stream = await executePromptOpenAI(provider, model, prompt);
        break;
      case 'ollama':
        stream = await executePromptOllama(provider, model, prompt);
        break;
      // case 'anthropic':
      //   stream = await executePromptAnthropic(provider, model, prompt);
      //   break;
      // case 'copilot':
      //   stream = await executePromptCopilot(provider, model, prompt);
      default:
        vscode.window.showErrorMessage(`Provider ${providerName} not supported yet.`);
        return;
    }

    switch (outputLocation) {
      case 'webview panel':
        displayInWebviewPanel(stream);
        break;
      case 'output channel':
      default:
        displayInOutputChannel(stream);
        break;
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to execute prompt: ${error.message}`);
  }
}
