'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

var plist = require('plist');
var json = require('format-json');
var YAML = require('yamljs');

//var jisonTest = require('./JisonTest.js');
import * as jisonTest from './JisonTest';
var Parser = require("jison").Parser;
import JsonTmLanguageCompletionItemProvider from './JsonTmLanguageCompletionItemProvider';
import jsonTmLanguageDiagnosticProvider from './jsonTmLanguageDiagnosticProvider';


export const JSON_FILE: vscode.DocumentFilter = { language: 'json-tmlanguage', scheme: 'file' };

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "my-first-extension" is now active!');

    console.log("Loading tmLanguage extension");
    try {

        let fileConverter = new FileConverter();

        var convertToJsonCommand = vscode.commands.registerCommand('extension.convertToJsonTml', () => {
            fileConverter.convertFileToJsonTml();
        });
        context.subscriptions.push(convertToJsonCommand);
        
        var convertToYamlCommand = vscode.commands.registerCommand('extension.convertToYamlTml', () => {
            fileConverter.convertFileToYamlTml();
        });
        context.subscriptions.push(convertToYamlCommand);
        
        var convertToTmlCommand = vscode.commands.registerCommand('extension.convertToTml', () => {
            fileConverter.convertFileToTml();
        });
        context.subscriptions.push(convertToTmlCommand);
        
        var convertToAutoCommand = vscode.commands.registerCommand('extension.convertTo', () => {
            fileConverter.convertFileToAuto();
        });
        context.subscriptions.push(convertToAutoCommand);
        context.subscriptions.push(fileConverter);
        
        context.subscriptions.push(vscode.languages.registerCompletionItemProvider(JSON_FILE, new JsonTmLanguageCompletionItemProvider(), '#'));
        
        let diagnosticProvider = new jsonTmLanguageDiagnosticProvider();
        vscode.workspace.onDidChangeTextDocument(event => {
            diagnosticProvider.CreateDiagnostics(event.document);
        });
        
        console.log("tmLanguage extension loaded");

    } catch(err) {
        console.log("Failed to load tmLanguage extension due to " + err);
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
        var parsedFilePath = path.parse(doc.fileName);
        
        try{
            var extension: string;
            // should do lower case compare
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
            
            // Some of the sublime tmlanguage variant files had comments as hints for auto conversion
            if (documentText.startsWith("//")){
                var lastLineRange = doc.lineAt(doc.lineCount - 1).range;
                documentText = doc.getText(new vscode.Range(new vscode.Position(1, 0), lastLineRange.end));
            }
                        
            var sourceLanguage = doc.languageId;
            
            // check to see if file already exists
            vscode.workspace.findFiles(parsedFilePath.name + "*." + extension, "ABC")
                .then(matchingFiles => {
               var paths = matchingFiles.map(p => p.fsPath);

               var editorWindows = vscode.window.visibleTextEditors.map(x => x.document.fileName);
               paths = paths.concat(editorWindows);
                
               var newFilePath = path.join(parsedFilePath.dir, './' + parsedFilePath.name + '.' + extension);              
               if (matchingFiles.length != 0){    
                   var counter = 1;
                   while (paths.indexOf(newFilePath) >= 0){
                        newFilePath = path.join(parsedFilePath.dir, './' + parsedFilePath.name + '(' + counter +').' + extension);
                        counter++;
                   }
               }

               this.OpenTextDocument(sourceLanguage, destinationLanguage, documentText, newFilePath);           
            });
        } catch(err) {
            console.log(err);
        }
    }
    
    private OpenTextDocument(sourceLanguage: string, destinationLanguage:string, documentText: string, path: string){
        return vscode.workspace.openTextDocument( vscode.Uri.parse('untitled:' + path)).then(doc => {
                return vscode.window.showTextDocument(doc)
                .then(editor => {
                    return editor.edit(edit => {
                        var parsed: any;                      
                        
                        try {
                            if (sourceLanguage === "xml" || sourceLanguage == "tmlanguage"){
                                parsed = plist.parse(documentText);    
                            }
                            if (sourceLanguage === "json" || sourceLanguage == "json-tmlanguage"){
                                parsed = JSON.parse(documentText);
                            }
                            if (sourceLanguage === "yaml" || sourceLanguage == "yaml-tmlanguage"){
                                parsed = YAML.parse(documentText);
                            }
                        } catch(err) {
                            console.log(err);
                            vscode.window.showErrorMessage(err.toString());
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
    }
    
     dispose() {
  
    }
}
