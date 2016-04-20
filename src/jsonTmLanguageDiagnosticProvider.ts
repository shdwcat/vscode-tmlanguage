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
        var guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        try{
            var docContent = parser.parse(text);    
            // Need to determine a mapping back to the source text for each element        
            var t2 = this.searchElements(docContent, "uuid");
            for(var id of t2)            {
                if (typeof(id.value) === "string" ){
                    if (!guidRegex.test(id.value)){
                        var lineRange = new vscode.Range(id.pos.first_line - 1, id.pos.first_column, id.pos.last_line - 1, id.pos.last_column);
                        diagnostics.push(new vscode.Diagnostic(lineRange, 'Invalid UUID/GUID', vscode.DiagnosticSeverity.Error));
                    }
                }
                
            }
          
        }
        catch(err){
            if (err.hash != undefined && err.hash.loc != undefined){
                var lineRange = new vscode.Range(err.hash.loc.first_line - 1, err.hash.loc.first_column, err.hash.loc.last_line - 1, err.hash.loc.last_column);
                diagnostics.push(new vscode.Diagnostic(lineRange, err.message, vscode.DiagnosticSeverity.Error));
            }
        }
        
        uuidErrors.set(document.uri, diagnostics);
        
    }
    
    private searchElements(element: any, matchingTitle: string){
        var matchingElements: any[] = [];
        
        for(var property in element.value){
            if (property == matchingTitle){
                matchingElements.push(element.value[property])
            }
            
            var result = this.searchElements(element.value[property], matchingTitle);
            if (result.length > 0){
                matchingElements.push(result);
            }
        }
        
        return matchingElements;
    }
    
    private searchTree(element : any, matchingTitle : string){
        var matchingElements: any[] = [];
        
        if (element.value == matchingTitle){
            matchingElements.push(element);
        } else if(element.value != null){
            //var result = null;
            // for(var i : number = 0; result == null && i < element.value.children.length; i++){
            //    var result = this.searchTree(element.value.children[i], matchingTitle);
            //    matchingElements.push(result);
            // }
            for (var property in element.value){
                var result = this.searchTree(element.value[property], matchingTitle);
                if (result.length > 0)
                {
                    matchingElements.push(result);
                }
            }
            //return matchingElements;
        }
        return matchingElements;
        
        
        // if(element.value[matchingTitle] != undefined){
        //     //return element;
        //     matchingElements.push(element);
        // } else if (element.value.children != null){
        //     var result = null;
        //     for(var i : number = 0; result == null && i < element.value.children.length; i++){
        //         result = this.searchTree(element.value.children[i], matchingTitle);
        //     }
        //     return result;
        // }
        // return null;
    }
}