"use client";

import React, { useState, useEffect } from "react";
import { X, Phone, Video, Loader2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageDto } from "@/types/customer/user.types";
import { VideoCallSessionData } from "@/types/video-call-api.types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { VideoCallSettings } from "@/types/video-call.types";
import { useMediaDevices } from "@/hooks/useLiveKitMedia";
import { joinVideoCall } from "@/lib/api/customer/video-call-api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Camera, CameraOff, Mic, MicOff, Volume2 } from "lucide-react";

interface VideoCallMessageProps {
    message: MessageDto;
    conversationId: number;
    onJoinCall?: (sessionId: string, settings: VideoCallSettings) => void;
    isJoiningCall?: boolean;
    userId?: string;
}

export function VideoCallMessage({ message, conversationId, onJoinCall, isJoiningCall, userId }: VideoCallMessageProps) {
    const [showSetupModal, setShowSetupModal] = useState(false);
    const { cameras, microphones, speakers, refreshDevices } = useMediaDevices();

    const [settings, setSettings] = useState<VideoCallSettings>({
        cameraEnabled: false,
        selectedCamera: null,
        availableCameras: [],
        microphoneEnabled: false,
        selectedMicrophone: null,
        availableMicrophones: [],
        selectedSpeaker: null,
        availableSpeakers: [],
        useComputerAudio: true,
        usePhoneAudio: false,
        joinWithVideo: false,
        joinWithAudio: false,
    });

    const [isStartingCall, setIsStartingCall] = useState(false);

    // Try to parse video call data from message content
    const parseVideoCallData = (content: string): VideoCallSessionData | null => {
        try {
            // Handle different formats
            let parsedData;

            if (typeof content === 'string') {
                // Try to parse as JSON
                parsedData = JSON.parse(content);
            } else {
                return null;
            }

            // Validate that we have the required fields
            if (parsedData && parsedData.videoCallSessionId) {
                return parsedData as VideoCallSessionData;
            }

            return null;
        } catch (error) {
            return null;
        }
    };

    const videoCallData = parseVideoCallData(message.content);

    // If it's not a video call message, return null (let parent handle it)
    if (!videoCallData) {
        return null;
    }

    // Load devices when modal opens
    useEffect(() => {
        if (showSetupModal) {
            refreshDevices();
        }
    }, [showSetupModal, refreshDevices]);

    // Update settings when devices are loaded
    useEffect(() => {
        if (cameras.length > 0 && microphones.length > 0 && speakers.length > 0) {
            setSettings(prev => {
                if (prev.selectedCamera && prev.selectedMicrophone && prev.selectedSpeaker) {
                    return prev;
                }

                return {
                    ...prev,
                    availableCameras: cameras,
                    availableMicrophones: microphones,
                    availableSpeakers: speakers,
                    selectedCamera: prev.selectedCamera || cameras[0]?.deviceId || null,
                    selectedMicrophone: prev.selectedMicrophone || microphones[0]?.deviceId || null,
                    selectedSpeaker: prev.selectedSpeaker || speakers[0]?.deviceId || null,
                };
            });
        }
    }, [cameras.length, microphones.length, speakers.length]);

    const handleSettingsChange = (newSettings: Partial<VideoCallSettings>) => {
        setSettings((prev: VideoCallSettings) => ({ ...prev, ...newSettings }));
    };

    const handleJoinCallClick = async () => {
        setShowSetupModal(true);
    };

    const handleJoinWithSettings = async () => {
        if (!videoCallData) {
            return;
        }

        setIsStartingCall(true);
        try {
            // Join the existing call
            const session = await joinVideoCall(
                videoCallData.videoCallSessionId,
                conversationId,
                userId
            );

            const settingsData = {
                cameraEnabled: settings.cameraEnabled,
                microphoneEnabled: settings.microphoneEnabled,
                selectedCamera: settings.selectedCamera,
                selectedMicrophone: settings.selectedMicrophone,
                selectedSpeaker: settings.selectedSpeaker,
                useComputerAudio: settings.useComputerAudio,
                usePhoneAudio: settings.usePhoneAudio
            };

            const videoCallUrl = `/video-call/${session.videoCallSessionId}?groupName=${encodeURIComponent("Cuộc gọi đang diễn ra")}&token=${encodeURIComponent(session.livekitToken)}&serverUrl=${encodeURIComponent(session.livekitServerUrl)}&settings=${encodeURIComponent(JSON.stringify(settingsData))}&isInitiator=false&userId=${encodeURIComponent(userId || '')}&conversationId=${encodeURIComponent(conversationId ? conversationId.toString() : '')}`;
            window.open(videoCallUrl, '_blank', 'noopener,noreferrer');

            // Call the join callback with settings if provided
            if (onJoinCall) {
                onJoinCall(videoCallData.videoCallSessionId, settings);
            }

            setShowSetupModal(false);
        } catch (error) {
            // Handle error silently or show toast
            console.error("Error joining call:", error);
        } finally {
            setIsStartingCall(false);
        }
    };

    const handleCancel = () => {
        setShowSetupModal(false);
    };

    // Format the time when the call started
    const callStartedTime = new Date(message.sentAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="flex justify-center my-4">
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4 shadow-lg max-w-sm w-full">
                <div className="flex flex-col items-center gap-3">
                    {/* Icon and Status */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-600/20 border border-green-500/30">
                            <Video className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-card-foreground font-semibold text-sm">
                                Cuộc gọi video đang diễn ra
                            </h4>
                            <p className="text-muted-foreground text-xs flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Bắt đầu lúc {callStartedTime}
                            </p>
                        </div>
                    </div>

                    {/* Call Details */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>Phiên gọi: {videoCallData.videoCallSessionId.substring(0, 8)}...</span>
                    </div>

                    {/* Action Button */}
                    {onJoinCall && (
                        <Button
                            onClick={handleJoinCallClick}
                            disabled={isJoiningCall}
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                            size="sm"
                        >
                            {isJoiningCall ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Đang tham gia...
                                </>
                            ) : (
                                <>
                                    <Video className="h-4 w-4 mr-2" />
                                    Tham gia cuộc gọi
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Video Call Setup Modal - 100% match with VideoCallSetupModal.tsx */}
            <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
                <DialogContent className="max-w-4xl w-full h-[600px] p-0 bg-transparent border-0 shadow-none sm:max-w-5xl lg:max-w-6xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Tham gia cuộc gọi đang diễn ra</DialogTitle>
                        <DialogDescription>
                            Thiết lập máy quay, thu âm và loa trước khi tham gia. Cuộc gọi sẽ mở trong tab mới.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative w-full h-full">
                        <div className="relative z-10 w-full h-full p-4">
                            <div className="bg-gradient-to-br from-card via-card to-muted/50 rounded-2xl shadow-2xl border border-border/20 w-full max-w-4xl h-full max-h-[600px] flex flex-col animate-in zoom-in-95 fade-in-0 duration-300 sm:max-w-5xl lg:max-w-6xl backdrop-blur-sm">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-border/50 flex-shrink-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/20">
                                            <Video className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-card-foreground text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                                                Tham gia cuộc gọi đang diễn ra
                                            </div>
                                            <div className="text-muted-foreground text-sm mt-1">
                                                Thiết lập máy quay, thu âm và loa trước khi tham gia. Cuộc gọi sẽ mở trong tab mới.
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCancel}
                                        className="text-muted-foreground hover:text-card-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-all duration-200"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Main Content */}
                                <div className="flex flex-1 flex-col lg:flex-row min-h-0">
                                    {/* Left Panel - Video Preview */}
                                    <div className="flex-1 lg:flex-none lg:w-3/5">
                                        <div className="flex flex-col h-full bg-card rounded-l-xl lg:rounded-l-xl rounded-t-xl lg:rounded-t-none">
                                            {/* Video Preview Area */}
                                            <div className="flex-1 relative bg-muted rounded-tl-xl lg:rounded-tl-xl rounded-t-xl lg:rounded-t-none overflow-hidden min-h-0 flex items-center justify-center">
                                                {settings.cameraEnabled ? (
                                                    <div className="flex flex-col items-center justify-center text-center">
                                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                                        <p className="text-sm text-muted-foreground">Đang tải camera...</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-center">
                                                        <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mb-4">
                                                            <Video className="w-8 h-8 text-muted-foreground" />
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">Bật để xem trước</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Panel - Audio Settings */}
                                    <div className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-border/50 bg-gradient-to-br from-muted/20 to-transparent">
                                        <div className="flex flex-col h-full bg-gradient-to-br from-card/80 via-card to-muted/30 rounded-r-xl lg:rounded-r-xl rounded-b-xl lg:rounded-b-none p-4 lg:p-6 overflow-y-auto scrollbar-hide backdrop-blur-sm">
                                            <div className="space-y-3 lg:space-y-4">
                                                {/* Audio Options */}
                                                <div className="space-y-3">
                                                    <h3 className="text-card-foreground font-bold text-xl bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">Cài đặt</h3>

                                                    <div className="space-y-2">
                                                        <RadioGroup
                                                            value={settings.useComputerAudio ? "computer" : "phone"}
                                                            onValueChange={(value) => {
                                                                if (value === "computer") {
                                                                    handleSettingsChange({ useComputerAudio: true, usePhoneAudio: false });
                                                                } else if (value === "phone") {
                                                                    handleSettingsChange({ useComputerAudio: false, usePhoneAudio: true });
                                                                }
                                                            }}
                                                            className="space-y-2"
                                                        >
                                                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors duration-200">
                                                                <RadioGroupItem
                                                                    value="computer"
                                                                    id="computer-audio"
                                                                    className="border-border data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 ring-2 ring-transparent data-[state=checked]:ring-cyan-400/20 transition-all duration-200"
                                                                />
                                                                <Label
                                                                    htmlFor="computer-audio"
                                                                    className="text-card-foreground font-medium cursor-pointer"
                                                                >
                                                                    Âm thanh máy tính
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors duration-200">
                                                                <RadioGroupItem
                                                                    value="phone"
                                                                    id="phone-audio"
                                                                    className="border-border data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 ring-2 ring-transparent data-[state=checked]:ring-cyan-400/20 transition-all duration-200"
                                                                />
                                                                <Label
                                                                    htmlFor="phone-audio"
                                                                    className="text-card-foreground font-medium cursor-pointer"
                                                                >
                                                                    Không sử dụng âm thanh
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                </div>

                                                {/* Camera Settings */}
                                                <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-cyan-500/10">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/10">
                                                                {settings.cameraEnabled ? (
                                                                    <Camera className="w-5 h-5 text-cyan-500" />
                                                                ) : (
                                                                    <CameraOff className="w-5 h-5 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <Label htmlFor="camera-toggle" className="text-card-foreground font-semibold">
                                                                Máy quay
                                                            </Label>
                                                        </div>
                                                        <Switch
                                                            id="camera-toggle"
                                                            checked={settings.cameraEnabled}
                                                            onCheckedChange={(checked) => handleSettingsChange({ cameraEnabled: checked, joinWithVideo: checked })}
                                                            className="data-[state=checked]:bg-cyan-500 ring-2 ring-transparent data-[state=checked]:ring-cyan-400/20 transition-all duration-200"
                                                        />
                                                    </div>

                                                    {/* Camera Selection */}
                                                    {settings.cameraEnabled && (
                                                        <div className="space-y-2">
                                                            <Label className="text-muted-foreground text-sm">Máy quay</Label>
                                                            <Select
                                                                value={settings.selectedCamera || ""}
                                                                onValueChange={(deviceId) => handleSettingsChange({ selectedCamera: deviceId })}
                                                            >
                                                                <SelectTrigger className="bg-card border-border text-card-foreground">
                                                                    <SelectValue placeholder="Chọn máy quay" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-card border-border">
                                                                    {settings.availableCameras.map((camera) => (
                                                                        <SelectItem
                                                                            key={camera.deviceId}
                                                                            value={camera.deviceId}
                                                                            className="text-card-foreground hover:bg-accent"
                                                                        >
                                                                            {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Microphone Settings */}
                                                <div className={`space-y-3 p-4 rounded-xl border transition-all duration-200 ${settings.useComputerAudio
                                                    ? 'bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border-purple-500/10'
                                                    : 'bg-muted/10 border-muted/20 opacity-50'
                                                    }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg transition-all duration-200 ${settings.useComputerAudio
                                                                ? 'bg-gradient-to-br from-purple-500/10 to-purple-600/10'
                                                                : 'bg-muted/20'
                                                                }`}>
                                                                {settings.microphoneEnabled && settings.useComputerAudio ? (
                                                                    <Mic className="w-5 h-5 text-purple-500" />
                                                                ) : (
                                                                    <MicOff className="w-5 h-5 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <Label htmlFor="mic-toggle" className={`font-semibold transition-all duration-200 ${settings.useComputerAudio ? 'text-card-foreground' : 'text-muted-foreground'
                                                                }`}>
                                                                Thu âm
                                                            </Label>
                                                        </div>
                                                        <Switch
                                                            id="mic-toggle"
                                                            checked={settings.microphoneEnabled && settings.useComputerAudio}
                                                            onCheckedChange={(checked) => handleSettingsChange({ microphoneEnabled: checked })}
                                                            disabled={!settings.useComputerAudio}
                                                            className="data-[state=checked]:bg-purple-500 ring-2 ring-transparent data-[state=checked]:ring-purple-400/20 transition-all duration-200 disabled:opacity-50"
                                                        />
                                                    </div>

                                                    {settings.microphoneEnabled && settings.useComputerAudio && (
                                                        <div className="space-y-2">
                                                            <div className="space-y-2">
                                                                <Label className="text-muted-foreground text-sm">Thu âm</Label>
                                                                <Select
                                                                    value={settings.selectedMicrophone || ""}
                                                                    onValueChange={(deviceId) => handleSettingsChange({ selectedMicrophone: deviceId })}
                                                                    disabled={!settings.useComputerAudio}
                                                                >
                                                                    <SelectTrigger className="bg-card border-border text-card-foreground disabled:opacity-50">
                                                                        <SelectValue placeholder="Chọn microphone" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-card border-border">
                                                                        {settings.availableMicrophones.map((mic) => (
                                                                            <SelectItem
                                                                                key={mic.deviceId}
                                                                                value={mic.deviceId}
                                                                                className="text-card-foreground hover:bg-accent"
                                                                            >
                                                                                {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Speaker Settings */}
                                                <div className={`space-y-3 p-4 rounded-xl border transition-all duration-200 ${settings.useComputerAudio
                                                    ? 'bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 border-indigo-500/10'
                                                    : 'bg-muted/10 border-muted/20 opacity-50'
                                                    }`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg transition-all duration-200 ${settings.useComputerAudio
                                                            ? 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/10'
                                                            : 'bg-muted/20'
                                                            }`}>
                                                            <Volume2 className={`w-5 h-5 transition-all duration-200 ${settings.useComputerAudio ? 'text-indigo-500' : 'text-muted-foreground'
                                                                }`} />
                                                        </div>
                                                        <Label className={`font-semibold transition-all duration-200 ${settings.useComputerAudio ? 'text-card-foreground' : 'text-muted-foreground'
                                                            }`}>
                                                            Loa
                                                        </Label>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground text-sm">Loa</Label>
                                                        <Select
                                                            value={settings.selectedSpeaker || ""}
                                                            onValueChange={(deviceId) => handleSettingsChange({ selectedSpeaker: deviceId })}
                                                            disabled={!settings.useComputerAudio}
                                                        >
                                                            <SelectTrigger className="bg-card border-border text-card-foreground disabled:opacity-50">
                                                                <SelectValue placeholder="Chọn loa" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-card border-border">
                                                                {settings.availableSpeakers.map((speaker) => (
                                                                    <SelectItem
                                                                        key={speaker.deviceId}
                                                                        value={speaker.deviceId}
                                                                        className="text-card-foreground hover:bg-accent"
                                                                    >
                                                                        {speaker.label || `Loa ${speaker.deviceId.slice(0, 8)}`}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between p-6 border-t border-border/50 flex-shrink-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent">
                                    <div className="text-sm text-muted-foreground">
                                        Cuộc gọi sẽ mở trong tab mới
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleCancel}
                                            disabled={isStartingCall}
                                            className="px-6 py-2 border-border/50 hover:bg-muted/50"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            onClick={handleJoinWithSettings}
                                            disabled={isStartingCall}
                                            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200"
                                        >
                                            {isStartingCall ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Đang mở cuộc gọi...
                                                </>
                                            ) : (
                                                <>
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Tham gia cuộc gọi
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}