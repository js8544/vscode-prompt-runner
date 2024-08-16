import * as vscode from 'vscode';
import { selectDefaultModel } from './commands/selectDefaultModel';
import { runPrompt } from './commands/runPrompt';
import { runPromptWithProvider } from './commands/runPromptWithProvider';
import { defaultProviders } from './config/defaultProvider';
import { getProviders } from './utils/providerUtils';

export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration('prompt-runner');
	let providers = getProviders(config);

	// Apply default providers if not present
	if (!providers || providers.length === 0) {
		config.update('providers', defaultProviders, vscode.ConfigurationTarget.Global);
		providers = defaultProviders;
	}

	context.subscriptions.push(selectDefaultModel());
	context.subscriptions.push(runPrompt());
	context.subscriptions.push(runPromptWithProvider());
}

export function deactivate() { }
