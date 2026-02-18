import { useState, useRef, useEffect } from "react";
import { Sparkles, SendHorizontal } from "lucide-react";
import { useTimetableStore } from "../../stores/timetableStore";
import { useTaskStore } from "../../stores/taskStore";
import { chatCompletion } from "../../services/ai";
import { buildChatPrompt, parseChatResponse } from "../../lib/prompts";

export const ChatPanel = () => {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const tasks = useTaskStore((s) => s.tasks);
  const {
    timetable,
    chatMessages,
    isChatLoading,
    addChatMessage,
    setTimetable,
    setIsChatLoading,
  } = useTimetableStore();

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  const handleSend = async () => {
    if (!input.trim() || isChatLoading || timetable.length === 0) return;

    const userMsg = input.trim();
    setInput("");
    addChatMessage({ role: "user", content: userMsg });
    setIsChatLoading(true);

    try {
      const prompt = buildChatPrompt(tasks, timetable, userMsg, chatMessages);
      const response = await chatCompletion(prompt);
      const { message, timetable: newTimetable } = parseChatResponse(response);

      addChatMessage({ role: "ai", content: message });

      if (newTimetable && Array.isArray(newTimetable)) {
        setTimetable(newTimetable);
      }
    } catch (err) {
      addChatMessage({
        role: "ai",
        content: `Something went wrong: ${err instanceof Error ? err.message : "Please try again."}`,
      });
    }

    setIsChatLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-icon">
          <Sparkles size={16} />
        </div>
        <div>
          <h3>AI Assistant</h3>
          <p>Rearrange your schedule with chat</p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isChatLoading && (
          <div className="chat-msg ai">
            <span className="chat-typing">
              <span />
              <span />
              <span />
            </span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder={
            timetable.length > 0
              ? "Move gym to evening..."
              : "Generate a timetable first..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={timetable.length === 0}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isChatLoading || timetable.length === 0}
          aria-label="Send message"
        >
          <SendHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};
