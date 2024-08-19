import * as vscode from 'vscode';
import { Provider } from './types';
import { executePromptOpenAI } from '../providers/openai';
import { executePromptOllama } from '../providers/ollama';
// import { executePromptAnthropic } from '../providers/anthropic';
// import { executePromptCopilot } from '../providers/copilot';
import { displayInOutputChannel, displayInWebviewPanel } from './outputHandlers';
import { compileFile } from './compileFile';

export async function executeFileWithProviderAndModel(providers: Provider[], providerName: string, model: string) {

  const { promptConfig, compiledPrompt } = await compileFile();

  if (!compiledPrompt) {
    vscode.window.showErrorMessage("Failed to compile prompt.");
    return;
  }

  providerName = promptConfig.provider || providerName;
  model = promptConfig.model || model;

  const provider = providers.find(p => p.name === providerName);
  if (!provider) {
    vscode.window.showErrorMessage(`Provider ${providerName} not found.`);
    return;
  }

  // verify that the model is supported by the provider
  if (!provider.models.includes(model)) {
    vscode.window.showErrorMessage(`Model ${model} not supported by provider ${providerName}.`);
    return;
  }

  const config = vscode.workspace.getConfiguration('prompt-runner');
  const outputLocation = config.get<string>('outputLocation');

  try {
    var stream;
    switch (provider.type) {
      case 'openai':
        stream = await executePromptOpenAI(provider, model, compiledPrompt, promptConfig);
        break;
      case 'ollama':
        stream = await executePromptOllama(provider, model, compiledPrompt, promptConfig);
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
