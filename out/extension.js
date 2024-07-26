"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
// async function callGptApi(prompt_msg: string): Promise<string> {
// 	console.log(prompt_msg);
//     const response = await fetch('https://api.openai-hk.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer key`
//         },
//         body: JSON.stringify({
//             max_tokens: 8000, // 根据需要调整
// 			model: 'gpt-4o-mini',
//             top_p: 1, // 返回的选项数量
//             temperature: 0.7, // 控制生成的随机性
// 			presence_penalty: 1,
// 			messages:[
// 				{
// 					role: 'user',
// 					content : prompt_msg
// 				}
// 			]
//         })
//     }); 
//     if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Error: ${response.status} - ${errorText}`);
//     }
//     // 使用类型断言
//     const data = await response.json() as GptResponse;
// 	console.log(data.choices[0].message.content);
//     return data.choices[0].message.content;
// } 语言：typescript， 修改这段代码，把fetch 函数的参数 和 Bearer 后面的key 替换成两个变量，并且从vscode配置文件中读取
/**
 * @function callGptApi
 * @description 异步函数，用于调用 OpenAI 的 GPT API。
 *              该函数接受一个字符串类型的提示消息，并返回生成的响应内容。
 *
 * @param {string} prompt_msg - 用户输入的提示消息。
 * @returns {Promise<string>} - 返回生成的响应内容。
 * @throws {Error} - 如果 API 请求失败，将抛出错误。
 */
async function callGptApi(prompt_msg) {
    console.log(prompt_msg);
    // 从 VSCode 配置文件中读取 API URL 和 Bearer Token
    const apiUrl = vscode.workspace.getConfiguration('cunami').get('apiUrl');
    const bearerToken = vscode.workspace.getConfiguration('cunami').get('apikey');
    const modelname = vscode.workspace.getConfiguration('cunami').get('model');
    console.log(modelname);
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
            max_tokens: 4000, // 根据需要调整
            model: modelname,
            top_p: 1, // 返回的选项数量
            temperature: 0.7, // 控制生成的随机性
            presence_penalty: 1,
            messages: [
                {
                    role: 'user',
                    content: prompt_msg
                }
            ]
        })
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    // 使用类型断言
    const data = await response.json();
    console.log(data);
    console.log('\n\n\n');
    console.log(data.choices[0].message.content);
    return data.choices[0].message.content;
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "cunami" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('cunami.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from cunami!');
    });
    let optimizeCode = vscode.commands.registerCommand('extension.optimizeCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            let optimizePrompt = vscode.workspace.getConfiguration('cunami').get('optimizeCodePrompt');
            const code = editor.document.getText(editor.selection);
            const msg = optimizePrompt?.replace(/\$\{content\}/g, code);
            const optimizedCode = await callGptApi(msg);
            editor.edit(editBuilder => {
                editBuilder.replace(editor.selection, optimizedCode);
            });
        }
    });
    let codeMaker = vscode.commands.registerCommand('extension.codeMaker', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            let optimizePrompt = vscode.workspace.getConfiguration('cunami').get('codeMakerPrompt');
            const code = editor.document.getText(editor.selection);
            const msg = optimizePrompt?.replace(/\$\{content\}/g, code);
            const optimizedCode = await callGptApi(msg);
            editor.edit(editBuilder => {
                // 获取当前选中块的下一行
                const currentPosition = editor.selection.end;
                // 创建一个新的位置，设置为当前行的下一行
                const newPosition = currentPosition.with(currentPosition.line + 1, 0);
                // 获取当前行的缩进
                const currentLine = editor.document.lineAt(currentPosition.line);
                const indent = currentLine.text.match(/^\s*/)?.[0] || '';
                // 在新的位置插入带缩进的 optimizedCode
                editBuilder.insert(newPosition, '\n' + indent + optimizedCode + '\n');
            });
        }
    });
    context.subscriptions.push(disposable, optimizeCode, codeMaker);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map