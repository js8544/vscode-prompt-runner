import * as vscode from 'vscode';
import { getProviders } from '../utils/providerUtils';
import { executeFileWithProviderAndModel } from '../utils/executeFile';

export function runPromptFile() {
  return vscode.commands.registerCommand('prompt-runner.runPromptFile', async () => {
    const config = vscode.workspace.getConfiguration('prompt-runner');
    const providers = getProviders(config);
    const defaultProvider = config.get('defaultProvider') as string;
    const defaultModel = config.get('defaultModel') as string;

    await executeFileWithProviderAndModel(providers, defaultProvider, defaultModel);
  });
}
