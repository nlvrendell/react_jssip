import JsSIP from "jssip";
import { RTCSession } from "jssip/lib/RTCSession";

export function call(
    ua: JsSIP.UA,
    destinationSIP: string,
    setCurrentSession: (session: RTCSession | null) => void,
    setIsActiveCall: (isActiveCall: boolean) => void,
    setRemoteStream: (stream: MediaStream | null) => void,
    fromDisplayName: string
) {
    const session = ua.call(destinationSIP, {
        mediaConstraints: { audio: true, video: false },
        fromDisplayName: fromDisplayName,
    });

    session.on("sending", function (e: any) {
        console.log("sending", e);
    });

    session.on("accepted", () => {
        console.log("Call accepted!");
    });

    session.on("confirmed", () => {
        console.log("call confirmed");
        if (session.connection) {
            session.connection.addEventListener("track", (e: any) => {
                console.log("track", e);
                const audio = document.createElement("audio");
                audio.style.display = "none";
                document.body.appendChild(audio);

                if (e.streams && e.streams[0]) {
                    audio.srcObject = e.streams[0];
                    audio.play().catch((err) => {
                        console.error("Audio play failed:", err);
                    });
                    setRemoteStream(e.streams[0]);
                }
            });
        }
    });

    session.on("progress", function () {
        console.log("Call is in progress...");
    });

    session.on("failed", function (e: any) {
        console.log("call failed", e);
    });

    session.on("ended", () => {
        setIsActiveCall(false);
        console.log("Call ended!");
    });

    session.connection.addEventListener("track", (e: any) => {
        console.log("track", e);
        const audio = document.createElement("audio");
        audio.style.display = "none";
        document.body.appendChild(audio);

        if (e.streams && e.streams.length > 0) {
            audio.srcObject = e.streams[0];
            audio.play().catch((err) => {
                console.error("Failed to play audio:", err);
            });
            setRemoteStream(e.streams[0]);
        }
    });

    setCurrentSession(session);
}
