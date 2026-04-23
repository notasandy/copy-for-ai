import * as vscode from 'vscode';

export async function supportCommand() {
    const items: vscode.QuickPickItem[] = [
        {
            label: '$(gift) DonationAlerts',
            description: 'Поддержать рублями (карты РФ)',
            detail: 'https://www.donationalerts.com/r/notasandy'
        },
        {
            label: '$(circuit-board) Crypto & More',
            description: 'USDT, BTC, ETH – красивая страница с QR',
            detail: 'https://notasandy.github.io/copy-for-ai/donate'
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