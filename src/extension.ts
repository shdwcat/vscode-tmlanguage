'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from "fs";

import * as plist from 'plist';
import * as json from 'format-json';
import * as YAML from 'yamljs';

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
        let editor : vscode.TextEditor = vscode.window.activeTextEditor;
   
        if (!editor){
            return;
        }        

        const extension: string = this.fileExtensionFor(destinationLanguage);

        let doc : vscode.TextDocument = editor.document;
        var parsedFilePath: path.ParsedPath = path.parse(doc.fileName);
        
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
                var lastLineRange : vscode.Range = doc.lineAt(doc.lineCount - 1).range;
                documentText = doc.getText(new vscode.Range(new vscode.Position(1, 0), lastLineRange.end));
            }
                        
            const sourceLanguage: SupportedLanguage = doc.languageId as SupportedLanguage;
            let replaceExistingFile = true;

            if(replaceExistingFile){
                this.createFileReplacingExisting(parsedFilePath, extension, sourceLanguage, destinationLanguage, documentText);
            }else{
                this.createFileWithUniqueName(parsedFilePath, extension, sourceLanguage, destinationLanguage, documentText)
            }

        } catch(err) {
            console.log(err);
        }
    }

    private createFileReplacingExisting(parsedFilePath: path.ParsedPath, extension: string, sourceLanguage: string, destinationLanguage: string, documentText: string) : void
    {
        const newFilePath: string = path.join(parsedFilePath.dir, "./" + parsedFilePath.name + "." + extension);
        this.ifExists(newFilePath).then((existed: boolean) => {
            this.openEditor(sourceLanguage, destinationLanguage, documentText, newFilePath, existed);
        }, (reason: any) => {
            reason = reason || "Error writing output file";
            console.log("Error writing output", reason);
            vscode.window.showErrorMessage(reason.toString());
        });
    }

    private createFileWithUniqueName(parsedFilePath: path.ParsedPath, extension: string, sourceLanguage: string, destinationLanguage: string, documentText: string) : void{
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

            this.openEditor(sourceLanguage, destinationLanguage, documentText, newFilePath, false);
        });;
    }

    // private ifExists(filePath: string) : Promise<boolean>{
    //     return new Promise<boolean>((resolve, reject) => {
    //         try{
    //             vscode.workspace.findFiles(filePath, "ABC")
    //             .then((matchingFiles : vscode.Uri[]) => {
    //                 resolve(matchingFiles.length > 0);
    //             }, (reason: any) => {
    //                 resolve(false)
    //             });
    //         }
    //         catch(err){
    //             reject(err);
    //         }
    //     });
    // }

    private ifExists(filePath: string): Promise<boolean> {
        return new Promise((resolve?: (value: boolean) => void, reject?: (reason: any) => void) => {
            try {
                fs.exists(filePath, (exists: boolean) => {
                    resolve(exists);
                });
            } catch (err) {
                reject(err);
            }
        });
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

    private uriFor(filePath: string, existing: boolean): vscode.Uri {
        if (existing) {
            return vscode.Uri.parse("file:///" + filePath);
        }

        return vscode.Uri.parse("untitled:" + filePath);
    }
    
    private openEditor(sourceLanguage: string, destinationLanguage:string, documentText: string, path: string, exists: boolean){
        const uri: vscode.Uri = this.uriFor(path, exists);

        return vscode.workspace.openTextDocument(uri)
        .then((doc: vscode.TextDocument) => {
                return vscode.window.showTextDocument(doc)
                .then((editor: vscode.TextEditor) => {
                    return editor.edit((edit: vscode.TextEditorEdit) => {
                        var parsed: string;                      

                        const sourceLanguage: SupportedLanguage = doc.languageId as SupportedLanguage;
                        parsed = this.parse(sourceLanguage, documentText);
                        
                        if (!parsed){
                            // Display a message?
                            console.log("Could not parse source");
                            return;
                        }
                        const destLanguage: SupportedLanguage = destinationLanguage as SupportedLanguage;
                        var built = this.build(destLanguage, parsed);

                        if (exists) {
                            const was: vscode.Selection = editor.selection;
                            const lastLineRange: vscode.Range = doc.lineAt(doc.lineCount - 1).range;
                            const beginning: vscode.Position = new vscode.Position(0, 0);
                            const end: vscode.Position = new vscode.Position(doc.lineCount - 1, lastLineRange.end.character);
                            const entire: vscode.Range = new vscode.Range(beginning, end);
                            edit.replace(entire, built);
                            editor.selection = was;
                        } else {
                            edit.insert(new vscode.Position(0, 0), built);
                        }

                    });
                });
            },
            (reason: any) => {
                reason = reason || "Error opening editor for output file";
                console.log("Error opening editor for file", reason);
                vscode.window.showErrorMessage(reason.toString());
            });
    }
}
