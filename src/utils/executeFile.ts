import * as vscode from 'vscode';
import { Provider } from './types';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOllama } from 'ollama-ai-provider';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { displayInOutputChannel, displayInWebviewPanel } from './outputHandlers';
import { compileFile } from './compileFile';
import type { CoreMessage } from 'ai';

export async function executeFileWithProviderAndModel(providers: Provider[], providerName: string, model: string) {

  const { promptConfig, messages, inputValues } = await compileFile();

  if (!messages || messages.length === 0) {
    vscode.window.showErrorMessage("Failed to compile prompt.");
    return;
  }

  providerName = promptConfig.provider || providerName;
  model = promptConfig.model || model;

  const provider = providers.find(p => p.name === providerName);
  if (!provider) {
    vscode.window.showErrorMessage(`Provider ${providerName} not found.`);
    return;
  }

  // verify that the model is supported by the provider
  if (!provider.models.includes(model)) {
    vscode.window.showErrorMessage(`Model ${model} not supported by provider ${providerName}.`);
    return;
  }

  const config = vscode.workspace.getConfiguration('prompt-runner');
  const outputLocation = config.get<string>('outputLocation');

  try {
    let providerModel;
    switch (provider.type) {
      case 'openai':
        providerModel = createOpenAI({
          apiKey: provider.api_key,
          baseURL: provider.base_url ?? undefined,
          organization: provider.organization_id ?? undefined,
          project: provider.project_id ?? undefined,
          compatibility: 'strict',
        })(model);
        break;
      case 'ollama':
        providerModel = createOllama({
          baseURL: provider.base_url || 'http://127.0.0.1:11434/api',
        })(model);
        break;
      case 'anthropic':
        providerModel = createAnthropic({
          apiKey: provider.api_key,
          baseURL: provider.base_url ?? undefined,
        })(model);
        break;
      case 'gemini': 
        providerModel = createGoogleGenerativeAI({
          apiKey: provider.api_key,
          baseURL: provider.base_url ?? undefined,
        })(model);
        break;
      case 'mistral': 
        providerModel = createMistral({
          apiKey: provider.api_key,
          baseURL: provider.base_url ?? undefined,
        })(model);
        break;
      case 'groq': 
        providerModel = createOpenAI({
          apiKey: provider.api_key,
          baseURL: provider.base_url ?? undefined,
          compatibility: 'strict',
        })(model);
        break;
      default:
        vscode.window.showErrorMessage(`Provider ${providerName} not supported yet.`);
        return;
    }

    const { textStream, usage } = await streamText({
      model: providerModel!,
      messages: messages as CoreMessage[],
      maxTokens: promptConfig.max_tokens,
      temperature: promptConfig.temperature,
      topP: promptConfig.top_p,
    });

    switch (outputLocation) {
      case 'webview panel':
        displayInWebviewPanel(textStream, usage);
        break;
      case 'output channel':
      default:
        displayInOutputChannel(textStream, usage);
        break;
    }
  } catch (error: any) {
    console.log(error);
    vscode.window.showErrorMessage(`Failed to execute prompt: ${error.message}`);
  }
}
