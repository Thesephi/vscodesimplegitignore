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
    let disposable: vscode.Disposable = vscode.commands.registerCommand('extension.simplegitignore', () => {
        simplegitignore();
    });

    context.subscriptions.push(disposable);
}

/**
 * Our main plugin function. Invoked when ext is activated
 */
async function simplegitignore(): Promise<void> {

    const destinationDir: string | undefined = await getDirToPlaceGitignoreFile();
    if(!destinationDir) {
        vscode.window.showWarningMessage("Cannot determine which directory to place " +
            ".gitignore file. Please try again and select a workspace to proceed.");
        return;
    }

    const stBarMsgDisposable: vscode.Disposable = vscode.window.setStatusBarMessage("Preparing .gitignore...");
    exec("npx simplegitignore", {
            cwd: destinationDir
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

async function getDirToPlaceGitignoreFile(): Promise<string | undefined> {
    const folders: vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;
    if(!folders || !folders.length) return;

    let dir: string | undefined;
    if(folders.length > 1)
        dir = await getSelectedWorkspaceFolderPathFromUser();
    else
        dir = folders[0].uri.path;

    return dir;
}

async function getSelectedWorkspaceFolderPathFromUser(): Promise<string | undefined> {
    return new Promise((resolve: (val?: string) => void, reject: (reason: any) => void) => {
        vscode.window.showWorkspaceFolderPick({
            placeHolder: "Please choose a workspace directory to put the .gitignore file in..."
        }).then((wf: vscode.WorkspaceFolder | undefined): void => {
            return resolve(wf ? wf.uri.path : undefined);
        }, reject);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}