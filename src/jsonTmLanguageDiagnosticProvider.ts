import * as vscode from 'vscode';
import * as jisonTest from './JisonTest';
var Parser = require("jison").Parser;

export default class jsonTmLanguageDiagnosticProvider{
    public CreateDiagnostics(document : vscode.TextDocument){
        let diagnostics: vscode.Diagnostic[] = [];
        let uuidErrors = vscode.languages.createDiagnosticCollection("languageErrors");
        let docToCheck = document.getText();
        
        var text = document.getText();
        
        var t = new jisonTest.JisonTest();
        var grammar = t.grammar;
        var parser = new Parser(grammar);
        try{
            var docContent = parser.parse(text);    
            // Need to determine a mapping back to the source text for each element        
            var t2 = this.searchTree(docContent, "uuid");
        }
        catch(err){
            if (err.hash != undefined && err.hash.loc != undefined){
                var lineRange = new vscode.Range(err.hash.loc.first_line - 1, err.hash.loc.first_column, err.hash.loc.last_line - 1, err.hash.loc.last_column);
                diagnostics.push(new vscode.Diagnostic(lineRange, err.message, vscode.DiagnosticSeverity.Error));
            }
        }
        
        uuidErrors.set(document.uri, diagnostics);
        
    }
    
    private searchTree(element : any, matchingTitle : string){
        if(element[matchingTitle] != undefined){
            return element;
        } else if (element.children != null){
            var result = null;
            for(var i : number = 0; result == null && i < element.children.length; i++){
                result = this.searchTree(element.children[i], matchingTitle);
            }
            return result;
        }
        return null;
    }
}