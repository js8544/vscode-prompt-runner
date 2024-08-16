import * as vscode from 'vscode';
import { getProviders } from '../utils/providerUtils';

export function selectDefaultModel() {
  return vscode.commands.registerCommand('prompt-runner.selectDefaultModel', async () => {
    const config = vscode.workspace.getConfiguration('prompt-runner');
    const providers = getProviders(config);

    const selectedProvider = await vscode.window.showQuickPick(providers.map(p => p.name), {
      placeHolder: 'Select the default provider'
    });

    if (!selectedProvider) {
      vscode.window.showErrorMessage("No provider selected.");
      return;
    }

    const provider = providers.find(p => p.name === selectedProvider);
    if (!provider) {
      vscode.window.showErrorMessage(`Select a provider first.`);
      return;
    }

    const selected = await vscode.window.showQuickPick(provider?.models, {
      placeHolder: `Select the default model for provider ${selectedProvider}`
    });

    if (selected) {
      await config.update('defaultProvider', selectedProvider, vscode.ConfigurationTarget.Global);
      await config.update('defaultModel', selected, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`Default model set to ${selected} from provider ${selectedProvider}`);
    }
  });
}
