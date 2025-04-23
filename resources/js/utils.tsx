// useSipClient.ts
import JsSIP from "jssip";

export function createSipUA(
    config: {
        uri: string;
        password: string;
        wsServers: string;
        user_agent: string;
    },
    setCallStatus: (status: string) => void,
    setCurrentSession: (session: JsSIP.RTCSession | null) => void
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
    });

    // Handle registration failure
    userAgent.on("registrationFailed", (e) => {
        console.error("Registration failed", e);
    });

    // Handle incoming call
    userAgent.on("newRTCSession", (e: any) => {
        const session = e.session;
        if (e.originator === "remote") {
            console.log("Incoming call...");
            setCallStatus("Incoming");

            // Event when the call ends
            session.on("terminated", () => {
                setCallStatus("Ended");
                setCurrentSession(null);
            });

            session.on("progress", function () {
                console.log("Call is in progress...");
                setCallStatus("Incoming");
            });

            session.on("accepted", () => {
                console.log("Call accepted!");
                setCallStatus("In Call");
            });

            session.on("failed", function (e: any) {
                console.log("call failed", e);
                setCallStatus("Call Failed");
            });

            session.on("ended", () => {
                console.log("Call ended!");
                setCallStatus("Call Ended");
            });

            setCurrentSession(session);
        }
    });

    userAgent.start();
    return userAgent;
}
