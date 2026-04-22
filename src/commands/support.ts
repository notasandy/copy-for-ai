import * as vscode from 'vscode';

export async function supportCommand() {
    const items: vscode.QuickPickItem[] = [
        {
            label: '$(heart) GitHub Sponsors',
            description: 'Monthly or one-time donation via GitHub',
            detail: 'https://github.com/sponsors/your-github-username' // ← замените
        },
        {
            label: '$(coffee) Buy Me a Coffee',
            description: 'One-time donation',
            detail: 'https://buymeacoffee.com/your-username' // ← замените
        }
    ];

    const choice = await vscode.window.showQuickPick(items, {
        placeHolder: 'Choose how you want to support the project',
        title: '💙 Support Copy for AI'
    });

    if (choice) {
        await vscode.env.openExternal(vscode.Uri.parse(choice.detail!));
    }
}