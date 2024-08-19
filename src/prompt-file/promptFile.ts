import Handlebars from "handlebars";
import * as vscode from 'vscode';
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';
import { PromptConfig } from '../utils/types';

// Helpers
/**
 * Registering the include helper to read and insert the content of a file.
 */
Handlebars.registerHelper('include', function (filePath: string) {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const activeDocument = activeEditor.document;
    const activeDocumentPath = activeDocument.uri.fsPath;
    filePath = path.resolve(path.dirname(activeDocumentPath), filePath);
  }
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  } else {
    throw new Error(`File not found: ${fullPath}`);
  }
});

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

      if (paramsExpressionList.length > 0) {
        return paramsExpressionList.filter((param) => param.type === 'PathExpression').map((param) => param.original);
      } else {
        return [pathExpression.original];
      }
    }).flat();

  // console.log("handlebars vars: ", variables);
  return variables;
};

export async function compilePrompt(content: string, document?: vscode.TextDocument): Promise<{ promptConfig: PromptConfig, compiledPrompt: string }> {
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
