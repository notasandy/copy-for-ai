import * as vscode from 'vscode';

export async function checkLicense(context: vscode.ExtensionContext): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('copyForAI');
    const key = config.get<string>('licenseKey') || '';
    return key === 'DEMO';
}
