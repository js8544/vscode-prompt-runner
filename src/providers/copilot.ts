import * as vscode from 'vscode';
import { Provider } from '../utils/types';

export async function executePromptCopilot(provider: Provider, model: string, prompt: string): Promise<AsyncIterable<any>> {
  const models = await vscode.lm.selectChatModels({
    vendor: "copilot",
    family: model,
  });

  if (models.length === 0) {
    throw new Error('Selected model not available for the Copilot vendor.');
  }

  const selectedModel = models[0]; // For simplicity, just pick the first model returned
  const response = await selectedModel.sendRequest(
    [
      vscode.LanguageModelChatMessage.User(prompt)
    ],
    {},
    new vscode.CancellationTokenSource().token
  );

  return response.text;
}
