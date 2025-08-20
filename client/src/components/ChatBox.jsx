import axios from "axios";
import React, { useEffect, useState } from "react";

const ChatBox = ({ chatEndRef, isSubmitting, thinking, setThinking,messageCount, setMessageCount }) => {
  const [messages, setMessages] = useState(() => {
    // Load from localStorage (if exists) else use default
    const stored = localStorage.getItem("messages");
    return stored
      ? JSON.parse(stored)
      : [
          {
            role: "system",
            content: "Ask questions about your uploaded or pasted data.",
          },
        ];
  });
  
  const [input, setInput] = useState("");
  
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    // Count user messages (excluding system + assistant)

    // Restrict after 10 messages
    if (messageCount >= 10) {
      alert("⚠️ You have reached the 10-message limit.");
      return;
    }

    const userMsg = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Increment user count
    setMessageCount((prev) => {
      const newCount = prev + 1;
      localStorage.setItem("messageCount", newCount);
      return newCount;
    });

    // Add temporary loading assistant message
    const tempId = Date.now();
    setMessages((m) => [
      ...m,
      { role: "assistant", content: "Thinking...", tempId },
    ]);
    setThinking(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, {
        query: userMsg.content,
        k: 3, // number of docs to retrieve, adjust if needed
      });

      if (res.data.ok) {
        setMessages((m) =>
          m.map((msg) =>
            msg.tempId === tempId
              ? { role: "assistant", content: res.data.answer }
              : msg
          )
        );
      } else {
        setMessages((m) =>
          m.map((msg) =>
            msg.tempId === tempId
              ? { role: "assistant", content: `Error: ${res.data.error}` }
              : msg
          )
        );
      }
    } catch (err) {
      setMessages((m) =>
        m.map((msg) =>
          msg.tempId === tempId
            ? { role: "assistant", content: `Request failed: ${err.message}` }
            : msg
        )
      );
    } finally {
      setThinking(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Sync messages to localStorage whenever it changes
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  return (
    <div
      className={`h-full ${
        isSubmitting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex flex-1 h-full flex-col overflow-hidden">
        <div className="border-b flex justify-between border-zinc-800 p-3 text-sm text-gray-300">
          <span>Chat</span> <span>{messageCount}/10</span>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`max-w-[85%] w-fit rounded-xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-[#151515] text-white"
                  : m.role === "assistant"
                  ? "bg-[#262626] text-gray-100"
                  : "mx-auto bg-[#151515] text-white"
              }`}
            >
              {m.content}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {messageCount >= 10 ? (
          <div className="flex items-center justify-center w-full py-5">
          <p className="text-gray-400 text-sm font-medium">
            🚫 Free Limit is expired
          </p>
        </div>
        ) : (
          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 border-t border-zinc-800 pt-5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 rounded-full border border-zinc-800 bg-[#151515] px-4 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-zinc-700"
            />
            <button
              type="submit"
              disabled={thinking}
              className=" py-2 px-6 bg-gray-50 cursor-pointer rounded-full font-bold text-gray-900 border-[4px] border-zinc-800 hover:border-zinc-600 transition-all duration-200"
            >
              {thinking ? "..." : "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
