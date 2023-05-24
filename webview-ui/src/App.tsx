import { vscode } from "./utilities/vscode";  
import { Fragment, useState, useEffect } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { BeakerIcon } from '@heroicons/react/24/solid'

import { Transition } from '@headlessui/react'
import { useTimeoutFn } from 'react-use'

// function Example() {
//   let [isShowing, setIsShowing] = useState(true)
//   let [, , resetIsShowing] = useTimeoutFn(() => setIsShowing(true), 500)

//   return (

//     <div className="flex flex-col items-center py-16">
//       <div className="h-32 w-32">
//         <Transition
//           as={Fragment}
//           show={isShowing}
//           enter="transform transition duration-[400ms]"
//           enterFrom="opacity-0 rotate-[-120deg] scale-50"
//           enterTo="opacity-100 rotate-0 scale-100"
//           leave="transform duration-200 transition ease-in-out"
//           leaveFrom="opacity-100 rotate-0 scale-100 "
//           leaveTo="opacity-0 scale-95 "
//         >
//           <div className="h-full w-full rounded-md bg-white shadow-lg" />
//         </Transition>
//       </div>

//       <button
//         onClick={() => {
//           setIsShowing(false)
//           resetIsShowing()
//         }}
//         className="backface-visibility-hidden mt-8 flex transform items-center rounded-full bg-black bg-opacity-20 px-3 py-2 text-sm font-medium text-white transition hover:scale-105 hover:bg-opacity-30 focus:outline-none active:bg-opacity-40"
//       >
//         <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 opacity-70">
//           <path
//             d="M14.9497 14.9498C12.2161 17.6835 7.78392 17.6835 5.05025 14.9498C2.31658 12.2162 2.31658 7.784 5.05025 5.05033C7.78392 2.31666 12.2161 2.31666 14.9497 5.05033C15.5333 5.63385 15.9922 6.29475 16.3266 7M16.9497 2L17 7H16.3266M12 7L16.3266 7"
//             stroke="currentColor"
//             strokeWidth="1.5"
//           />
//         </svg>

//         <span className="ml-3">Click to transition</span>
//       </button>
//     </div>
//   )
// }

interface OutputMessage {
  content: string;
  role: string;
}

function App() {
  const [message, setMessage] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [outputMessages, setOutputMessages] = useState<OutputMessage[]>([]);
  const [isOutputComplete, setOutputComplete] = useState(false);

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
            model: "gpt-3.5-turbo",
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
          // console.log("lines", lines);
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
              // console.log("content", content, "errorMessage", errorMessage);
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
    <main className="h-screen flex flex-col">
      <div>
        {outputMessages.map((message, index) => (
          <p className={message.role === "user" ? "text-right" : ""} key={index}>
            {message.content}
          </p>
        ))}
        {message && <p className="">
          {message}
        </p>}
      </div>
      <div className="flex flex-row">
        <textarea value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}></textarea>
        <button className="bg-violet-600 text-white" onClick={(e) => {
          setOutputMessages((prev) => [...prev, { content: inputMessage, role: "user" }]);
          setInputMessage("");
        }}>送信</button>
      </div>
      {/* <BeakerIcon className="h-6 w-6 text-blue-500" />
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <Example />
      <VSCodeButton onClick={handleHowdyClick}>Howdy!</VSCodeButton>
      <p>{message}</p> */}
    </main>
  );
}

export default App;
