import * as vscode from 'vscode';
import { copyCodeCommand } from './commands/copyCode';
import { copyFolderCommand } from './commands/copyFolder';
import { copyStructureCommand } from './commands/copyStructure';
import { supportCommand } from './commands/support';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "Copy for AI" is now active!');

    const copyCode = vscode.commands.registerCommand('copy-for-ai.copyCode', copyCodeCommand);
    const copyFolder = vscode.commands.registerCommand('copy-for-ai.copyFolder', copyFolderCommand);
    const copyStructure = vscode.commands.registerCommand('copy-for-ai.copyStructure', copyStructureCommand);
    context.subscriptions.push(copyCode, copyFolder, copyStructure);
    const support = vscode.commands.registerCommand('copy-for-ai.support', supportCommand);
    context.subscriptions.push(support);
    const usageCount = context.globalState.get<number>('usageCount', 0);
    context.globalState.update('usageCount', usageCount + 1);

    if (usageCount === 10) {
        vscode.window.showInformationMessage(
            '💙 Enjoying Copy for AI? Support the project via "Copy for AI: Support the Project" in the command palette.',
            'Support Now'
        ).then(selection => {
            if (selection === 'Support Now') {
                vscode.commands.executeCommand('copy-for-ai.support');
            }
        });
    }
}

export function deactivate() {}
