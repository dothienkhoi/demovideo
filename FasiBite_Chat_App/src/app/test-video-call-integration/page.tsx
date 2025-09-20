"use client";

import { DirectChatHeader } from "@/components/features/chat/DirectChatHeader";
import { ConversationType } from "@/types/customer/user.types";
import { UserPresenceStatus } from "@/types/customer/models";

export default function TestVideoCallIntegrationPage() {
    // Mock data for testing
    const mockPartner = {
        userId: "test-partner-id",
        fullName: "Test Partner",
        avatarUrl: null,
        presenceStatus: UserPresenceStatus.Online
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Test Video Call Integration</h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                    <DirectChatHeader
                        conversationId={123}
                        partner={mockPartner}
                        displayName={mockPartner.fullName}
                        conversationType={ConversationType.Direct}
                        avatarUrl={mockPartner.avatarUrl}
                    />

                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Chat Interface</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            This is a test page to verify that the video call integration works correctly.
                            Click the video call button in the header above to test the functionality.
                        </p>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                Test Instructions:
                            </h3>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <li>• Click the video call button (📹) in the header</li>
                                <li>• Check that the connection status is working</li>
                                <li>• Verify that the outgoing call modal appears</li>
                                <li>• Test the call flow (this is a demo, so actual calls won't connect)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
