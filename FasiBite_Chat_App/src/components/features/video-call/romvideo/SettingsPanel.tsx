"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Camera, Mic, PhoneOff, Volume2, Users } from "lucide-react";
import { useMediaDevices } from "@/hooks/useLiveKitMedia";
import { EndCallForAllModal } from "./EndCallForAllModal";

interface SettingsPanelProps {
    onClose: () => void;
    onEndCallForAll: () => void;
    isLeavingCall: boolean;
    isVisible?: boolean;
    sessionId: string;
    initialSettings?: {
        selectedCamera?: string | null;
        selectedMicrophone?: string | null;
        selectedSpeaker?: string | null;
    };
}

export function SettingsPanel({ onClose, onEndCallForAll, isLeavingCall, isVisible = true, sessionId, initialSettings }: SettingsPanelProps) {
    const { cameras, microphones, speakers, refreshDevices } = useMediaDevices();

    // Settings state
    const [roomSettings, setRoomSettings] = useState({
        selectedCamera: initialSettings?.selectedCamera || null,
        selectedMicrophone: initialSettings?.selectedMicrophone || null,
        selectedSpeaker: initialSettings?.selectedSpeaker || null,
    });

    // Modal state
    const [showEndCallModal, setShowEndCallModal] = useState(false);

    // Debug modal state
    useEffect(() => {
        console.log("Modal state changed:", showEndCallModal);
    }, [showEndCallModal]);

    // Handle device changes
    const handleCameraChange = (deviceId: string) => {
        setRoomSettings(prev => ({ ...prev, selectedCamera: deviceId }));
    };

    // Get device name by ID
    const getDeviceName = (deviceId: string | null, devices: any[]) => {
        if (!deviceId) return "Chưa chọn thiết bị";
        const device = devices.find(d => d.deviceId === deviceId);
        return device?.label || `Device ${deviceId.slice(0, 8)}`;
    };

    const handleMicrophoneChange = (deviceId: string) => {
        setRoomSettings(prev => ({ ...prev, selectedMicrophone: deviceId }));
    };

    const handleSpeakerChange = (deviceId: string) => {
        setRoomSettings(prev => ({ ...prev, selectedSpeaker: deviceId }));
    };

    // Handle end call modal
    const handleEndCallClick = () => {
        console.log("End call button clicked, opening modal");
        setShowEndCallModal(true);
    };




    // Load devices when component mounts
    useEffect(() => {
        refreshDevices();
    }, [refreshDevices]);

    // Update settings when initialSettings change
    useEffect(() => {
        if (initialSettings) {
            setRoomSettings({
                selectedCamera: initialSettings.selectedCamera || null,
                selectedMicrophone: initialSettings.selectedMicrophone || null,
                selectedSpeaker: initialSettings.selectedSpeaker || null,
            });
        }
    }, [initialSettings]);

    // Update settings when devices are loaded
    useEffect(() => {
        if (cameras.length > 0 && microphones.length > 0 && speakers.length > 0) {
            setRoomSettings(prev => {
                return {
                    ...prev,
                    selectedCamera: prev.selectedCamera || cameras[0]?.deviceId || null,
                    selectedMicrophone: prev.selectedMicrophone || microphones[0]?.deviceId || null,
                    selectedSpeaker: prev.selectedSpeaker || speakers[0]?.deviceId || null,
                };
            });
        }
    }, [cameras.length, microphones.length, speakers.length]);


    return (
        <>
            <div className={`absolute right-0 top-0 h-full w-80 bg-card border-l border-border flex flex-col z-50 transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="p-4 border-b border-border bg-gradient-to-b from-background/80 to-transparent">
                    <div className="flex items-center justify-between">
                        <h3 className="text-card-foreground font-medium">Cài đặt</h3>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted"
                        >
                            ×
                        </Button>
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-6 overflow-y-auto">

                    {/* Camera Settings */}
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-cyan-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/10">
                                <Camera className="w-5 h-5 text-cyan-500" />
                            </div>
                            <Label className="text-card-foreground font-semibold">
                                Máy quay
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Máy quay</Label>
                            <Select
                                value={roomSettings.selectedCamera || ""}
                                onValueChange={handleCameraChange}
                            >
                                <SelectTrigger className="bg-card border-border text-card-foreground max-w-full overflow-hidden">
                                    <SelectValue
                                        placeholder={getDeviceName(roomSettings.selectedCamera, cameras)}
                                        className="truncate max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {cameras.map((camera) => (
                                        <SelectItem
                                            key={camera.deviceId}
                                            value={camera.deviceId}
                                            className="text-card-foreground hover:bg-accent truncate"
                                            title={camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                                        >
                                            {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Microphone Settings */}
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border border-purple-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                                <Mic className="w-5 h-5 text-purple-500" />
                            </div>
                            <Label className="text-card-foreground font-semibold">
                                Thu âm
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Thu âm</Label>
                            <Select
                                value={roomSettings.selectedMicrophone || ""}
                                onValueChange={handleMicrophoneChange}
                            >
                                <SelectTrigger className="bg-card border-border text-card-foreground max-w-full overflow-hidden">
                                    <SelectValue
                                        placeholder={getDeviceName(roomSettings.selectedMicrophone, microphones)}
                                        className="truncate max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {microphones.map((microphone) => (
                                        <SelectItem
                                            key={microphone.deviceId}
                                            value={microphone.deviceId}
                                            className="text-card-foreground hover:bg-accent truncate"
                                            title={microphone.label || `Microphone ${microphone.deviceId.slice(0, 8)}`}
                                        >
                                            {microphone.label || `Microphone ${microphone.deviceId.slice(0, 8)}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Speaker Settings */}
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-green-500/5 to-blue-500/5 border border-green-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
                                <Volume2 className="w-5 h-5 text-green-500" />
                            </div>
                            <Label className="text-card-foreground font-semibold">
                                Loa
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Loa</Label>
                            <Select
                                value={roomSettings.selectedSpeaker || ""}
                                onValueChange={handleSpeakerChange}
                            >
                                <SelectTrigger className="bg-card border-border text-card-foreground max-w-full overflow-hidden">
                                    <SelectValue
                                        placeholder={getDeviceName(roomSettings.selectedSpeaker, speakers)}
                                        className="truncate max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {speakers.map((speaker) => (
                                        <SelectItem
                                            key={speaker.deviceId}
                                            value={speaker.deviceId}
                                            className="text-card-foreground hover:bg-accent truncate"
                                            title={speaker.label || `Speaker ${speaker.deviceId.slice(0, 8)}`}
                                        >
                                            {speaker.label || `Speaker ${speaker.deviceId.slice(0, 8)}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* End Call Button */}
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-red-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10">
                                <Users className="w-5 h-5 text-red-500" />
                            </div>
                            <Label className="text-card-foreground font-semibold">
                                Cuộc gọi
                            </Label>
                        </div>
                        <Button
                            onClick={handleEndCallClick}
                            disabled={isLeavingCall}
                            variant="destructive"
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                            {isLeavingCall ? "Đang kết thúc..." : "Kết thúc tất cả"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* End Call For All Modal */}
            <EndCallForAllModal
                isOpen={showEndCallModal}
                onClose={() => setShowEndCallModal(false)}
                sessionId={sessionId}
                onCallEnded={onEndCallForAll}
            />
        </>
    );
}
