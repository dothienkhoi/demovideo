import { DirectChatHeader } from "./DirectChatHeader";
import { GroupChatHeader } from "./GroupChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import {
  ConversationDetailDto,
  ConversationType,
} from "@/types/customer/user.types";
import { useVideoCallManager } from "@/hooks/useVideoCallManager";

interface ChatInterfaceProps {
  conversationDetails: ConversationDetailDto;
}

export function ChatInterface({ conversationDetails }: ChatInterfaceProps) {
  const {
    joinVideoCall,
    isJoiningCall,
    createVideoCall,
    isCreatingCall,
    activeVideoCall,
    openVideoCall,
  } = useVideoCallManager({ conversationId: conversationDetails.conversationId });

  const handleJoinVideoCall = async (sessionId: string) => {
    try {
      const sessionData = await joinVideoCall(sessionId);
      // Open video call room after successfully joining
      openVideoCall(sessionData, conversationDetails.displayName);
    } catch (error) {
      console.error("Failed to join video call:", error);
    }
  };

  const handleCreateVideoCall = async () => {
    try {
      console.log("Creating new video call...");
      const sessionData = await createVideoCall();
      console.log("Video call created:", sessionData);
    } catch (error) {
      console.error("Failed to create video call:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      {/* Header with enhanced styling */}
      <div className="border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
        {conversationDetails.conversationType === ConversationType.Group ? (
          <GroupChatHeader conversationDetails={conversationDetails} />
        ) : (
          <DirectChatHeader
            conversationId={conversationDetails.conversationId}
            partner={conversationDetails.partner}
            displayName={conversationDetails.displayName}
            conversationType={conversationDetails.conversationType}
            avatarUrl={conversationDetails.avatarUrl}
          />
        )}
      </div>

      {/* Message area with gradient background */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 via-transparent to-gray-50/30 dark:from-gray-800/20 dark:via-transparent dark:to-gray-800/20" />
        <div className="relative z-10 h-full">
          <MessageList
            initialMessagesPage={conversationDetails.messagesPage}
            conversationId={conversationDetails.conversationId}
            onJoinVideoCall={handleJoinVideoCall}
            isJoiningVideoCall={isJoiningCall}
            onCreateVideoCall={handleCreateVideoCall}
            isCreatingVideoCall={isCreatingCall}
            activeVideoCallSessionId={activeVideoCall?.videoCallSessionId || null}
          />
        </div>
      </div>

      {/* Input area with glassmorphism effect */}
      <div className="border-t border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg">
        <ChatInput conversationId={conversationDetails.conversationId} />
      </div>
    </div>
  );
}
