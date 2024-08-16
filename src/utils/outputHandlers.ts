import { marked } from 'marked';
import * as vscode from 'vscode';

export function displayInOutputChannel(stream: AsyncIterable<string>) {
  const outputChannel = vscode.window.createOutputChannel("Prompt Runner Output");
  outputChannel.show();

  (async () => {
    for await (const chunk of stream) {
      const output = chunk || '';
      outputChannel.append(output);
    }
    outputChannel.appendLine("\n\n[Stream Complete]");
  })();
}

export function displayInWebviewPanel(stream: AsyncIterable<string>) {
  const panel = vscode.window.createWebviewPanel(
    'promptRunnerOutput',
    'Prompt Runner Output',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  let output = '';

  (async () => {
    for await (const chunk of stream) {
      const chunkContent = chunk || '';
      output += chunkContent;
      panel.webview.html = getWebviewContent(output);
    }
  })();
}

function getWebviewContent(markdown: string): string {
  const htmlContent = marked(markdown); // Convert Markdown to HTML
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prompt Runner Markdown Output</title>
        <style>
            body { font-family: sans-serif; padding: 10px; }
            .markdown-body {
                box-sizing: border-box;
                min-width: 200px;
                max-width: 980px;
                margin: 0 auto;
                padding: 45px;
            }
            .markdown-body h1 {
                font-size: 2em;
                margin: 0.67em 0;
            }
            /* Add more styles here as needed */
        </style>
    </head>
    <body class="markdown-body">
        ${htmlContent}
    </body>
    </html>`;
}
