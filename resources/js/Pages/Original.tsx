import { PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Pause,
    Play,
    UserPlus,
    WifiOff,
    PhoneForwarded,
} from "lucide-react";
import { NextLayout } from "@/Layouts/NextLayout";
import ThemeToggle from "@/Components/ThemeToggle";
import JsSIP from "jssip";
import { createSipUA } from "@/utils";
import { call } from "@/uitls/phone";

export default function WebPhone() {
    const [isActiveCall, setIsActiveCall] = useState(false);
    const [destination, setDestination] = useState("");
    const [isMuted, setIsMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isRegistered, setIsRegistered] = useState(true);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferDestination, setTransferDestination] = useState("");
    const [state, setState] = useState("Disconnected");

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActiveCall) {
            interval = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActiveCall]);
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };
    const handleCall = () => {
        if (destination.trim() && isRegistered) {
            setIsActiveCall(true);
        }
    };
    const handleEndCall = () => {
        setIsActiveCall(false);
        setIsMuted(false);
        setIsOnHold(false);
        setIsTransferring(false);
        setTransferDestination("");
    };
    const toggleMute = () => {
        setIsMuted(!isMuted);
    };
    const toggleHold = () => {
        setIsOnHold(!isOnHold);
    };
    const toggleRegistration = () => {
        if (isActiveCall) {
            // End call if we're disconnecting
            handleEndCall();
        }
        setIsRegistered(!isRegistered);
    };

    const transferCall = () => {
        if (!transferDestination) {
            alert("Enter a valid user extension");
            return;
        }

        // var receiver = new JsSIP.URI(
        //     "sip",
        //     `${transferedTo.value}wp`,
        //     "switchboard.developer.uc"
        // );

        // var holdSession = toRaw(session.value);

        // try {
        //     holdSession.refer(receiver, {
        //         extraHeaders: [`Contact: sip:1030wp@switchboard.developer.uc`],
        //     });
        //     holdSession.on("accepted", function (e) {
        //         console.log("call accepted", e);
        //         callAccepted.value = true;
        //     });
        //     isTransferring.value = false;
        //     clearSession();
        // } catch (err) {
        //     console.log("Error badi!", err);
        // }
    };

    return (
        <NextLayout>
            <Head title="Original" />
            <div className="w-full max-w-md mx-auto">
                <div className="phone-container bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-2">
                        <button
                            onClick={toggleRegistration}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                
                                isRegistered
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    isRegistered
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                                }`}
                            ></span>
                            {isRegistered ? "Registered" : "Disconnected"}
                        </button>
                        <ThemeToggle />
                    </div>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-gray-900 dark:text-white text-xl font-medium">
                            {isActiveCall ? "Active Call" : "Phone"}
                        </h1>
                        {isActiveCall && (
                            <div className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full text-emerald-600 dark:text-emerald-400 text-sm font-medium">
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
                                className={`w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                                    !isRegistered ? "opacity-60" : ""
                                }`}
                                value={destination}
                                onChange={(e) =>
                                    !isActiveCall &&
                                    setDestination(e.target.value)
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
                    {/* Transfer Destrination Input */}
                    {isActiveCall && isTransferring && (
                        <div>
                            <input
                                type="text"
                                placeholder="type transfer destination"
                                className={`my-2 w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                                value={transferDestination}
                                onChange={(e) =>
                                    isActiveCall &&
                                    setTransferDestination(e.target.value)
                                }
                            />
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
                            {isActiveCall && isTransferring && (
                                <button
                                    className="w-full bg-gray-600 hover:bg-green-500 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                    onClick={transferCall}
                                >
                                    <PhoneForwarded size={18} />
                                    <span>Forward</span>
                                </button>
                            )}
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
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
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
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
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
                                <button
                                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                    onClick={() =>
                                        setIsTransferring(!isTransferring)
                                    }
                                >
                                    <UserPlus size={20} />
                                    <span className="mt-2 text-xs font-medium">
                                        {isTransferring ? "Cancel Transfer" : "Transfer"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                    {isActiveCall && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
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
                                        {isOnHold
                                            ? "Call on hold"
                                            : "Call active"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </NextLayout>
    );
}
