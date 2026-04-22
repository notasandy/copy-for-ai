import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { countTokens } from '../utils/tokenCounter'; 
import { showAIOpenOptions } from '../utils/aiServices';
import { formatStructureOutput } from '../utils/formatter';
    
function generateTree(dir: string, prefix: string = '', workspaceRoot: string): string {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let tree = '';

    const filtered = entries.filter(e => !e.name.startsWith('.') && e.name !== 'node_modules');
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < filtered.length; i++) {
        const entry = filtered[i];
        const isLast = i === filtered.length - 1;
        const linePrefix = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        tree += `${prefix}${linePrefix}${entry.name}\n`;

        if (entry.isDirectory()) {
            tree += generateTree(path.join(dir, entry.name), prefix + childPrefix, workspaceRoot);
        }
    }
    return tree;
}

export async function copyStructureCommand(uri?: vscode.Uri) {
    let targetUri = uri;
    if (!targetUri) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace opened');
            return;
        }
        targetUri = workspaceFolders[0].uri;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(targetUri);
    const root = workspaceFolder?.uri.fsPath || targetUri.fsPath;
    const rootName = path.basename(root);

    const tree = `${rootName}\n${generateTree(root, '', root)}`;
    const output = formatStructureOutput(tree, rootName);
    const tokenCount = countTokens(output);

    await vscode.env.clipboard.writeText(output);
    const message = `Project structure copied (${tokenCount} tokens)!`;
    const currentFormat = vscode.workspace.getConfiguration('copyForAI').get<string>('outputFormat') || 'markdown';
    await showAIOpenOptions(message, currentFormat);
}
