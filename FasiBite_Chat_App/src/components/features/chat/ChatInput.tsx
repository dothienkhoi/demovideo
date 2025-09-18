"use client";

import { useState } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  conversationId: number;
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement send message logic
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Button>

        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="pr-12 pl-4 py-3 rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#ad46ff]/20 focus:border-[#ad46ff]"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Smile className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          className="h-10 w-10 rounded-full bg-gradient-to-r from-[#ad46ff] to-[#1447e6] hover:from-[#ad46ff]/90 hover:to-[#1447e6]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5 text-white" />
        </Button>
      </div>
    </div>
  );
}
