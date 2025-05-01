"use client";

import { CallHistoryItem } from "@/types";
import { PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";

interface CallHistoryProps {
    history: CallHistoryItem[];
    onSelect: (item: CallHistoryItem) => void;
}

export function CallHistory({ history, onSelect }: CallHistoryProps) {
    const formatCallTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], {
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
            ][date.getDay()];
        } else {
            return date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
            });
        }
    };

    const formatDuration = (seconds: number) => {
        if (seconds === 0) return "";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getCallIcon = (type: string) => {
        switch (type) {
            case "incoming":
                return <PhoneIncoming size={16} className="text-emerald-500" />;
            case "outgoing":
                return <PhoneOutgoing size={16} className="text-blue-500" />;
            case "missed":
                return <PhoneMissed size={16} className="text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {history.length > 0 ? (
                history.map((item) => (
                    <button
                        key={item.id}
                        className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                        onClick={() => onSelect(item)}
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                            {getCallIcon(item.type)}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {item.name}
                                {item.type === "missed" && (
                                    <span className="text-red-500 dark:text-red-400">
                                        {" "}
                                        (Missed)
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.number}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatCallTime(item.timestamp)}
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
    );
}
