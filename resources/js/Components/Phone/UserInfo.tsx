import { Contact } from "@/types";
import { Link, router, usePage } from "@inertiajs/react";
import { WifiOff, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

interface UserInfoProps {
    isRegistered: boolean;
    contacts: Contact[];
    authUser: any;
}

export function UserInfo({ isRegistered, contacts, authUser }: UserInfoProps) {
    const [currentStatus, setCurrentStatus] = useState<string | undefined>("");
    const [isSettingMessage, setIsSettingMessage] = useState(false);
    const [authUserMessage, setAuthUserMessage] = useState<string | undefined>(
        ""
    );

    useEffect(() => {
        let authUserContactData = contacts.find(
            (c) => c.user === authUser.meta.user
        );

        setAuthUserMessage(authUserContactData?.message);
        setCurrentStatus(authUserContactData?.message);
    }, [contacts]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSettingMessage(false);
        if (currentStatus == authUserMessage) {
            return;
        }
        router.post(
            route("status.store"),
            { message: authUserMessage },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <button
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                    isRegistered
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                } ml-auto`}
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
            <div className="flex items-center justify-between">
                <div className="flex items-center w-full">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mr-3">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                            {authUser.name
                                .split(" ")
                                .slice(0, 2)
                                .map((word: string) => word[0])
                                .join("")}
                        </span>
                    </div>

                    <div className="flex-grow">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {authUser.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {authUser.meta.user}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {isSettingMessage ? (
                                <input
                                    type="text"
                                    className="w-full mt-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-0 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={authUserMessage}
                                    onChange={(e) =>
                                        setAuthUserMessage(e.target.value)
                                    }
                                    onBlur={handleStatusChange}
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className="cursor-pointer break-words w-full"
                                    onClick={() => setIsSettingMessage(true)}
                                >
                                    ''{" "}
                                    {authUserMessage
                                        ? authUserMessage
                                        : "Set a status message"}
                                </div>
                            )}
                        </div>
                    </div>
                    {!isSettingMessage && (
                        <button
                            onClick={() => router.post(route("logout"))}
                            className="ml-auto text-xs font-medium dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 rounded-md transition-colors"
                        >
                            Log Out
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
