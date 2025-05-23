import { useEffect, useState } from "react";
import { Volume2, Bell, Phone, Monitor, Shield, MicVocal } from "lucide-react";
import MicrophoneSelect from "@/Components/Phone/Settings/MicrophoneSelect";

export function Settings() {
    const [notifications, setNotifications] = useState(
        localStorage.getItem("notifications-enabled") == "true"
    );
    const [autoAnswer, setAutoAnswer] = useState(
        localStorage.getItem("auto-answer") == "true"
    );

    useEffect(() => {
        // desktop notification
        const notifRef = localStorage.getItem("notifications-enabled");
        notifRef == "true" ? setNotifications(true) : setNotifications(false);

        // auto answer
        const autoAnswerRef = localStorage.getItem("auto-answer");
        autoAnswerRef == "true" ? setAutoAnswer(true) : setAutoAnswer(false);
    }, []);

    useEffect(() => {
        notifications == true
            ? localStorage.setItem("notifications-enabled", "true")
            : localStorage.setItem("notifications-enabled", "false");

        if (notifications) {
            getNotificationPermission();
        }
    }, [notifications]);

    useEffect(() => {
        notifications == true
            ? localStorage.setItem("notifications-enabled", "true")
            : localStorage.setItem("notifications-enabled", "false");

        if (notifications) {
            getNotificationPermission();
        }
    }, [notifications]);

    useEffect(() => {
        autoAnswer == true
            ? localStorage.setItem("auto-answer", "true")
            : localStorage.setItem("auto-answer", "false");
    }, [autoAnswer]);

    async function getNotificationPermission() {
        const permission = await Notification.requestPermission();
        console.log("permission", permission);
        if (permission === "granted") {
            setNotifications(true);
            console.log("Notification permission granted.");
        } else if (permission === "denied") {
            setNotifications(false);
            console.log("Notification permission denied.");
        }
    }

    return (
        <div className="p-4 overflow-y-auto">
            <div className="space-y-6">
                {/* Microphone Settings */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <MicVocal size={16} />
                        Microphone Settings
                    </h3>
                    <div className="space-y-3">
                        <MicrophoneSelect />
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell size={16} />
                        Notifications
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Enable notifications
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications}
                                onChange={() =>
                                    setNotifications(!notifications)
                                }
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>
                </div>

                {/* Call Settings */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Phone size={16} />
                        Call Settings
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Auto-answer calls
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoAnswer}
                                onChange={() => setAutoAnswer(!autoAnswer)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
