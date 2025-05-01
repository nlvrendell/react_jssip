import { useState } from "react";
import { Volume2, Bell, Phone, Monitor, Shield } from "lucide-react";

export function Settings() {
    const [audioVolume, setAudioVolume] = useState(80);
    const [ringtoneVolume, setRingtoneVolume] = useState(70);
    const [notifications, setNotifications] = useState(true);
    const [autoAnswer, setAutoAnswer] = useState(false);
    const [darkTheme, setDarkTheme] = useState(true);

    return (
        <div className="p-4 overflow-y-auto">
            <div className="space-y-6">
                {/* Audio Settings */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Volume2 size={16} />
                        Audio Settings
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label
                                htmlFor="audio-volume"
                                className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                            >
                                Call Volume: {audioVolume}%
                            </label>
                            <input
                                id="audio-volume"
                                type="range"
                                min="0"
                                max="100"
                                value={audioVolume}
                                onChange={(e) =>
                                    setAudioVolume(
                                        Number.parseInt(e.target.value)
                                    )
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="ringtone-volume"
                                className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                            >
                                Ringtone Volume: {ringtoneVolume}%
                            </label>
                            <input
                                id="ringtone-volume"
                                type="range"
                                min="0"
                                max="100"
                                value={ringtoneVolume}
                                onChange={(e) =>
                                    setRingtoneVolume(
                                        Number.parseInt(e.target.value)
                                    )
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                        </div>
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

                {/* Display Settings */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Monitor size={16} />
                        Display Settings
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Dark theme
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={darkTheme}
                                onChange={() => setDarkTheme(!darkTheme)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield size={16} />
                        Security
                    </h3>
                    <button className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 rounded-md transition-colors">
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
}
