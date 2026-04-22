import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { countTokens } from '../utils/tokenCounter';
import { Minimatch } from 'minimatch';
import { showAIOpenOptions, changeOutputFormat } from '../utils/aiServices';
import { formatFolderOutput } from '../utils/formatter';
 

interface CopyResult {
    content: string;
    errors: string[];
    filesProcessed: number;
}

function shouldExclude(relativePath: string, excludePatterns: string[]): boolean {
    for (const pattern of excludePatterns) {
        const mm = new Minimatch(pattern, { dot: true, matchBase: true });
        if (mm.match(relativePath)) {
            return true;
        }
    }
    return false;
}

function isBinaryExtension(ext: string): boolean {
    const binaryExts = [
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.webp', '.svg', 
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
        '.exe', '.dll', '.so', '.dylib', '.bin',
        '.zip', '.tar', '.gz', '.bz2', '.7z', '.rar', 
        '.mp3', '.mp4', '.mov', '.avi', '.mkv', '.webm', 
        '.ttf', '.woff', '.woff2', '.eot', '.otf', 
        '.pyc', '.class', '.o', '.obj', 
        '.vsix', '.lock', '.log'
    ];
    return binaryExts.includes(ext.toLowerCase());
}

function getLanguageFromExtension(ext: string): string {
    const langMap: Record<string, string> = {
        '.ts': 'typescript', '.tsx': 'typescript',
        '.js': 'javascript', '.jsx': 'javascript',
        '.py': 'python',
        '.cpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp', '.h': 'cpp', '.hpp': 'cpp',
        '.c': 'c',
        '.java': 'java',
        '.go': 'go',
        '.rs': 'rust',
        '.rb': 'ruby',
        '.php': 'php',
        '.swift': 'swift',
        '.kt': 'kotlin',
        '.scala': 'scala',
        '.sh': 'shell', '.bash': 'shell',
        '.yaml': 'yaml', '.yml': 'yaml',
        '.json': 'json',
        '.xml': 'xml',
        '.html': 'html', '.htm': 'html',
        '.css': 'css', '.scss': 'scss', '.sass': 'sass', '.less': 'less',
        '.md': 'markdown',
        '.sql': 'sql',
        '.dockerfile': 'dockerfile',
        '.toml': 'toml',
        '.ini': 'ini',
        '.env': 'plaintext'
    };
    return langMap[ext.toLowerCase()] || '';
}

async function readFilesRecursively(
    dir: string,
    workspaceRoot: string,
    excludePatterns: string[],
    progress?: vscode.Progress<{ message?: string; increment?: number }>,
    stats?: { processed: number; total?: number }
): Promise<CopyResult> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    let content = '';
    const errors: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(workspaceRoot, fullPath).replace(/\\/g, '/');

        if (shouldExclude(relativePath, excludePatterns)) {
            continue;
        }

        if (entry.isDirectory()) {
            const subResult = await readFilesRecursively(fullPath, workspaceRoot, excludePatterns, progress, stats);
            content += subResult.content;
            errors.push(...subResult.errors);
        } else {

            if (progress && stats) {
                stats.processed++;
                progress.report({
                    message: `${relativePath} (${stats.processed}${stats.total ? ` / ${stats.total}` : ''})`,
                });
            }

            const ext = path.extname(entry.name);
            if (isBinaryExtension(ext)) {
                continue;
            }

            try {
                const fileContent = await fs.promises.readFile(fullPath, 'utf8');
                const lang = getLanguageFromExtension(ext);
                content += `// File: ${relativePath}\n\`\`\`${lang}\n${fileContent}\n\`\`\`\n\n`;
            } catch (err) {
                const errorMsg = `Could not read ${relativePath}: ${err instanceof Error ? err.message : String(err)}`;
                errors.push(errorMsg);
                console.error(errorMsg);
            }
        }
    }
    return { content, errors, filesProcessed: stats?.processed || 0 };
}

async function countFiles(dir: string, excludePatterns: string[]): Promise<number> {
    let count = 0;
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const relativePath = path.relative(dir, path.join(dir, entry.name)).replace(/\\/g, '/');
        if (shouldExclude(relativePath, excludePatterns)) continue;
        if (entry.isDirectory()) {
            count += await countFiles(path.join(dir, entry.name), excludePatterns);
        } else {
            const ext = path.extname(entry.name);
            if (!isBinaryExtension(ext)) {
                count++;
            }
        }
    }
    return count;
}

export async function copyFolderCommand(uri?: vscode.Uri) {
    let targetUri = uri;
    if (!targetUri) {
        const folder = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false
        });
        if (!folder || folder.length === 0) return;
        targetUri = folder[0];
    }

    const config = vscode.workspace.getConfiguration('copyForAI');
    const excludePatterns = config.get<string[]>('excludePatterns', ['node_modules', '.git', 'dist', '*.log', '*.vsix']);

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(targetUri);
    const workspaceRoot = workspaceFolder?.uri.fsPath || path.dirname(targetUri.fsPath);

    let totalFiles = 0;
    try {
        totalFiles = await countFiles(targetUri.fsPath, excludePatterns);
    } catch {
    }

    const stats = { processed: 0, total: totalFiles };

 const result = await vscode.window.withProgress<CopyResult>({
        location: vscode.ProgressLocation.Notification,
        title: `Copying folder: ${path.basename(targetUri.fsPath)}`,
        cancellable: false
    }, async (progress) => {
        return await readFilesRecursively(targetUri.fsPath, workspaceRoot, excludePatterns, progress, stats);
    });

    const formattedContent = formatFolderOutput(result.content, targetUri.fsPath);
    await vscode.env.clipboard.writeText(formattedContent);
    const tokenCount = countTokens(formattedContent);

    if (result.errors.length > 0) {
        const errorCount = result.errors.length;
        const action = await vscode.window.showWarningMessage(
            `Folder copied (${tokenCount} tokens), but ${errorCount} file(s) could not be read.`,
            'Show Details',
            'Open ChatGPT',
            'Open Claude'
        );
        if (action === 'Show Details') {
            const outputChannel = vscode.window.createOutputChannel('Copy for AI Errors');
            outputChannel.clear();
            outputChannel.appendLine(`Errors while copying folder: ${targetUri.fsPath}`);
            outputChannel.appendLine('='.repeat(50));
            result.errors.forEach(err => outputChannel.appendLine(err));
            outputChannel.show();
        } else if (action?.startsWith('Open')) {
            const urls: Record<string, string> = {
                'Open ChatGPT': 'https://chat.openai.com',
                'Open Claude': 'https://claude.ai'
            };
            await vscode.env.openExternal(vscode.Uri.parse(urls[action]));
        } else if (action?.startsWith('Format:')) {
            await changeOutputFormat();
        }
    } else {
        const message = `Folder contents copied (${tokenCount} tokens) for AI!`;
        const currentFormat = vscode.workspace.getConfiguration('copyForAI').get<string>('outputFormat') || 'markdown';
        await showAIOpenOptions(message, currentFormat);
    }
}