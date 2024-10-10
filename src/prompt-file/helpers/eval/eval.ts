
import { executePromptOllama } from "../../../providers/ollama";
import { executePromptOpenAI } from "../../../providers/openai";
import { executePromptAnthropic } from "../../../providers/anthropic";
import logger from "../../../utils/logger";
import { Provider } from "../../../utils/types";
import { compilePrompt } from "../../promptFile";
import { include } from "../include/include";
import * as vscode from 'vscode';

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

  var stream;
  switch (provider.type) {
    case 'openai':
      stream = await executePromptOpenAI(provider, model, messages, promptConfig);
      break;
    case 'ollama':
      stream = await executePromptOllama(provider, model, messages, promptConfig);
      break;
    case 'anthropic':
      stream = await executePromptAnthropic(provider, model, messages, promptConfig);
      break;
    // case 'copilot':
    //   stream = await executePromptCopilot(provider, model, prompt);
    default:
      throw new Error(`Provider ${providerName} not supported yet.`);
  }

  var result = '';
  for await (const chunk of stream) {
    const chunkContent = chunk || '';
    result += chunkContent;
  }

  return result;
}
