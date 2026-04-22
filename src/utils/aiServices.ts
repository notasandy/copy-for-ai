import * as vscode from 'vscode';

export async function showAIOpenOptions(message: string, currentFormat?: string) {
    const buttons = ['Open ChatGPT', 'Open Claude', 'Open Perplexity'];
    if (currentFormat) {
        buttons.push(`Format: ${currentFormat}`);
    }

    const choice = await vscode.window.showInformationMessage(message, ...buttons);

    const urls: Record<string, string> = {
        'Open ChatGPT': 'https://chat.openai.com',
        'Open Claude': 'https://claude.ai',
        'Open Perplexity': 'https://perplexity.ai'
    };

    if (choice && urls[choice]) {
        await vscode.env.openExternal(vscode.Uri.parse(urls[choice]));
    } else if (choice?.startsWith('Format:')) {
        await changeOutputFormat();
    }
}

export async function changeOutputFormat() {
    const config = vscode.workspace.getConfiguration('copyForAI');
    const current = config.get<string>('outputFormat') || 'markdown';

    const formats: vscode.QuickPickItem[] = [
        { label: 'Markdown', description: 'Code blocks with file paths and syntax highlighting', picked: current === 'markdown' },
        { label: 'Plain', description: 'Only the code, no extra formatting', picked: current === 'plain' },
        { label: 'XML', description: 'Wrapped in <file> tags (ideal for Claude)', picked: current === 'xml' }
    ];

    const selected = await vscode.window.showQuickPick(formats, {
        placeHolder: 'Select output format for Copy for AI',
        title: 'Change Output Format'
    });

    if (selected) {
        const newFormat = selected.label.toLowerCase();
        await config.update('outputFormat', newFormat, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Output format changed to ${selected.label}`);
    }
}