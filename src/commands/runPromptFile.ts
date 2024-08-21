import * as vscode from 'vscode';
import { getProviders } from '../utils/providerUtils';
import { executeFileWithProviderAndModel } from '../utils/executeFile';
import logger from '../utils/logger';


export function runPromptFile() {
  return vscode.commands.registerCommand('prompt-runner.runPromptFile', async () => {
    try {

      const config = vscode.workspace.getConfiguration('prompt-runner');
      const providers = getProviders(config);
      const defaultProvider = config.get('defaultProvider') as string;
      const defaultModel = config.get('defaultModel') as string;

      await executeFileWithProviderAndModel(providers, defaultProvider, defaultModel);
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to execute prompt: ${error.message}`);
      logger.error(`Failed to execute prompt: ${error.message} \n ${error.stack}`);
    }
  });
}
