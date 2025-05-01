import { WifiOff, Wifi } from "lucide-react";

interface UserInfoProps {
    isRegistered: boolean;
}

export function UserInfo({ isRegistered }: UserInfoProps) {
    return (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mr-3">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                            UI
                        </span>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                            User
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            user@example.com
                        </div>
                    </div>
                </div>

                <button
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                        isRegistered
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                >
                    {isRegistered ? (
                        <>
                            <Wifi size={14} />
                            <span>Connected</span>
                        </>
                    ) : (
                        <>
                            <WifiOff size={14} />
                            <span>Disconnected</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
