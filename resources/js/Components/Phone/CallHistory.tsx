"use client";

import { CallHistoryItem } from "@/types";
import { CallHistoryTypeEnum } from "@/types/enum";
import axios from "axios";
import {
    PhoneIncoming,
    PhoneOutgoing,
    PhoneMissed,
    ArrowLeft,
} from "lucide-react";
import { useState } from "react";

interface CallHistoryProps {
    history: CallHistoryItem[];
    onSelect: (item: CallHistoryItem) => void;
    getContactNameThroughUser: (user: string) => string;
}

export function CallHistory({
    history,
    onSelect,
    getContactNameThroughUser,
}: CallHistoryProps) {
    const [scripts, setScripts] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(false);

    const formatCallTime = (date: string) => {
        const dateObj = unixTimestampToDate(parseInt(date, 10));
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ][dateObj.getDay()];
        } else {
            return dateObj.toLocaleDateString([], {
                month: "short",
                day: "numeric",
            });
        }
    };

    const unixTimestampToDate = (unixTimestamp: number) => {
        // Multiply by 1000 to convert seconds to milliseconds, as
        const milliseconds = unixTimestamp * 1000;
        // Create a new Date object using the milliseconds value.
        const dateObject = new Date(milliseconds);

        return dateObject;
    };

    const formatDuration = (seconds: number) => {
        if (seconds === 0) return "";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const [showTranscript, setShowTranscript] = useState(false);

    const onHistorySelect = (item: CallHistoryItem) => {
        setScripts(null);
        setLoading(true);
        if (item.CdrR?.term_callid) {
            axios
                .get(route("transcription", { termId: item.CdrR?.term_callid }))
                .then((response) => {
                    if (
                        response.data.transcripts &&
                        response.data.transcripts[0] !== null
                    ) {
                        setScripts(JSON.parse(response.data.transcripts));
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching transcripts:", error);
                });
        }

        setShowTranscript(true);
        // onSelect(item);
    };

    const getCallIcon = (type: string) => {
        switch (type) {
            case CallHistoryTypeEnum.OUTBOUND:
                return <PhoneIncoming size={16} className="text-emerald-500" />;
            case CallHistoryTypeEnum.INBOUND:
                return <PhoneOutgoing size={16} className="text-blue-500" />;
            case CallHistoryTypeEnum.MISSED:
                return <PhoneMissed size={16} className="text-red-500" />;
            default:
                return null;
        }
    };

    const getCallName = (contact: CallHistoryItem) => {
        if (contact.type == CallHistoryTypeEnum.OUTBOUND) {
            return getContactNameThroughUser(contact?.CdrR?.orig_req_user);
        }
        return contact?.CdrR?.orig_from_name;
    };

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {showTranscript ? (
                <div className="p-4">
                    <div className="flex flex-col">
                        <button
                            className="mb-4 self-start text-blue-500 hover:underline"
                            onClick={() => setShowTranscript(false)}
                        >
                            <ArrowLeft
                                size={20}
                                className="inline-block mr-2"
                            />
                            Back
                        </button>
                        <h1 className="text-xl font-semibold mb-2">
                            Transcript
                        </h1>
                        <div className="px-2">
                            {scripts ? (
                                scripts
                                    .filter((script) => script?.trim() !== "")
                                    .map((script, index) => (
                                        <div
                                            className="flex items-center mb-1"
                                            key={index}
                                        >
                                            <div
                                                className={`w-6 h-6 rounded-full ${
                                                    script[0] !== "R"
                                                        ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                                } flex items-center justify-center font-medium mr-3 text-sm`}
                                            >
                                                {script[0]}
                                            </div>
                                            <div className="flex-1">
                                                {script}
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    {loading ? (
                                        <div className="flex items-center">
                                            <svg
                                                className="animate-spin h-5 w-5 mr-3 text-gray-900 dark:text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span className="text-gray-900 dark:text-white">
                                                Loading...
                                            </span>
                                        </div>
                                    ) : (
                                        <p>No transcription for this call</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    {history.length > 0 ? (
                        history.map((item, index) => (
                            <button
                                key={index}
                                className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                                onClick={() => onHistorySelect(item)}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                                    {getCallIcon(item.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                                        {getCallName(item)}
                                        {item.type ==
                                            CallHistoryTypeEnum.MISSED && (
                                            <span className="text-red-500 dark:text-red-400">
                                                {" "}
                                                (Missed)
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.type ==
                                        CallHistoryTypeEnum.OUTBOUND
                                            ? item?.CdrR?.orig_req_user
                                            : item?.CdrR?.orig_sub}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatCallTime(item.time_release)}
                                    </div>
                                    {item.duration > 0 && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDuration(item.duration)}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No call history
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
