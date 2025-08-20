import { useRef, useState } from "react";
import ChatBox from "./components/ChatBox";
import IndexForm from "./components/IndexForm";

function App() {
  const chatEndRef = useRef(null);
  const tabs = ["TextArea", "Upload", "Website"];
  const [activeTab, setActiveTab] = useState("TextArea");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [messageCount, setMessageCount] = useState(() => {
    const stored = localStorage.getItem("messageCount");
    return stored ? parseInt(stored, 10) : 0;
  });

  return (
    <div className="bg-black">
      <div className="w-full h-screen max-w-7xl mx-auto  text-gray-100 flex flex-col">
        {/* Header */}
        <header className="h-16 px-6  flex items-center justify-between  backdrop-blur">
          <h1 className="text-xl font-bold tracking-wide text-white">
            GyaanBuddy
          </h1>
          <div className="text-sm text-zinc-400">Your AI Knowledge Buddy</div>
        </header>

        {/* Main */}
        <main className="flex flex-1 max-h-[720px] overflow-hidden">
          {/* Left: Upload / Index */}

          <section className="w-1/3 min-w-[280px] p-4 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto  rounded-xl p-4 shadow-inner border border-zinc-800">
              <IndexForm
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                thinking={thinking}
                messageCount={messageCount}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={tabs}
              />
            </div>
          </section>
          {/* Right: Chat */}
          <section className="flex-1 p-4 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto  rounded-xl p-4 shadow-inner border border-zinc-800">
              <ChatBox
                chatEndRef={chatEndRef}
                isSubmitting={isSubmitting}
                thinking={thinking}
                setThinking={setThinking}
                messageCount={messageCount}
                setMessageCount={setMessageCount}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
