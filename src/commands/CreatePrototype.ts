import * as vscode from 'vscode';
import NamespaceDetails from '../NamespaceDetails';
import Helpers from "../Helpers";
import Container from '../Container';

export function createProto(activeEditor: vscode.TextEditor, selections: vscode.Selection[], sourceEditor: vscode.TextEditor) {
    let selection = selections.shift();
    if (selection) {
        let code = activeEditor.document.getText();
        let container = new Container(code);
        let capture = activeEditor.document.offsetAt(selection.start);
        let funcDetails = container.findFunction(activeEditor.document.offsetAt(selection.start));

        if (funcDetails) { // If was null then selection is not a c++ function declration
            let prototype = '\n' + funcDetails.before + ' ' + funcDetails.name + '(' + funcDetails.arguments + ');\n';
            if (funcDetails && prototype) {
                let position: vscode.Position | undefined;
                if (sourceEditor === activeEditor) {
                    // Prototype at the source file.
                    position = vscode.window.activeTextEditor?.document.positionAt(0);
                } 
                else {
                    // Implementate in related source file. Position undefined means enf of file
                    position = undefined;
                }
                sourceEditor.insertSnippet(new vscode.SnippetString(prototype), position ? position : sourceEditor.document.positionAt(sourceEditor.document.getText().length))
                    .then(function () {
                        if (selections.length > 0) {
                            createProto(activeEditor, selections, sourceEditor);
                        }
                    });
            }
        } else {
            vscode.window.showInformationMessage("Function not detected.");
            if (selections.length > 0) {
                createProto(activeEditor, selections, sourceEditor);
            }
        }
    }
}

/**
 * Generate Implementation Command
 */

export default function () {
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.selection) {
        if (vscode.window.activeTextEditor) {
            var activeEditor = vscode.window.activeTextEditor;
            var selections = activeEditor.selections;
            selections = selections.sort((a:vscode.Selection, b: vscode.Selection) => a.start.isAfter(b.start) ? 1 : -1);
            Helpers.openHeaderFile().then(function (doc : vscode.TextEditor) {
                createProto(activeEditor, selections, doc);
            });
        }
    }
}
