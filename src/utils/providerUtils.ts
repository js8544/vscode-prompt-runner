import * as vscode from 'vscode';
import { Provider } from './types';

export function getProviders(config: vscode.WorkspaceConfiguration): Provider[] {
  return config.get('providers') as Provider[] || [];
}
