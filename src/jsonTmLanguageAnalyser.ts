import * as vscode from 'vscode';
import * as jisonTest from './JisonTest';
var Parser = require("jison").Parser;

export default class jsonTmLanguageAnalyser{
    public getAnalysis(document : vscode.TextDocument){
        let docToCheck = document.getText();
        
        var t = new jisonTest.JisonTest();
        var grammar = t.grammar;
        var parser = new Parser(grammar);
        var docContent = parser.parse(docToCheck);
        return docContent;
    }
}