'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {join, basename} from 'path';

var plist  = require("plist");
var json = require('format-json');
var YAML = require('yamljs');

//var jisonTest = require('./JisonTest.js');
import * as jisonTest from './JisonTest';
var Parser = require("jison").Parser;


export const JSON_FILE: vscode.DocumentFilter = { language: 'json-tmlanguage', scheme: 'file' };

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "my-first-extension" is now active!');

    let fileConverter = new FileConverter();

    var convertToJsonCommand = vscode.commands.registerCommand('extension.convertToJsonTml', () => {
        fileConverter.convertFileToJsonTml();
    });
    var convertToYamlCommand = vscode.commands.registerCommand('extension.convertToYamlTml', () => {
        fileConverter.convertFileToYamlTml();
    });
    var convertToTmlCommand = vscode.commands.registerCommand('extension.convertToTml', () => {
        fileConverter.convertFileToTml();
    });
    var convertToAutoCommand = vscode.commands.registerCommand('extension.convertTo', () => {
        fileConverter.convertFileToAuto();
    });
    
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(JSON_FILE, new JsonTmLanguageCompletionItemProvider(), '#'));
    
    context.subscriptions.push(fileConverter);
    context.subscriptions.push(convertToJsonCommand);
    context.subscriptions.push(convertToYamlCommand);
    context.subscriptions.push(convertToTmlCommand);
    context.subscriptions.push(convertToAutoCommand);
}

export class JsonTmLanguageCompletionItemProvider implements vscode.CompletionItemProvider{
    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {      
        return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
            try{
                var text = document.getText();
                
                var t = new jisonTest.JisonTest();
                var grammar = t.grammar;
                var parser = new Parser(grammar);
                var docContent = parser.parse(text);
                // Not as simple as parsing. Will need to look at lexical analysers again.
                //var docContent = JSON.parse(text);
                
                var completion : vscode.CompletionItem[] = [];
                
                var options = Object.getOwnPropertyNames(docContent.repository).sort();
                for(var option in options)                {
                    var t3 = new vscode.CompletionItem(options[option]);
                    t3.kind = vscode.CompletionItemKind.Keyword;
                    t3.insertText = options[option];
                    completion.push(t3);
                }
                return resolve(completion);
            }
            catch(err){
                return reject();
            }
        });
    }
}

class FileConverter{
    public convertFileToJsonTml()    {
        return this.ConvertFile( "json-tmlanguage");
    }
    
    public convertFileToYamlTml(){
        return this.ConvertFile( "yaml-tmlanguage");
    }
    
    public convertFileToTml(){
        return this.ConvertFile( "tmlanguage");
    }
    
    public convertFileToAuto(){
        return this.ConvertFile( "yaml-tmlanguage");
    }
    
    private ConvertFile(destinationLanguage: string){
        let editor = vscode.window.activeTextEditor;
   
        if (!editor){
            return;
        }        
        let doc = editor.document;
        var filename = doc.fileName.split("\\").pop().split('.').shift();
        
        try{
            var extension: string;
            switch (destinationLanguage) {
                case "json-tmlanguage":
                    extension = "JSON-tmLanguage";
                    break;
                case "yaml-tmlanguage":
                    extension = "YAML-tmLanguage";
                    break;
                case "tmlanguage":
                    extension = "tmLanguage";
                    break;
                default:
                    break;
            }
            var documentText = doc.getText();
            
            var sourceLanguage = doc.languageId;
            const path = join(vscode.workspace.rootPath, './' + filename + '.' + extension);

            return vscode.workspace.openTextDocument( vscode.Uri.parse('untitled:' + path)).then(doc => {
                return vscode.window.showTextDocument(doc)
                .then(editor => {
                    return editor.edit(edit => {
                        var parsed: any;                      
                        
                        if (sourceLanguage === "xml" || sourceLanguage == "tmlanguage"){
                            parsed = plist.parse(documentText);    
                        }
                        if (sourceLanguage === "json" || sourceLanguage == "json-tmlanguage"){
                            parsed = JSON.parse(documentText);
                        }
                        if (sourceLanguage === "yaml" || sourceLanguage == "yaml-tmlanguage"){
                            parsed = YAML.parse(documentText);
                        }
                        
                        if (parsed === undefined || parsed === ""){
                            // Display a message?
                            return;
                        }
                        
                        if (destinationLanguage === "json" || destinationLanguage === "json-tmlanguage"){
                            edit.insert(new vscode.Position(0, 0), json.plain(parsed));    
                        }
                        if (destinationLanguage === "xml" || destinationLanguage === "tmlanguage"){
                            edit.insert(new vscode.Position(0, 0), plist.build(parsed));
                        }
                        if (sourceLanguage === "yaml" || sourceLanguage == "yaml-tmlanguage"){
                            edit.insert(new vscode.Position(0, 0), YAML.stringify(parsed))
                        } 
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
    
     dispose() {
        //this._statusBarItem.dispose();
    }
}
