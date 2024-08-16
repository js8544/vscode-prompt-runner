import * as vscode from 'vscode';
import { getProviders } from '../utils/providerUtils';
import { executePromptWithProviderAndModel } from '../utils/executePrompt';

export function runPromptWithProvider() {
  return vscode.commands.registerCommand('prompt-runner.runPromptWithProvider', async () => {
    const config = vscode.workspace.getConfiguration('prompt-runner');
    const providers = getProviders(config);
    const providerNames = providers.map(provider => provider.name);

    const selectedProviderName = await vscode.window.showQuickPick(providerNames, {
      placeHolder: 'Select a provider'
    });

    if (!selectedProviderName) {
      vscode.window.showErrorMessage("No provider selected.");
      return;
    }

    const provider = providers.find(p => p.name === selectedProviderName);
    if (!provider) {
      vscode.window.showErrorMessage(`Provider ${selectedProviderName} not found.`);
      return;
    }

    const selectedModel = await vscode.window.showQuickPick(provider.models, {
      placeHolder: 'Select a model'
    });

    if (!selectedModel) {
      vscode.window.showErrorMessage("No model selected.");
      return;
    }

    await executePromptWithProviderAndModel(providers, selectedProviderName, selectedModel);
  });
}
