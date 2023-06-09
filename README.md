# Open AI Chat Extension

TODO: あとでちゃんと書く

![A screenshot of the sample extension.](./assets/hello-world.png)

## Documentation

For a deeper dive into how this sample works, read the guides below.

- [Extension structure](./docs/extension-structure.md)
- [Extension commands](./docs/extension-commands.md)
- [Extension development cycle](./docs/extension-development-cycle.md)

## Run The Sample

```bash
# Copy sample extension locally
npx degit microsoft/vscode-webview-ui-toolkit-samples/frameworks/hello-world-react-vite hello-world

# Navigate into sample directory
cd hello-world

# Install dependencies for both the extension and webview UI source code
npm run install:all

# Start webview UI source code for Browser
npm run start:webview

# Build webview UI source code
npm run build:webview

# Open sample in VS Code
code .

# Create vsix package and install it
npm run build:webview
npx vsce package
code-insiders --install-extension openai-chat-extension-0.0.8.vsix
```

Once the sample is open inside VS Code you can run the extension by doing the following:

1. Press `F5` to open a new Extension Development Host window
2. Inside the host window, open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and type `Hello World (React + Vite): Show`

## VSIXファイルのインストール方法

1. まず、VS Codeを開いてください。
2. 左側のアクティビティバーにある「拡張機能」（四角形が重なっているようなアイコン）をクリックします。
3. 上部にある「...」（もっと見る）ボタンをクリックします。
4. ドロップダウンメニューから「VSIXからインストール...」を選択します。
5. ファイル選択ダイアログが表示されたら、インストールしたい.vsixファイルを選択して「開く」をクリックします。
