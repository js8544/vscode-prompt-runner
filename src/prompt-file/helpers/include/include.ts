import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import logger from '../../../utils/logger';

/*
  * Include a file in the prompt file.
  * 
  * @param filePath The path of the file to include.
  * @returns The content of the included file.
*/
export function include(filePath: string) {
  // replace ./ with the directory of the current file.

  logger.info("Including file " + filePath);
  var baseDir = process.cwd();
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const activeDocument = activeEditor.document;
    const activeDocumentPath = activeDocument.uri.fsPath;
    baseDir = path.dirname(activeDocumentPath);
  }

  var fullPath = filePath;
  if (fullPath.startsWith('~')) {
    fullPath = fullPath.replace('~', os.homedir());
  }

  fullPath = path.resolve(baseDir, fullPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    return content;
  } else {
    throw new Error(`File not found: ${fullPath}`);
  }
}
