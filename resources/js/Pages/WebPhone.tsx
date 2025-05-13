import { useEffect, useState } from "react";
import ThemeToggle from "@/Components/ThemeToggle";
import { ContactsList } from "@/Components/Phone/ContactList";
import { CallHistoryItem, Contact } from "@/types";
import { CallHistory } from "@/Components/Phone/CallHistory";
import { Teams } from "@/Components/Phone/Teams";
import { Settings } from "@/Components/Phone/Settings";
import { UserInfo } from "@/Components/Phone/UserInfo";
import { NextLayout } from "@/Layouts/NextLayout";
import {
    Phone,
    UserPlus,
    Clock,
    SettingsIcon,
    CircleParking,
} from "lucide-react";
import { PhoneUI } from "@/Components/Phone/PhoneUI";
import { Head, usePage } from "@inertiajs/react";
import { createSipUA } from "@/utils";
import JsSIP from "jssip";
import { call } from "@/uitls/phone";
import { CallHistoryTypeEnum } from "@/types/enum";
import { Parks } from "@/Components/Phone/Parks";

export default function WebPhone() {
    const [destination, setDestination] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);
    const [isActiveCall, setIsActiveCall] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [activeSection, setActiveSection] = useState("phone");
    const [currentSession, setCurrentSession] =
        useState<JsSIP.RTCSession | null>(null);
    const [state, setState] = useState("");
    const [ua, setUa] = useState<JsSIP.UA | null>(null);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferDestination, setTransferDestination] = useState("");
    const [isCallIncoming, setIsCallIncoming] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isImCaller, setIsImCaller] = useState(false);
    const [callHistory, setCallHistory] = useState(
        usePage().props.callHistory as CallHistoryItem[]
    );

    const config = usePage().props.config as {
        domain: string;
        uri: string;
        password: string;
        server: string;
        user_agent: string;
    };

    const contacts = usePage().props.contacts as Contact[];

    const authUser = usePage().props.auth.user as any;

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
            setIsCallIncoming,
            setState,
            handleEndCall,
            setDestination,
            setRemoteStream
        );
        setUa(userAgent);

        // Cleanup on unmount
        return () => {
            userAgent.stop();
        };
    }, []);

    const handleContactSelect = (contact: Contact) => {
        if (isTransferring) {
            setTransferDestination(contact?.user);
            return;
        }

        setDestination(contact.user);
    };

    const handleHistorySelect = (item: CallHistoryItem) => {
        var destination = item.CdrR.orig_sub;
        if (item.type == CallHistoryTypeEnum.OUTBOUND) {
            destination = item.CdrR.orig_req_user;
        }

        if (isTransferring) {
            setTransferDestination(destination);
            return;
        }

        setDestination(destination);
    };

    const handleCall = () => {
        if (destination.trim() && isRegistered) {
            if (!ua) {
                console.log("UA not initialized");
                return;
            }

            setIsActiveCall(true);

            const destinationSIP = `sip:${destination.trim()}@${config.domain}`;

            call(
                ua,
                destinationSIP,
                setCurrentSession,
                setIsActiveCall,
                setState,
                setRemoteStream
            );

            setIsImCaller(true);

            // Add to call history
            const contact = contacts.find(
                (c) =>
                    c.user === destination ||
                    c.first_name
                        .toLowerCase()
                        .includes(destination.toLowerCase()) ||
                    c.last_name
                        .toLowerCase()
                        .includes(destination.toLowerCase())
            );

            const newCall: CallHistoryItem = {
                cdr_id: Date.now().toString(),
                first_name: contact?.first_name || "",
                last_name: contact?.last_name || "",
                number: contact?.user || destination,
                time_start: Math.floor(Date.now() / 1000).toString(),
                time_release: Math.floor(Date.now() / 1000).toString(),
                type: CallHistoryTypeEnum.OUTBOUND,
                duration: 0,
                CdrR: {
                    orig_from_name: authUser?.name,
                    orig_sub: authUser?.meta.user,
                    orig_req_user: destination.trim(),
                },
            };

            setCallHistory((prev) => [newCall, ...prev]);
        }
    };

    const handleEndCall = () => {
        if (currentSession && !currentSession.isEnded()) {
            currentSession.terminate();
        }
        setIsActiveCall(false);
        setIsMuted(false);
        setIsOnHold(false);
        setIsTransferring(false);
        setTransferDestination("");
        setDestination("");
        setIsImCaller(false);

        // Update the duration of the most recent call
        setCallHistory((prev) => {
            const updated = [...prev];
            if (updated[0]) {
                updated[0] = { ...updated[0], duration: callDuration };
            }
            return updated;
        });
    };

    const getContactNameThroughUser = (user: string) => {
        let contact = contacts.find((c) => c.user === user);

        return contact
            ? contact.first_name + " " + contact.last_name
            : "Unknown";
    };

    // Render the active section content
    const renderContent = () => {
        switch (activeSection) {
            case "phone":
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-hidden">
                            {activeSection === "phone" && (
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 overflow-y-auto">
                                        <ContactsList
                                            contacts={contacts}
                                            onSelect={handleContactSelect}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case "history":
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto">
                            <CallHistory
                                history={callHistory}
                                onSelect={handleHistorySelect}
                                getContactNameThroughUser={
                                    getContactNameThroughUser
                                }
                            />
                        </div>
                    </div>
                );
            case "teams":
                return <Teams />;
            case "settings":
                return <Settings />;
            case "parks":
                return <Parks />;
            default:
                return null;
        }
    };

    const toggleMute = () => {
        if (!currentSession) {
            return;
        }
        var isMuted = currentSession.isMuted()?.audio;

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

        if (!currentSession) {
            console.log("No current session");
            return;
        }

        setState("Transferring..");

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

            handleEndCall();
        } catch (err) {
            console.log("Error badi!", err);
        }
    };

    const answerCall = () => {
        if (currentSession) {
            currentSession.answer({
                mediaConstraints: {
                    audio: true,
                    video: false,
                },
            });

            setIsCallIncoming(false);
            setIsActiveCall(true);

            const contact = contacts.find(
                (c) =>
                    c.user === destination.replace(/wp$/, "") ||
                    c.first_name
                        .toLowerCase()
                        .includes(destination.toLowerCase()) ||
                    c.last_name
                        .toLowerCase()
                        .includes(destination.toLowerCase())
            );

            const newCall: CallHistoryItem = {
                cdr_id: Date.now().toString(),
                first_name: "",
                last_name: "",
                number: contact?.user || destination,
                time_start: Math.floor(Date.now() / 1000).toString(),
                time_release: Math.floor(Date.now() / 1000).toString(),
                type: CallHistoryTypeEnum.INBOUND,
                duration: 0,
                CdrR: {
                    orig_from_name: contact
                        ? contact?.first_name + " " + contact?.last_name
                        : "Unknown",
                    orig_sub: destination.trim(),
                    orig_req_user: authUser?.meta.user,
                },
            };

            setCallHistory((prev) => [newCall, ...prev]);
        }
    };

    return (
        <NextLayout>
            <Head title="WebPhone" />
            <audio id="remoteAudio" autoPlay playsInline />
            <div className="w-full h-screen flex">
                {/* Left Sidebar */}
                <div className="w-1/4 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                    {/* Logo/App Name */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center p-3 text-left">
                            Webphone
                        </h1>
                        <ThemeToggle />
                    </div>

                    {/* Sidebar Navigation - Using flex-1 and flex-col to take remaining space */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex flex-1 min-h-0">
                            {/* Navigation Menu */}
                            <div className="w-16 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                                <nav className="flex flex-col items-center py-4 gap-4">
                                    <button
                                        onClick={() =>
                                            setActiveSection("phone")
                                        }
                                        className={`p-3 rounded-lg ${
                                            activeSection === "phone"
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                                        }`}
                                        title="Contacts"
                                    >
                                        <Phone size={20} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveSection("history")
                                        }
                                        className={`p-3 rounded-lg ${
                                            activeSection === "history"
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                                        }`}
                                        title="Call History"
                                    >
                                        <Clock size={20} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveSection("teams")
                                        }
                                        className={`p-3 rounded-lg ${
                                            activeSection === "teams"
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                                        }`}
                                        title="Teams"
                                    >
                                        <UserPlus size={20} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveSection("parks")
                                        }
                                        className={`p-3 rounded-lg ${
                                            activeSection === "parks"
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                                        }`}
                                        title="Parks"
                                    >
                                        <CircleParking size={20} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveSection("settings")
                                        }
                                        className={`p-3 rounded-lg ${
                                            activeSection === "settings"
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                                        }`}
                                        title="Settings"
                                    >
                                        <SettingsIcon size={20} />
                                    </button>
                                </nav>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                {/* Section Header */}
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {activeSection === "phone" &&
                                            "Contacts"}
                                        {activeSection === "history" &&
                                            "Call History"}
                                        {activeSection === "teams" && "Teams"}
                                        {activeSection === "settings" &&
                                            "Settings"}
                                        {activeSection === "parks" && "Parks"}
                                    </h2>
                                </div>

                                {/* Section Content - Ensure it's scrollable */}
                                <div className="flex-1 overflow-y-auto">
                                    {renderContent()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Info - Fixed at bottom */}
                    <div className="border-t border-gray-200 dark:border-gray-800">
                        <UserInfo
                            isRegistered={isRegistered}
                            contacts={contacts}
                            authUser={authUser}
                        />
                    </div>
                </div>

                {/* Main Content - Phone UI */}
                <div className="w-3/4 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <PhoneUI
                        destination={destination}
                        isRegistered={isRegistered}
                        isActiveCall={isActiveCall}
                        callDuration={callDuration}
                        isMuted={isMuted}
                        isOnHold={isOnHold}
                        transferDestination={transferDestination}
                        isTransferring={isTransferring}
                        isCallIncoming={isCallIncoming}
                        setCallDuration={setCallDuration}
                        toggleMute={toggleMute}
                        setDestination={setDestination}
                        toggleHold={toggleHold}
                        handleCall={handleCall}
                        handleEndCall={handleEndCall}
                        setTransferDestination={setTransferDestination}
                        setIsTransferring={setIsTransferring}
                        transferCall={transferCall}
                        setIsCallIncoming={setIsCallIncoming}
                        answerCall={answerCall}
                        session={currentSession}
                        remoteStream={remoteStream}
                        isImCaller={isImCaller}
                    />
                </div>
            </div>
        </NextLayout>
    );
}
