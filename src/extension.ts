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
import JsonTmLanguageCompletionItemProvider from './JsonTmLanguageCompletionItemProvider';
import jsonTmLanguageDiagnosticProvider from './jsonTmLanguageDiagnosticProvider'


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
    
    let diagnosticProvider = new jsonTmLanguageDiagnosticProvider();
    vscode.workspace.onDidChangeTextDocument(event => {
        diagnosticProvider.CreateDiagnostics(event.document);
    });
    
    context.subscriptions.push(fileConverter);
    context.subscriptions.push(convertToJsonCommand);
    context.subscriptions.push(convertToYamlCommand);
    context.subscriptions.push(convertToTmlCommand);
    context.subscriptions.push(convertToAutoCommand);
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
                        if (destinationLanguage === "yaml" || destinationLanguage == "yaml-tmlanguage"){
                            edit.insert(new vscode.Position(0, 0), YAML.stringify(parsed, 6))
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
