import Handlebars from "handlebars";
import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { Message, PromptConfig, Provider } from '../utils/types';
import { helpers } from './helpers/helper';
import asyncHelpers from "handlebars-async-helpers-ts";
import { extractMessages } from "./extractMessages";


const hb: typeof Handlebars = asyncHelpers(Handlebars);
hb.registerHelper(helpers);

/**
 * Getting the variables from the Handlebars template.
 * Supports helpers too.
 * @param input
 */
function getHandlebarsVariables(input: string): string[] {
  const ast: hbs.AST.Program = Handlebars.parseWithoutProcessing(input);

  const variables = ast.body.filter(({ type }: hbs.AST.Statement) => (
    type === 'MustacheStatement'
  ))
    .map((statement: hbs.AST.Statement) => {
      const moustacheStatement: hbs.AST.MustacheStatement = statement as hbs.AST.MustacheStatement;
      const paramsExpressionList = moustacheStatement.params as hbs.AST.PathExpression[];
      const pathExpression = moustacheStatement.path as hbs.AST.PathExpression;

      if (paramsExpressionList.length > 0) {
        return paramsExpressionList.filter((param) => param.type === 'PathExpression').map((param) => param.original);
      } else {
        return [pathExpression.original];
      }
    }).flat().reduce((acc: string[], curr: string) => {
      if (acc.includes(curr)) {
        return acc;
      }
      return [...acc, curr];
    }, []);

  // console.log("handlebars vars: ", variables);
  return variables;
};

function verifyConfig(promptConfig: PromptConfig): void {
  const config = vscode.workspace.getConfiguration('prompt-runner');
  if (promptConfig.model || promptConfig.provider) {
    // check that provider and model is supported
    const providers = config.get('providers') as Provider[];
    const provider = providers.find(p => p.name === promptConfig.provider);
    if (!provider) {
      throw new Error(`Provider ${promptConfig.provider} not found.`);
    }
    if (promptConfig.model && !provider.models.includes(promptConfig.model)) {
      throw new Error(`Model ${promptConfig.model} not supported by provider ${provider.name}.`);
    }
  }
}

export async function compilePrompt(content: string, document?: vscode.TextDocument): Promise<{ promptConfig: PromptConfig, messages: Message[], inputValues: any }> {
  // Step 1: Split the content by "---" and parse the YAML config if present
  // ignore the starting "---\n"
  content = content.trim();
  if (content.startsWith("---\n")) {
    content = content.slice(4);
  }
  // console.log("content: ", content);
  const parts = content.split('\n---\n');
  // console.log("parts: ", parts);
  let promptConfig: PromptConfig = {};
  let templateContent: string;

  if (parts.length > 1) {
    promptConfig = yaml.parse(parts[0].trim());
    templateContent = parts.slice(1).join('\n---\n').trim();
  } else {
    templateContent = parts[0].trim();
  }

  verifyConfig(promptConfig);

  // Step 2: Extract variables needed and show input boxes for user input
  const variables = getHandlebarsVariables(templateContent);
  const inputValues: { [key: string]: string } = {};

  for (const variable of variables) {
    const userInput = await vscode.window.showInputBox({ prompt: `Enter value for ${variable}` });
    if (userInput !== undefined) {
      inputValues[variable] = userInput;
    } else {
      throw new Error(`No input provided for variable: ${variable}`);
    }
  }

  // Step 3: Compile the template using Handlebars
  const template = hb.compile(templateContent, { noEscape: true });
  const compiledPrompt = await template(inputValues);

  console.log("compiledPrompt: ", compiledPrompt);

  // Step 4: Extract messages from the compiled prompt
  const messages = extractMessages(compiledPrompt);

  return { promptConfig, messages, inputValues };
}
