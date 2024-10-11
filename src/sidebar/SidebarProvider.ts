import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
	constructor(private readonly _extensionUri: vscode.Uri) {}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri],
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async (data) => {
			switch (data.type) {
				case 'selectDefaultModel':
					vscode.commands.executeCommand('prompt-runner.selectDefaultModel');
					break;
				case 'runPromptFile':
					vscode.commands.executeCommand('prompt-runner.runPromptFile');
					break;
				case 'runPromptFileWithModel':
					vscode.commands.executeCommand('prompt-runner.runPromptFileWithModel');
					break;
				case 'selectOutputLocation':
					vscode.commands.executeCommand('prompt-runner.selectOutputLocation');
					break;
				case 'compilePromptFile':
					vscode.commands.executeCommand('prompt-runner.compilePromptFile');
					break;
				case 'openProviderSettings':
					vscode.commands.executeCommand('workbench.action.openSettings', 'prompt-runner.providers');
					break;
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Prompt Runner</title>
				<style>
					body {
						padding: 10px;
						color: var(--vscode-foreground);
						font-family: var(--vscode-font-family);
						font-size: var(--vscode-font-size);
						font-weight: var(--vscode-font-weight);
					}
					.button {
						display: block;
						width: 100%;
						padding: 8px 12px;
						margin-bottom: 10px;
						background-color: var(--vscode-button-background);
						color: var(--vscode-button-foreground);
						border: none;
						border-radius: 2px;
						cursor: pointer;
						font-family: inherit;
						font-size: inherit;
						text-align: left;
					}
					.button:hover {
						background-color: var(--vscode-button-hoverBackground);
					}
					.button:active {
						background-color: var(--vscode-button-activeBackground);
					}
					h2 {
						margin-top: 0;
						margin-bottom: 20px;
						font-weight: normal;
						font-size: 1.2em;
						color: var(--vscode-sideBarTitle-foreground);
					}
				</style>
			</head>
			<body>
			  <button class="button" onclick="sendMessage('runPromptFile')">Run Prompt</button>	
        <button class="button" onclick="sendMessage('runPromptFileWithModel')">Run Prompt with Model</button>

        <button class="button" onclick="sendMessage('compilePromptFile')">Preview Prompt</button>

        <button class="button" onclick="sendMessage('selectDefaultModel')">Select Default Model</button>
				<button class="button" onclick="sendMessage('selectOutputLocation')">Select Output Location</button>
				<button class="button" onclick="sendMessage('openProviderSettings')">Provider Settings</button>
				
				<script>
					const vscode = acquireVsCodeApi();
					function sendMessage(type) {
						vscode.postMessage({ type: type });
					}
				</script>
			</body>
			</html>
		`;
	}
}