import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function image(url: string) {
  // if image is a web url, use the url directly
  // otherwise, encode the image as base64
  var result = url;
  if (!url.startsWith('http')) {
    // replace ./ with the directory of the current file.

    var baseDir = process.cwd();
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const activeDocument = activeEditor.document;
      const activeDocumentPath = activeDocument.uri.fsPath;
      baseDir = path.dirname(activeDocumentPath);
    }

    var fullPath = url;
    if (fullPath.startsWith('~')) {
      fullPath = fullPath.replace('~', os.homedir());
    }

    fullPath = path.resolve(baseDir, fullPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'base64');
      result = `data:image/png;base64,${content}`;
    } else {
      throw new Error(`File not found: ${fullPath}`);
    }
  }
  return `<img src="${result}" />`;
}
