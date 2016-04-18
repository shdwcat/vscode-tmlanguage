import * as vscode from 'vscode';
import {join, basename} from 'path';

var plist  = require("plist");
var json = require('format-json');
var YAML = require('yamljs');

//var jisonTest = require('./JisonTest.js');
import * as jisonTest from './JisonTest';
var Parser = require("jison").Parser;

export default class JsonTmLanguageCompletionItemProvider implements vscode.CompletionItemProvider{
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