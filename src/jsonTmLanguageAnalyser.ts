import * as vscode from 'vscode';
import { JisonTest } from './JisonTest';
import { Parser } from 'jison';

export default class jsonTmLanguageAnalyser{
    private _docContent : any;
    
    public getAnalysis(document : vscode.TextDocument){
        let docToCheck = document.getText();
        
        var t = new JisonTest();
        var grammar = t.grammar;
        var parser = new Parser(grammar);
        this._docContent = parser.parse(docToCheck);
        
        // Would having a type on the document content be useful?
        //return docContent;
    }
    
    public getSectionNames(){
        let results: string[] = []; 
        let options = Object.getOwnPropertyNames(this._docContent.value.repository.value).sort();
        for(var option of options){
              results.push(option);            
        }
        return results;
    }
    
     public getElements(matchingTitle: string){
        return this.searchElements(this._docContent, matchingTitle);
    }
    
    private searchElements(element: any, matchingTitle: string){
        var matchingElements: any[] = [];
        
        for(var property in element.value){
            if (property == matchingTitle){
                matchingElements.push(element.value[property])
            }
            
            var result = this.searchElements(element.value[property], matchingTitle);
            if (result.length > 0){
                matchingElements = matchingElements.concat(result);
            }
        }
        
        return matchingElements;
    }
}