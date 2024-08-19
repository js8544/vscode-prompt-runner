import Handlebars from "handlebars";
import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { PromptConfig } from '../utils/types';
/**
 * Getting the variables from the Handlebars template.
 * Supports helpers too.
 * @param input
 */
const getHandlebarsVariables = (input: string): string[] => {
  const ast: hbs.AST.Program = Handlebars.parseWithoutProcessing(input);

  const variables = ast.body.filter(({ type }: hbs.AST.Statement) => (
    type === 'MustacheStatement'
  ))
    .map((statement: hbs.AST.Statement) => {
      const moustacheStatement: hbs.AST.MustacheStatement = statement as hbs.AST.MustacheStatement;
      const paramsExpressionList = moustacheStatement.params as hbs.AST.PathExpression[];
      const pathExpression = moustacheStatement.path as hbs.AST.PathExpression;

      return paramsExpressionList[0]?.original || pathExpression.original;
    });

  // console.log("handlebars vars: ", variables);
  return variables;
};

export async function compilePrompt(content: string): Promise<{ promptConfig: PromptConfig, compiledPrompt: string }> {
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
  const template = Handlebars.compile(templateContent);
  const compiledPrompt = template(inputValues);

  // console.log("compiledPrompt: ", compiledPrompt);
  // console.log("promptConfig: ", promptConfig);
  return { promptConfig, compiledPrompt };
}
