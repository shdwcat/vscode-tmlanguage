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
                
                analyser.getAnalysis(document);
                var sectionNames = analyser.getSectionNames();

                var completion : vscode.CompletionItem[] = [];
                for(var section of sectionNames){
                    var t3 = new vscode.CompletionItem(section);
                    t3.kind = vscode.CompletionItemKind.Keyword;
                    t3.insertText = section;
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