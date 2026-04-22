import * as vscode from 'vscode';

export function formatCodeBlock(
    filePath: string,
    code: string,
    language: string,
    lineInfo: string = ''
): string {
    const config = vscode.workspace.getConfiguration('copyForAI');
    const format = config.get<string>('outputFormat') || 'markdown';

    switch (format) {
        case 'plain':
            return code;
        case 'xml':
            return `<file path="${filePath}${lineInfo}">\n${code}\n</file>`;
        case 'markdown':
        default:
            return `// File: ${filePath}${lineInfo}\n\`\`\`${language}\n${code}\n\`\`\``;
    }
}

/**
 * Форматирует содержимое всей папки в зависимости от выбранного формата.
 * Для XML оборачивает всё в <project>.
 */
export function formatFolderOutput(content: string, folderPath: string): string {
    const config = vscode.workspace.getConfiguration('copyForAI');
    const format = config.get<string>('outputFormat') || 'markdown';

    if (format === 'xml') {
        return `<project folder="${folderPath}">\n${content}\n</project>`;
    }
    return content;
}

/**
 * Форматирует вывод структуры проекта.
 */
export function formatStructureOutput(tree: string, rootName: string): string {
    const config = vscode.workspace.getConfiguration('copyForAI');
    const format = config.get<string>('outputFormat') || 'markdown';

    if (format === 'plain') {
        return tree;
    } else if (format === 'xml') {
        return `<structure root="${rootName}">\n${tree}\n</structure>`;
    } else {
        return `Project structure:\n\`\`\`\n${tree}\`\`\``;
    }
}