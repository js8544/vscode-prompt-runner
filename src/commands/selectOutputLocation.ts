import * as vscode from 'vscode';

export function selectOutputLocation() {
  return vscode.commands.registerCommand('prompt-runner.selectOutputLocation', async () => {
    const config = vscode.workspace.getConfiguration('prompt-runner');

    const outputLocation = config.get('outputLocation') as string;

    const selectedOutputLocation = await vscode.window.showQuickPick([
      "output channel",
      "webview panel"
    ], {
      placeHolder: 'Select the output location'
    });

    if (!selectedOutputLocation) {
      vscode.window.showErrorMessage("No output location selected.");
      return;
    }

    await config.update('outputLocation', selectedOutputLocation, vscode.ConfigurationTarget.Global);
  });
}
