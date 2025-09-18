import { PagedResult } from "@/types/api.types";
import { MessageDto } from "@/types/customer/user.types";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCallMessage } from "../video-call/VideoCallMessage";
import { VideoCallEndedMessage } from "../video-call/VideoCallEndedMessage";

interface MessageListProps {
  initialMessagesPage: PagedResult<MessageDto>;
  conversationId: number;
  onJoinVideoCall?: (sessionId: string) => void;
  isJoiningVideoCall?: boolean;
  onCreateVideoCall?: () => void;
  isCreatingVideoCall?: boolean;
  activeVideoCallSessionId?: string | null; // To determine if a call is still active
}

export function MessageList({
  initialMessagesPage,
  conversationId,
  onJoinVideoCall,
  isJoiningVideoCall = false,
  onCreateVideoCall,
  isCreatingVideoCall = false,
  activeVideoCallSessionId = null,
}: MessageListProps) {
  const messages = initialMessagesPage?.items || [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Helper function to extract sessionId from message content
  const extractSessionId = (content: string): string | null => {
    try {
      const parsed = JSON.parse(content);
      return parsed?.videoCallSessionId || null;
    } catch (error) {
      return null;
    }
  };

  // Helper function to check if a message is a video call message
  const isVideoCallMessage = (content: string): boolean => {
    return extractSessionId(content) !== null;
  };

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };

  // Handle scroll events to show/hide scroll button
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Auto scroll to bottom when messages change or conversation changes
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, conversationId]);

  // Scroll to bottom when component mounts with messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="flex-1 overflow-hidden message-list-container relative">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 message-list">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
              <p className="text-sm mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: MessageDto) => {
              // Check if this is a video call message
              if (isVideoCallMessage(message.content)) {
                const sessionId = extractSessionId(message.content);
                const isCallActive = activeVideoCallSessionId === sessionId;

                // Debug logging (only in development)
                if (process.env.NODE_ENV === 'development') {
                  console.log("Video call message detected:", {
                    sessionId,
                    activeVideoCallSessionId,
                    isCallActive,
                    messageContent: message.content,
                    isCreatingVideoCall
                  });
                }

                // If we're currently creating a call, show active call UI for the most recent message
                // This handles the case where activeVideoCallSessionId might not be set yet
                const isMostRecentMessage = messages.indexOf(message) === messages.length - 1;

                // Check if this is a very recent message (within last 30 seconds)
                const messageTime = new Date(message.sentAt).getTime();
                const now = Date.now();
                const isRecentMessage = (now - messageTime) < 30000; // 30 seconds

                const shouldShowAsActive = isCallActive ||
                  (isCreatingVideoCall && isMostRecentMessage) ||
                  (isRecentMessage && !activeVideoCallSessionId); // If no active call but message is recent

                // If call is active or we're creating a new call, show active call UI
                if (shouldShowAsActive && onJoinVideoCall) {
                  if (process.env.NODE_ENV === 'development') {
                    console.log("Showing active call UI for session:", sessionId);
                  }
                  return (
                    <div key={message.id}>
                      <VideoCallMessage
                        message={message}
                        onJoinCall={onJoinVideoCall}
                        isJoiningCall={isJoiningVideoCall}
                        isCallActive={true}
                      />
                    </div>
                  );
                }

                // If call is not active, show ended call UI
                if (onCreateVideoCall) {
                  if (process.env.NODE_ENV === 'development') {
                    console.log("Showing ended call UI for session:", sessionId);
                  }
                  return (
                    <div key={message.id}>
                      <VideoCallEndedMessage
                        message={message}
                        onStartNewCall={onCreateVideoCall}
                        isStartingCall={isCreatingVideoCall}
                      />
                    </div>
                  );
                }

                // If no handlers provided, don't render anything (hide the message)
                return null;
              }

              // Check if this is a "call ended" text message and hide it
              if (message.content.includes("Cuộc gọi nhóm đã kết thúc") ||
                message.content.includes("Cuộc gọi video đã kết thúc")) {
                return null; // Hide text messages about call ending
              }

              // TODO: Replace with actual current user ID check
              const isFromCurrentUser = false; // This should be determined by comparing message.sender.userId with current user ID

              return (
                <div
                  key={message.id}
                  className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-xs lg:max-w-md">
                    <div
                      className={`rounded-2xl p-3 ${isFromCurrentUser
                        ? 'bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white rounded-tr-sm'
                        : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm'
                        }`}
                    >
                      <p
                        className={`text-sm ${isFromCurrentUser
                          ? 'text-white'
                          : 'text-gray-900 dark:text-gray-100'
                          }`}
                      >
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${isFromCurrentUser
                          ? 'text-white/70'
                          : 'text-gray-500 dark:text-gray-400'
                          }`}
                      >
                        {new Date(message.sentAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 rounded-full w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg z-10"
          size="sm"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
