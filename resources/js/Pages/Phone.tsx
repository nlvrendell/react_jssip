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
    PhoneForwarded,
    WifiOff,
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
    const [ua, setUa] = useState<JsSIP.UA | null>(null);
    const [currentSession, setCurrentSession] =
        useState<JsSIP.RTCSession | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferDestination, setTransferDestination] = useState("");
    const [state, setState] = useState("");

    const config = usePage().props.config as {
        domain: string;
        uri: string;
        password: string;
        server: string;
        user_agent: string;
    };

    useEffect(() => {
        getMicrophonePermission();
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

    // separate useEffect for jssip cause isActive refresh the session everytime it updates
    useEffect(() => {
        const uaConfig = {
            uri: config.uri,
            password: config.password,
            wsServers: config.server,
            user_agent: config.user_agent,
        };

        const userAgent = createSipUA(
            uaConfig,
            setCurrentSession,
            setIsRegistered,
            setState
        );
        setUa(userAgent);

        // Cleanup on unmount
        return () => {
            userAgent.stop();
        };
    }, []);

    async function getMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            // .then((stream) => console.log(stream))
            // .catch((err) => console.log('err', err));

            stream.getTracks().forEach((track) => track.stop()); // Stop the stream
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const handleCall = () => {
        if (!destination.trim()) {
            console.log("Destination not set");
            return;
        }

        if (!ua) {
            console.log("UA not initialized");
            return;
        }

        const destinationSIP = `sip:${destination.trim()}@${config.domain}`;

        call(ua, destinationSIP, setCurrentSession, setIsActiveCall, setState);
    };

    const handleEndCall = () => {
        if (currentSession) {
            currentSession.terminate();
        }
        setIsActiveCall(false);
        setIsMuted(false);
        setIsOnHold(false);
        setIsTransferring(false);
        setTransferDestination("");
    };

    const toggleMute = () => {
        if (!currentSession) {
            return;
        }
        var isMuted = currentSession.isMuted()?.audio;

        console.log("isMuted", isMuted);

        isMuted ? currentSession.unmute() : currentSession.mute();

        setIsMuted(!isMuted);
    };

    const toggleHold = () => {
        if (!currentSession) {
            return;
        }

        var isOnhold = currentSession.isOnHold();

        isOnhold?.local
            ? currentSession.unhold({}, () => {
                  console.log("unholded!");
              })
            : currentSession.hold({}, () => {
                  console.log("holded!");
              });

        setIsOnHold(!isOnHold);
    };

    const transferCall = () => {
        if (!transferDestination.trim()) {
            alert("Enter a valid user extension");
            return;
        }

        const destinationSIP = `sip:${transferDestination.trim()}@${
            config.domain
        }`;

        if (!currentSession) {
            console.log("No current session");
            return;
        }

        setState("Transferring..");
        console.log("destinationSIP", destinationSIP);

        var receiver = new JsSIP.URI(
            "sip",
            `${transferDestination.trim()}wp`,
            config.domain
        );

        try {
            currentSession.refer(receiver, {
                extraHeaders: [`Contact: ${config.uri}`],
            });
            currentSession.on("accepted", function (e: any) {
                console.log("call accepted", e);
            });
            setTransferDestination("");
        } catch (err) {
            console.log("Error badi!", err);
        }
    };

    return (
        <NextLayout>
            <Head title="Phone" />
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-white dark:from-gray-950 dark:to-black p-4 transition-colors duration-300">
                <div className="w-full max-w-md mx-auto">
                    <div className="phone-container bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center mb-2">
                            <button
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    state
                                        ? "bg-orange-300 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                        : isRegistered
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        state
                                            ? "bg-orange-500"
                                            : isRegistered
                                            ? "bg-emerald-500"
                                            : "bg-red-500"
                                    }`}
                                ></span>
                                {state
                                    ? state
                                    : isRegistered
                                    ? "Registered"
                                    : "Disconnected"}
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
                                {/* Transfer Button */}
                                {isActiveCall && isTransferring && (
                                    <button
                                        className="w-full bg-gray-600 hover:bg-green-500 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                        onClick={transferCall}
                                    >
                                        <PhoneForwarded size={18} />
                                        <span>Forward</span>
                                    </button>
                                )}

                                {/* End Call Button */}
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
                                            {isTransferring
                                                ? "Cancel Transfer"
                                                : "Transfer"}
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
