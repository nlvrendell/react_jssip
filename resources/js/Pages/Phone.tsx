import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Pause,
    Play,
    UserPlus,
    Moon,
    Sun,
} from "lucide-react";
import { NextLayout } from "@/Layouts/NextLayout";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Only show the toggle after component mounts to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9"></div>; // Placeholder to prevent layout shift
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const [isActiveCall, setIsActiveCall] = useState(false);
    const [destination, setDestination] = useState("");
    const [isMuted, setIsMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

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
        if (destination.trim()) {
            setIsActiveCall(true);
        }
    };

    const handleEndCall = () => {
        setIsActiveCall(false);
        setIsMuted(false);
        setIsOnHold(false);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const toggleHold = () => {
        setIsOnHold(!isOnHold);
    };

    return (
        <NextLayout>
            <Head title="Phone" />
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-white dark:from-gray-950 dark:to-black p-4 transition-colors duration-300">
                <div className="w-full max-w-md mx-auto">
                    <div className="phone-container bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-gray-900 dark:text-white text-xl font-medium">
                                {isActiveCall ? "Active Call" : "Phone"}
                            </h1>

                            <div className="flex items-center gap-3">
                                {isActiveCall && (
                                    <div className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                        {formatTime(callDuration)}
                                    </div>
                                )}

                                <ThemeToggle />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="type destination"
                                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={destination}
                                    onChange={(e) =>
                                        !isActiveCall &&
                                        setDestination(e.target.value)
                                    }
                                    readOnly={isActiveCall}
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

                        {!isActiveCall ? (
                            // Normal State
                            <button
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                onClick={handleCall}
                                disabled={!destination.trim()}
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

                                    <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                                        <UserPlus size={20} />
                                        <span className="mt-2 text-xs font-medium">
                                            Transfer
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
            </main>
        </NextLayout>
    );
}
