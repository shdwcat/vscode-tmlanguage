#TextMate/Sublime Language Definition for VSCode

This package provides syntax highlighting for the SublimeText JSON/YAML tmlanguage files in VsCode. The syntax highlighting uses 
tmLanguage files sourced from https://github.com/SublimeText/PackageDev.
 
 This package can now convert between JSON/YAML and standard PLIST tmLanguage files.
 
The functionality in this extension is inspired by SublimeText PackageDev, and the lack functionality around tmLanguage files, even though
it's a recommended format for VSCODE syntax highlighting.

##Currently Included

###Syntax Highlighting and Snippets for JSON-tmLanguage files
![JSON-tmLanguage](/images/json_sample.png)

###Syntax Highlighting and Snippets for YAML-tmLanguage files
![YAML-tmLanguage](/images/yaml_sample.png)

###Conversion between tmLanguage file variants
![Available Commands](/images/commands_sample.png)

Included commands are:
- Convert to JSON-tmLanguage file - Converts to JSON from YAML/PLIST
- Convert to tmLanguage file - Converts to PLIST from YAML/JSON
- Convert to YAML-tmLanguage file - Converts to YAML from JSON/PLIST

Please raise any issues with this extension through [GitHub](https://github.com/Togusa09/vscode-tmlanguage/issues)
