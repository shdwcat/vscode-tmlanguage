import * as vscode from 'vscode'
import JsonTmLanguageAnalyser from './jsonTmLanguageAnalyser'

export default class jsonTmLanguageDiagnosticProvider {
  private readonly tmLanguageErrors = vscode.languages.createDiagnosticCollection('tmLanguageErrors')
  public CreateDiagnostics (document: vscode.TextDocument): void {
    const diagnostics: vscode.Diagnostic[] = []

    const analyser = new JsonTmLanguageAnalyser(document)
    analyser.getAnalysis()

    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    try {
      // Need to determine a mapping back to the source text for each element
      // var guids = this.searchElements(docContent, "uuid");
      const guids = analyser.getElements('uuid', 'string')
      for (const id of guids) {
        if (!guidRegex.test(id.value)) {
          const lineRange = analyser.getRange(id)
          diagnostics.push(new vscode.Diagnostic(lineRange, 'Invalid UUID/GUID', vscode.DiagnosticSeverity.Error))
        }
      }

      const sectionNames = analyser.getSectionNames()
      const includes = analyser.getElements('include', 'string')

      for (const thing of includes) {
        const t: string = thing.value
        if (t.substring(0, 1) !== '#') continue

        const name = t.substring(1)
        if (!sectionNames.includes(name)) {
          const lineRange = analyser.getRange(thing)
          diagnostics.push(new vscode.Diagnostic(lineRange, 'Reference name was not found', vscode.DiagnosticSeverity.Error))
        }
      }
    } catch (err) {
      const loc = err?.hash?.loc
      if (loc != null) {
        const lineRange = new vscode.Range(loc.first_line - 1, loc.first_column, loc.last_line - 1, loc.last_column)
        diagnostics.push(new vscode.Diagnostic(lineRange, err.message, vscode.DiagnosticSeverity.Error))
      }
    }

    this.tmLanguageErrors.set(document.uri, diagnostics)
  }

  RemoveDiagnostics (document: vscode.TextDocument): void {
    this.tmLanguageErrors.delete(document.uri)
  }
}
