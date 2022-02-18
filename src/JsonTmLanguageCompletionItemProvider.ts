import * as vscode from 'vscode'

import JsonTmLanguageAnalyser from './jsonTmLanguageAnalyser'

export default class JsonTmLanguageCompletionItemProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
    return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
      try {
        const analyser = new JsonTmLanguageAnalyser(document)

        analyser.getAnalysis()
        const sectionNames = analyser.getSectionNames()

        const completion: vscode.CompletionItem[] = []
        for (const section of sectionNames) {
          const t3 = new vscode.CompletionItem(section)
          t3.kind = vscode.CompletionItemKind.Keyword
          t3.insertText = section
          completion.push(t3)
        }

        return resolve(completion)
      } catch (err) {
        return reject(err)
      }
    })
  }
}
