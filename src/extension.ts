import * as vscode from 'vscode';
import { selectDefaultModel } from './commands/selectDefaultModel';
import { runPromptFile } from './commands/runPromptFile';
import { runPromptFileWithModel } from './commands/runPromptFileWithModel';
import { defaultProviders } from './config/defaultProvider';
import { getProviders } from './utils/providerUtils';
import { selectOutputLocation } from './commands/selectOutputLocation';
import { compilePromptFile } from './commands/compilePromptFile';
import { SidebarProvider } from './sidebar/SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration('prompt-runner');
	let providers = getProviders(config);

	// Apply default providers if not present
	if (!providers || providers.length === 0) {
		config.update('providers', defaultProviders, vscode.ConfigurationTarget.Global);
		providers = defaultProviders;
	}

	context.subscriptions.push(selectDefaultModel());
	context.subscriptions.push(runPromptFile());
	context.subscriptions.push(runPromptFileWithModel());
	context.subscriptions.push(selectOutputLocation());
	context.subscriptions.push(compilePromptFile());

	// Add sidebar
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"prompt-runner-sidebar",
			sidebarProvider
		)
	);
}

export function deactivate() { }
