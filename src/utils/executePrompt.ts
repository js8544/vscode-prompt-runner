import * as vscode from 'vscode';
import { Provider } from './types';
import { executePromptOpenAI } from '../providers/openai';

export async function executePromptWithProviderAndModel(providers: Provider[], providerName: string, model: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return;
  }

  const document = editor.document;
  const prompt = document.getText();

  const provider = providers.find(p => p.name === providerName);
  if (!provider) {
    vscode.window.showErrorMessage(`Provider ${providerName} not found.`);
    return;
  }

  if (provider.type !== "openai" && provider.type !== "ollama") {
    vscode.window.showErrorMessage(`Provider type ${provider.type} not supported yet. Only openai and ollama are supported.`);
    return;
  }

  try {
    const outputChannel = vscode.window.createOutputChannel("Prompt Runner");
    outputChannel.show();

    const stream = await executePromptOpenAI(provider, model, prompt);

    // Process the streaming response
    for await (const chunk of stream) {
      outputChannel.append(chunk.choices[0]?.delta?.content || '');
    }

    outputChannel.appendLine("\n\n[Stream Complete]");
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to execute prompt: ${error.message}`);
  }
}
