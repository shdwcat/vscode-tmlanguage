'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {join, basename} from 'path';

var plist  = require("plist");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "my-first-extension" is now active!');

    let fileConverter = new FileConverter();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var convertFileCommand = vscode.commands.registerCommand('extension.convertFile', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        //window.showInformationMessage('Hello World!');
        fileConverter.convertFile();
        
    });
    
    let previewUri = vscode.Uri.parse('css-preview://authority/css-preview');
    
    class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        public provideTextDocumentContent(uri: vscode.Uri): string {
            //return this.createCssSnippet();
            return JSON.stringify({ "TestProperty" : "test"});
        }
        
        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }       
    }
    
    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('css-preview', provider);

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        if (e.document === vscode.window.activeTextEditor.document) {
            provider.update(previewUri);
        }
    });

    vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
        if (e.textEditor === vscode.window.activeTextEditor) {
            provider.update(previewUri);
        }
    })

    let disposable = vscode.commands.registerCommand('extension.showCssPropertyPreview', () => {
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two).then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });

    });
    context.subscriptions.push(disposable, registration);
    
    context.subscriptions.push(fileConverter);
    context.subscriptions.push(convertFileCommand);
}


class FileConverter{
    public convertFile()    {
        // Get the current text editor
        let editor = vscode.window.activeTextEditor;
   
        if (!editor){
            return;
        }
        
        let doc = editor.document;
     
        var language = doc.languageId;
        if (language === "xml")
        {
            var text = doc.getText();
            var parsed = plist.parse(text);

            try{
                var json = require('format-json');
                const path = join(vscode.workspace.rootPath, './newfile.JSON-tmlanguage');


		        return vscode.workspace.openTextDocument( vscode.Uri.parse('untitled:' + path)).then(doc => {
                    var t1 = doc.uri.scheme;
                    var t2 = doc.isDirty;  
                    
                    return vscode.window.showTextDocument(doc)
                    .then(editor => {
                        return editor.edit(edit => {
                            edit.insert(new vscode.Position(0, 0), json.plain(parsed));
                        });
                    });
                },
                err => {
                    var sdf = 3;
                });
            } catch(err)        {
                var sdf = 3;
            }
        }
    }
    
     dispose() {
        //this._statusBarItem.dispose();
    }
}
