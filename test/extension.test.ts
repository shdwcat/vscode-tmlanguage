// 
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import { FileConverter } from '../src/fileConverter';
import * as path from 'path';

const formatFilesPath = path.join(__dirname, '..', '..', 'test', 'testfiles');

const jsonTestFile = path.join(formatFilesPath, 'jsontest.JSON-tmLanguage');

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

	// Defines a Mocha unit test
	test("Something 1", () => {
		assert.equal(-1, [1, 2, 3].indexOf(5));
		assert.equal(-1, [1, 2, 3].indexOf(0));
	});

	test('AutoPep8', () => TestConvertingThings());

	async function TestConvertingThings() {
		const textDocument = await vscode.workspace.openTextDocument(jsonTestFile);
		const textEditor = await vscode.window.showTextDocument(textDocument);

		const fileConverter: FileConverter = new FileConverter();
		fileConverter.convertFileToTml().then((success: boolean) => {
			assert.equal(true, success)
		});

		

		var text = textEditor.document.getText();
	}
});