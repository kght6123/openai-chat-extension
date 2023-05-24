import { commands, ExtensionContext } from "vscode";
import { MainPanel } from "./panels/MainPanel";

export function activate(context: ExtensionContext) {
  // Create the show hello world command
  const showHelloWorldCommand = commands.registerCommand("openai-chat-extension.showChatWindow", () => {
    MainPanel.render(context.extensionUri);
  });

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);
}
