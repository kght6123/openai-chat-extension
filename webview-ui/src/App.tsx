import { vscode } from "./utilities/vscode";  
import { useState, useEffect } from "react";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

const userImages = [
  "https://raw.githubusercontent.com/toranoana/special/master/maid-engineers/16_sorry.png?raw=true",
  "https://raw.githubusercontent.com/toranoana/special/master/maid-engineers/40_HELP.png?raw=true",
];

const assistantImages = [
  "https://raw.githubusercontent.com/toranoana/special/master/maid-engineers/38_Glasses.png?raw=true",
  "https://raw.githubusercontent.com/toranoana/special/master/maid-engineers/49_cat.png?raw=true",
  "https://raw.githubusercontent.com/toranoana/special/master/maid-engineers/55_Bucket.png?raw=true",
];

interface OutputMessage {
  content: string;
  role: string;
}

function App() {
  const [message, setMessage] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [outputMessages, setOutputMessages] = useState<OutputMessage[]>([]);
  const [isOutputComplete, setOutputComplete] = useState(false);

  const [userImage, setUserImage] = useState(userImages[0]);
  const [assistantImage, setAssistantImage] = useState(assistantImages[0]);

  useEffect(() => {
    setUserImage(userImages[Math.floor(Math.random() * userImages.length)]);
    setAssistantImage(assistantImages[Math.floor(Math.random() * assistantImages.length)]);
  }, []);

  useEffect(() => {
    if(outputMessages.length === 0 || outputMessages[outputMessages.length - 1].role == "assistant") return;
    const fetchData = async () => {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          method: "POST",
          body: JSON.stringify({
            messages: outputMessages,
            model: "gpt-3.5-turbo-16k",
            stream: true,
          }),
        });
        if (!res) return;
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        done: while (true) {
          const { done, value } = await reader?.read() || {};
          if (done) break;
          if (!value) continue;
          const lines = decoder.decode(value);
          const jsons = lines
            .split('data: ') // 各行は data: というキーワードで始まる
            .map(line => line.trim()).filter(s => s); // 余計な空行を取り除く
          for (const json of jsons) {
            try {
              if (json === '[DONE]') {
                break done; // 終端記号
              }
              const chunk = JSON.parse(json);
              const errorMessage = chunk?.error?.message;
              const content = chunk?.choices && chunk?.choices[0]?.delta?.content || '';
              setMessage((prev) => prev + (content || errorMessage || ''));
            } catch (error) {
              console.error(error);
            }
          }
        }
        setOutputComplete(true);
      } catch (error) {
        console.error(error);
        setMessage((prev) => prev + (error || ''));
      }
    };
    fetchData();
  }, [outputMessages]);

  useEffect(() => {
    if (isOutputComplete && message) {
      setMessage("");
      setOutputMessages((prev) => [...prev, { content: message, role: "assistant" }]);
      vscode.postMessage({
        command: "chat-reply",
        text: "success!!",
      });
      setOutputComplete(false);
    }
  }, [isOutputComplete, message]);

  useEffect(() => {
    console.log(message, inputMessage, outputMessages, isOutputComplete);
  }, [message, inputMessage, outputMessages, isOutputComplete]);
  return (
    <main className="h-screen flex flex-col items-center bg-violet-600 pb-36">
      <div className="container bg-violet-400 h-screen overflow-y-auto">
        <ul className="space-y-2">
          {outputMessages.map((message, index) => (
            message.role === "user" ? 
            <li className="flex justify-end pt-4" key={index}>
              <div className="px-4">
                <div className="bg-violet-300 relative max-w-xl px-4 py-2 rounded-lg border-[1px] border-solid my-1 border-violet-50">
                  <div className="trianle-right"></div>
                  <pre className="p-2 text-violet-950 break-all whitespace-pre-wrap">{message.content}</pre>
                </div>
              </div>
              <div className="relative p-0">
                <img className="w-16 h-16 rounded-full max-w-none" src={userImage} />
                <span className="absolute left-0 right-0 m-auto text-[8px] text-center top-[4.125rem] text-violet-950">User</span>
              </div>
            </li> : 
            <li className="flex justify-start pt-4" key={index}>
              <div className="relative p-0">
                <img className="w-16 h-16 rounded-full max-w-none" src={assistantImage} />
                <span className="absolute left-0 right-0 m-auto text-[8px] text-center top-[4.125rem] text-violet-950">AI</span>
              </div>
              <div className="px-4">
                <div className="bg-violet-300 relative max-w-xl px-4 py-2 rounded-lg border-[1px] border-solid my-1 border-violet-50">
                  <div className="trianle-left"></div>
                  <pre className="p-2 text-violet-950 break-all whitespace-pre-wrap">{message.content}</pre>
                </div>
              </div>
            </li>
          ))}
          {message && <li className="flex justify-start pt-4">
              <div className="relative p-0">
                <img className="w-16 h-16 rounded-full max-w-none" src={assistantImage} />
                <span className="absolute left-0 right-0 m-auto text-[8px] text-center top-[4.125rem] text-violet-950">AI</span>
              </div>
              <div className="px-4">
                <div className="bg-violet-300 relative max-w-xl px-4 py-2 rounded-lg border-[1px] border-solid my-1 border-violet-50">
                  <div className="trianle-left"></div>
                  <pre className="p-2 text-violet-950 break-all whitespace-pre-wrap">{message}</pre>
                </div>
              </div>
            </li>}
        </ul>
      </div>
      <div className="flex flex-row gap-1 items-center justify-center content-center fixed bottom-0 left-auto right-auto w-screen h-36 bg-violet-900">
        <div className="container flex flex-row gap-1 items-center justify-center content-center relative mx-2">
          <textarea className="bg-violet-50 rounded w-full h-24 p-2 text-lg text-violet-950" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}></textarea>
          <button className="bg-violet-600 text-white px-4 py-3 rounded w-fit absolute right-2" onClick={(e) => {
            setOutputMessages((prev) => [...prev, { content: inputMessage, role: "user" }]);
            setInputMessage("");
          }}><PaperAirplaneIcon className="h-6 w-6 fill-white" /></button>
        </div>
      </div>
    </main>
  );
}

export default App;
