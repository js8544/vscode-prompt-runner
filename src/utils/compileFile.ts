import * as vscode from 'vscode';
import { compilePrompt } from '../prompt-file/promptFile';
import { PromptConfig } from './types';

export async function compileFile(): Promise<{ promptConfig: PromptConfig, compiledPrompt: string }> {
  const config = vscode.workspace.getConfiguration('prompt-runner');
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    throw new Error("No active editor found.");
  }

  const document = editor.document;

  const prompt = document.getText();

  const { promptConfig, compiledPrompt } = await compilePrompt(prompt, document);

  if (!compiledPrompt) {
    vscode.window.showErrorMessage("Failed to compile prompt.");
    throw new Error("Failed to compile prompt.");
  }

  return { promptConfig, compiledPrompt };
}
