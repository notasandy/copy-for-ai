import * as vscode from 'vscode';
import * as path from 'path';
import { countTokens } from '../utils/tokenCounter';
import { showAIOpenOptions } from '../utils/aiServices';
import { formatCodeBlock } from '../utils/formatter';

export async function copyCodeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const selectedText = document.getText(selection);

    if (!selectedText) {
        vscode.window.showWarningMessage('No text selected');
        return;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const relativePath = workspaceFolder
        ? path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath)
        : document.fileName;

    const startLine = selection.start.line + 1;
    const endLine = selection.end.line + 1;
    const lineInfo = startLine === endLine
        ? ` (line ${startLine})`
        : ` (lines ${startLine}-${endLine})`;

    const output = formatCodeBlock(relativePath, selectedText, document.languageId, lineInfo);
    const tokenCount = countTokens(output);

    await vscode.env.clipboard.writeText(output);
    const lines = selectedText.split('\n').length;
    const message = `Copied ${lines} lines (${tokenCount} tokens) for AI context!`;

    const currentFormat = vscode.workspace.getConfiguration('copyForAI').get<string>('outputFormat') || 'markdown';
    await showAIOpenOptions(message, currentFormat);
}