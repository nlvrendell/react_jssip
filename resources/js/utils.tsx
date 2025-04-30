// useSipClient.ts
import JsSIP from "jssip";

let ringtone: HTMLAudioElement | null = null;

export function createSipUA(
    config: {
        uri: string;
        password: string;
        wsServers: string;
        user_agent: string;
    },
    setCurrentSession: (session: JsSIP.RTCSession | null) => void,
    setIsRegistered: (status: boolean) => void,
    setIsCallIncoming: (status: boolean) => void,
    setState: (state: string) => void,
    handleEndCall: () => void,
    setDestination: (destination: string) => void
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

    // Handle registration success
    userAgent.on("connected", () => {
        console.log("Connected to WebSocket");
    });

    userAgent.on("registered", () => {
        console.log("SIP Registered");
        setIsRegistered(true);
        initializeRingTone();
    });

    // Handle registration failure
    userAgent.on("registrationFailed", (e) => {
        setIsRegistered(false);
        console.error("Registration failed", e);
    });

    // Handle incoming call
    userAgent.on("newRTCSession", (e: any) => {
        const session = e.session;
        console.log("caller data", session.remote_identity._uri._user);
        setDestination(session.remote_identity._uri._user);
        if (e.originator === "remote") {
            console.log("Incoming call...");
            setIsCallIncoming(true);
            setState("Incoming Call..");

            session.on("peerconnection", () => {
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
                    }
                });
            });

            // Event when the call ends
            session.on("terminated", () => {
                setState("Incoming Call..");
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
                setState("");
                stopRingtone(ringtone);
            });

            session.on("failed", function (e: any) {
                console.log("call failed", e);
                setState("");
                setIsCallIncoming(false);
                setDestination("");
                stopRingtone(ringtone);
            });

            session.on("ended", () => {
                console.log("Call ended!");
                handleEndCall();
                setState("");
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
            console.log("mouse mousemove");
            if (!ringtone) {
                ringtone = new Audio("/ringtone.mp3");
                ringtone.loop = true;
            }
        },
        { once: true, passive: true }
    );
}
