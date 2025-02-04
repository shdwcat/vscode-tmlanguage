# TextMate/Sublime Language Definition for VSCode

This package provides syntax highlighting for the SublimeText JSON/YAML tmlanguage files in VsCode. The syntax highlighting uses 
tmLanguage files sourced from https://github.com/SublimeText/PackageDev. Coffee script language information is sourced from https://github.com/aponxi/sublime-better-coffeescript/blob/master/CoffeeScript.tmLanguage

### Note about this fork (pedro-w)

The original fork (Togusa9) has not seen any activity since 2018 and unfortunately has a bug which causes it to highlight spurious errors in JSON files which are nothing to do with tmlanguage. I have been unable to get a response from the author via github.com.
This fork contains a fix for that bug and some maintenance work covering the changes in vscode from 2018 to now. It also contains some bug fixes from user disco0. I hope to provide a standalong VSIX for download and, if there is interest, I can look into making it available on the extension marketplace.
The best outcome would be that the original fork becomes active once again and, if that happens, I would be delighted to see these changes merged back if required.

### Functionality

This package can now convert between JSON/YAML and standard PLIST tmLanguage files.
 
The functionality in this extension is inspired by SublimeText PackageDev, and the lack functionality around tmLanguage files, even though
it's a recommended format for VSCODE syntax highlighting.

## Currently Included

### Syntax Highlighting and Snippets for tmLanguage JSON files
![JSON-tmLanguage](/images/json_sample.png)

### Syntax Highlighting and Snippets for tmLanguage YAML files
![YAML-tmLanguage](/images/yaml_sample.png)

### Conversion between tmLanguage file variants
![Available Commands](/images/commands_sample.png)

Included commands are:
- Convert to tmLanguage JSON file - Converts to JSON from YAML/PLIST
- Convert to tmLanguage PLIST file - Converts to PLIST from YAML/JSON
- Convert to tmLanguage YAML File - Converts to YAML from JSON/PLIST

# Settings
tmLanguage.replaceExistingFile - Whether the conversion replaces the existing file or creates a new one. Defaults to true

Please raise any issues with this extension through [GitHub](https://github.com/pedro-w/vscode-tmlanguage/issues)
