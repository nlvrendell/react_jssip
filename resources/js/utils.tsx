import JsSIP from "jssip";
import { RTCSession } from "jssip/lib/RTCSession";

let ringtone: HTMLAudioElement | null = null;

export function createSipUA(
    config: {
        uri: string;
        password: string;
        wsServers: string;
        user_agent: string;
    },
    setCurrentSession: (session: RTCSession | null) => void,
    setIsRegistered: (status: boolean) => void,
    setIsCallIncoming: (status: boolean) => void,
    handleEndCall: () => void,
    setDestination: (destination: string) => void,
    setRemoteStream: (stream: MediaStream | null) => void,
    setCaller: (caller: string) => void
) {
    const socket = new JsSIP.WebSocketInterface(config.wsServers);
    // JsSIP.debug.enable("JsSIP:*");
    // JsSIP.debug.disable();

    const userAgent = new JsSIP.UA({
        uri: config.uri,
        password: config.password,
        user_agent: config.user_agent,
        sockets: [socket],
        session_timers: false,
    });

    userAgent.on("connected", () => {
        console.log("Connected to WebSocket");
    });

    userAgent.on("registered", () => {
        setIsRegistered(true);
        initializeRingTone();
    });

    userAgent.on("registrationFailed", (e) => {
        setIsRegistered(false);
        console.error("Registration failed", e);
    });

    userAgent.on("newRTCSession", (e: any) => {
        const session = e.session;
        setCaller(session?.remote_identity?._display_name);
        setDestination(session.remote_identity._uri._user);

        if (e.originator === "remote") {
            setIsCallIncoming(true);
            session.on("peerconnection", (e: any) => {
                console.log("RTCPeerConnection created");

                session.connection?.addEventListener("track", (event: any) => {
                    const remoteAudio = document.getElementById(
                        "remoteAudio"
                    ) as HTMLAudioElement;

                    if (remoteAudio && event.streams[0]) {
                        remoteAudio.srcObject = event.streams[0];
                        remoteAudio.play().catch((err) => {
                            console.error("Audio playback failed:", err);
                        });

                        setRemoteStream(event.streams[0]);
                    }
                });

                const pc = e.peerconnection;
            });

            // Event when the call ends
            session.on("terminated", () => {
                setCurrentSession(null);
            });

            session.on("progress", function () {
                console.log("Call is in progress...");
                if (ringtone) {
                    ringtone.play().catch((err) => {
                        console.error("Ringtone failed to play:", err);
                    });
                }
            });

            session.on("accepted", () => {
                console.log("Call accepted!");
                stopRingtone(ringtone);
            });

            session.on("failed", function (e: any) {
                console.log("call failed", e);
                setIsCallIncoming(false);
                setDestination("");
                stopRingtone(ringtone);
            });

            session.on("ended", () => {
                console.log("Call ended!");
                handleEndCall();
                setDestination("");
                stopRingtone(ringtone);
            });

            setCurrentSession(session);
        }
    });

    userAgent.start();
    return userAgent;
}

function stopRingtone(ringtone: HTMLAudioElement | null) {
    if (!ringtone) {
        return;
    }

    ringtone.pause();
    ringtone.currentTime = 0;
}

function initializeRingTone() {
    document.addEventListener(
        "mousemove",
        () => {
            if (!ringtone) {
                ringtone = new Audio("/ringtone.mp3");
                ringtone.loop = true;
            }
        },
        { once: true, passive: true }
    );
}
