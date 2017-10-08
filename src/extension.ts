'use strict';

import * as vscode from 'vscode';
import JsonTmLanguageCompletionItemProvider from './JsonTmLanguageCompletionItemProvider';
import jsonTmLanguageDiagnosticProvider from './jsonTmLanguageDiagnosticProvider';
import { FileConverter } from './fileConverter';

export const JSON_FILE: vscode.DocumentFilter = { language: 'json-tmlanguage', scheme: 'file' };

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