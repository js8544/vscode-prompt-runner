import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/*
  * Include a file in the prompt file.
  * 
  * @param filePath The path of the file to include.
  * @returns The content of the included file.
*/
export function include(filePath: string) {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const activeDocument = activeEditor.document;
    const activeDocumentPath = activeDocument.uri.fsPath;
    filePath = path.resolve(path.dirname(activeDocumentPath), filePath);
  }
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  } else {
    throw new Error(`File not found: ${fullPath}`);
  }
}
