import logger from "../../../utils/logger";
import { Provider } from "../../../utils/types";
import { compilePrompt } from "../../promptFile";
import { include } from "../include/include";
import * as vscode from 'vscode';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOllama } from 'ollama-ai-provider';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import type { CoreMessage } from 'ai';

export async function evaluate(fileName: string, options: any): Promise<String> {
  logger.info("Evaluating file " + fileName);

  // read file
  const content = include(fileName);

  var inputValues: { [key: string]: string } = {};
  if (options.hash) {
    Object.keys(options.hash).forEach(key => {
      inputValues[key] = options.hash[key];
    });
  }

  // compile prompt
  const { promptConfig, messages } = await compilePrompt(content, inputValues);

  const extensionConfig = vscode.workspace.getConfiguration('prompt-runner');
  const defaultProvider = extensionConfig.get('defaultProvider') as string;
  const defaultModel = extensionConfig.get('defaultModel') as string;

  const providerName = promptConfig.provider || defaultProvider;
  const model = promptConfig.model || defaultModel;

  const providers = extensionConfig.get('providers') as Provider[];
  const provider = providers.find(p => p.name === providerName);
  if (!provider) {
    throw new Error(`Provider ${providerName} not found.`);
  }

  // verify that the model is supported by the provider
  if (!provider.models.includes(model)) {
    throw new Error(`Model ${model} not supported by provider ${providerName}.`);
  }

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
      throw new Error(`Provider ${providerName} not supported yet.`);
  }

  const { textStream } = await streamText({
    model: providerModel!,
    messages: messages as CoreMessage[],
    maxTokens: promptConfig.max_tokens,
    temperature: promptConfig.temperature,
    topP: promptConfig.top_p,
  });

  var result = '';
  for await (const chunk of textStream) {
    const chunkContent = chunk || '';
    result += chunkContent;
  }

  return result;
}
