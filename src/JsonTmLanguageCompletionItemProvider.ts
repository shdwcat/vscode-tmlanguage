import * as vscode from 'vscode';
import {join, basename} from 'path';

var plist  = require("plist");
var json = require('format-json');
var YAML = require('yamljs');

import jsonTmLanguageAnalyser from './jsonTmLanguageAnalyser';

export default class JsonTmLanguageCompletionItemProvider implements vscode.CompletionItemProvider{
    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {      
        return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
            try{
                var analyser = new jsonTmLanguageAnalyser();
                var docContent = analyser.getAnalysis(document);

                var completion : vscode.CompletionItem[] = [];
                
                var options = Object.getOwnPropertyNames(docContent.value.repository.value).sort();
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