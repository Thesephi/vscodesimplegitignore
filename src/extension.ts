'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "simplegitignore" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.simplegitignore', () => {
        simplegitignore();
    });

    context.subscriptions.push(disposable);
}

/**
 * Our main plugin function. Invoked when ext is activated
 */
function simplegitignore(): void {

    const folders: vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;
    if(!folders || !folders.length) return;
    const folder: vscode.WorkspaceFolder = folders[0];

    const stBarMsgDisposable: vscode.Disposable = vscode.window.setStatusBarMessage("Preparing .gitignore...");
    exec("npx simplegitignore", {
            cwd: folder.uri.path
        },
        (err: Error | null, stdout: string, stderr: string): void => {
            stBarMsgDisposable.dispose();
            if(err) {
                console.error(err);
                vscode.window.showErrorMessage("Unabled to write .gitignore file");
                return;
            }
            if(stdout && stderr && stderr.trim().endsWith("done")) simplegitignoreStdout(stdout);
            if(stderr) console.error(stderr);
        });

}

function simplegitignoreStdout(stdout: string): void {
    console.log(stdout);
    vscode.window.showInformationMessage(`${stdout} written`, { modal: false }, "Open File")
        .then((value?: string): void => {
            if(value !== "Open File") return;
            vscode.workspace.openTextDocument(stdout.trim())
                .then(vscode.window.showTextDocument, (err: Error): void => {
                    vscode.window.showErrorMessage(err.message || `Unabled to open ${stdout}`);
                });
        });
}

// this method is called when your extension is deactivated
export function deactivate() {
}