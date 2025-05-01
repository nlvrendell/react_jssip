"use client";

import { useEffect } from "react";
import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Pause,
    Play,
    UserPlus,
    WifiOff,
} from "lucide-react";

interface PhoneUIProps {
    destination: string;
    setDestination: (value: string) => void;
    isRegistered: boolean;
    isActiveCall: boolean;
    callDuration: number;
    setCallDuration: (value: number) => void;
    isMuted: boolean;
    setIsMuted: (value: boolean) => void;
    isOnHold: boolean;
    setIsOnHold: (value: boolean) => void;
    handleCall: () => void;
    handleEndCall: () => void;
}

export function PhoneUI({
    destination,
    setDestination,
    isRegistered,
    isActiveCall,
    callDuration,
    setCallDuration,
    isMuted,
    setIsMuted,
    isOnHold,
    setIsOnHold,
    handleCall,
    handleEndCall,
}: PhoneUIProps) {
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActiveCall) {
            interval = setInterval(() => {
                setCallDuration(callDuration + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActiveCall, setCallDuration]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const toggleHold = () => {
        setIsOnHold(!isOnHold);
    };

    return (
        <div className="w-full max-w-lg m-auto bg-gray-50 dark:bg-gray-900">
            <div className="phone-container bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-gray-900 dark:text-white text-xl font-medium">
                        {isActiveCall ? "Active Call" : "Phone"}
                    </h1>

                    {isActiveCall && (
                        <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                            {formatTime(callDuration)}
                        </div>
                    )}
                </div>

                {/* Destination Input */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="type destination"
                            className={`w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-0 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                                !isRegistered ? "opacity-60" : ""
                            }`}
                            value={destination}
                            onChange={(e) =>
                                !isActiveCall && setDestination(e.target.value)
                            }
                            readOnly={isActiveCall}
                            disabled={!isRegistered}
                        />
                        {isActiveCall && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                <div className="flex items-center gap-2">
                                    <span className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    <span className="text-emerald-600 dark:text-emerald-500 text-xs font-medium">
                                        Connected
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {!isRegistered && (
                    <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                        <WifiOff size={16} />
                        <span>
                            Not connected to service. Please check your
                            connection.
                        </span>
                    </div>
                )}

                {!isActiveCall ? (
                    // Normal State
                    <button
                        className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                            !isRegistered || !destination.trim()
                                ? "opacity-50 cursor-not-allowed hover:bg-emerald-600 hover:scale-100"
                                : ""
                        }`}
                        onClick={handleCall}
                        disabled={!isRegistered || !destination.trim()}
                    >
                        <Phone size={18} />
                        <span>call</span>
                    </button>
                ) : (
                    // Active Call State
                    <div className="space-y-4">
                        <button
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            onClick={handleEndCall}
                        >
                            <PhoneOff size={18} />
                            <span>End call</span>
                        </button>

                        <div className="grid grid-cols-3 gap-3">
                            <button
                                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                                    isMuted
                                        ? "bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400"
                                        : "bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                                onClick={toggleMute}
                            >
                                {isMuted ? (
                                    <MicOff size={20} />
                                ) : (
                                    <Mic size={20} />
                                )}
                                <span className="mt-2 text-xs font-medium">
                                    Mute
                                </span>
                            </button>

                            <button
                                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                                    isOnHold
                                        ? "bg-gray-200 dark:bg-gray-700 text-amber-600 dark:text-amber-400"
                                        : "bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                                onClick={toggleHold}
                            >
                                {isOnHold ? (
                                    <Play size={20} />
                                ) : (
                                    <Pause size={20} />
                                )}
                                <span className="mt-2 text-xs font-medium">
                                    Hold
                                </span>
                            </button>

                            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                                <UserPlus size={20} />
                                <span className="mt-2 text-xs font-medium">
                                    Transfer
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {isActiveCall && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        isMuted
                                            ? "bg-red-500"
                                            : "bg-emerald-500"
                                    }`}
                                ></div>
                                <span>
                                    {isMuted
                                        ? "Microphone off"
                                        : "Microphone on"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        isOnHold
                                            ? "bg-amber-500"
                                            : "bg-emerald-500"
                                    }`}
                                ></div>
                                <span>
                                    {isOnHold ? "Call on hold" : "Call active"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
