import * as vscode from 'vscode';
import { getProviders } from '../utils/providerUtils';
import { executeFileWithProviderAndModel } from '../utils/executeFile';
import logger from '../utils/logger';

export function runPromptFileWithModel() {
  return vscode.commands.registerCommand('prompt-runner.runPromptFileWithModel', async () => {
    try {
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

      await executeFileWithProviderAndModel(providers, selectedProviderName, selectedModel);
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to execute prompt: ${error.message}`);
      logger.error(`Failed to execute prompt: ${error.message} \n ${error.stack}`);
    }
  });
}
