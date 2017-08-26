'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

import * as plist from 'plist';
import * json from 'format-json';
import * YAML from 'yamljs';

import * as jisonTest from './JisonTest';

import { Parser } from 'jison';

import JsonTmLanguageCompletionItemProvider from './JsonTmLanguageCompletionItemProvider';
import jsonTmLanguageDiagnosticProvider from './jsonTmLanguageDiagnosticProvider';


export const JSON_FILE: vscode.DocumentFilter = { language: 'json-tmlanguage', scheme: 'file' };
type SupportedLanguage = "xml" | "tmlanguage" | "json" | "json-tmlanguage" | "yaml" | "yaml-tmlanguage";

export function activate(context: vscode.ExtensionContext) {
    console.log("Loading tmLanguage extension");
    try {

        const fileConverter: FileConverter = new FileConverter();

        const convertToJsonCommand = vscode.commands.registerCommand('extension.convertToJsonTml', () => {
            fileConverter.convertFileToJsonTml();
        });
        context.subscriptions.push(convertToJsonCommand);
        
        const convertToYamlCommand = vscode.commands.registerCommand('extension.convertToYamlTml', () => {
            fileConverter.convertFileToYamlTml();
        });
        context.subscriptions.push(convertToYamlCommand);
        
        const convertToTmlCommand = vscode.commands.registerCommand('extension.convertToTml', () => {
            fileConverter.convertFileToTml();
        });
        context.subscriptions.push(convertToTmlCommand);
        
        const convertToAutoCommand = vscode.commands.registerCommand('extension.convertTo', () => {
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

    public dispose(): void {
        // nothing to do
    }

    private fileExtensionFor(destinationLanguage: string): string {
        switch (destinationLanguage.toLowerCase()) {
            case "json-tmlanguage":
                return "JSON-tmLanguage";
            case "yaml-tmlanguage":
                return "YAML-tmLanguage";
            case "tmlanguage":
                return "tmLanguage";
            default:
                return undefined;
        }
    }
    
    private ConvertFile(destinationLanguage: string){
        let editor = vscode.window.activeTextEditor;
   
        if (!editor){
            return;
        }        

        const extension: string = this.fileExtensionFor(destinationLanguage);

        let doc = editor.document;
        var parsedFilePath = path.parse(doc.fileName);
        
        if (!extension) {
            console.log(`Unable to map destination language (${destinationLanguage}) to file extension`);
            vscode.window.showErrorMessage(`Unable to map destination language (${destinationLanguage}) to file extension`);
            return;
        }

        try{
            const destLanguage: SupportedLanguage = destinationLanguage as SupportedLanguage;
            const doc: vscode.TextDocument = editor.document;
            const parsedFilePath: path.ParsedPath = path.parse(doc.fileName);

            let documentText: string = doc.getText();

            console.log(`Converting to ${extension}`);
            
            // Some of the sublime tmlanguage variant files had comments as hints for auto conversion
            if (documentText.startsWith("//")){
                var lastLineRange = doc.lineAt(doc.lineCount - 1).range;
                documentText = doc.getText(new vscode.Range(new vscode.Position(1, 0), lastLineRange.end));
            }
                        
            const sourceLanguage: SupportedLanguage = doc.languageId as SupportedLanguage;
            
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

    private parse(sourceLanguage: SupportedLanguage, documentText: string): any {
        switch (sourceLanguage) {
            case "xml":
            case "tmlanguage":
                return plist.parse(documentText);
            case "json":
            case "json-tmlanguage":
                return JSON.parse(documentText);
            case "yaml":
            case "yaml-tmlanguage":
                return YAML.parse(documentText);
            default:
                return undefined;
        }
    }

    private build(destinationLanguage: SupportedLanguage, parsed: any): string {
        switch (destinationLanguage) {
            case "xml":
            case "tmlanguage":
                return plist.build(parsed);
            case "json":
            case "json-tmlanguage":
                return json.plain(parsed);
            case "yaml":
            case "yaml-tmlanguage":
                return YAML.stringify(parsed, 6);
            default:
                return undefined;
        }
    }
    
    private OpenTextDocument(sourceLanguage: string, destinationLanguage:string, documentText: string, path: string){
        const uri: vscode.Uri = vscode.Uri.parse('untitled:' + path);

        return vscode.workspace.openTextDocument(uri).then(doc => {
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
    }
}
