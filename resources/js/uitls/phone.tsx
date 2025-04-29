import JsSIP from "jssip";

export function call(
    ua: JsSIP.UA,
    destinationSIP: string,
    setCurrentSession: (session: JsSIP.RTCSession | null) => void,
    setIsActiveCall: (isActiveCall: boolean) => void,
    setState: (state: string) => void
) {
    const session = ua.call(destinationSIP, {
        mediaConstraints: { audio: true, video: false },
    });

    session.on("sending", function (e: any) {
        setState("Calling..");
        console.log("sending", e);
    });

    session.on("accepted", () => {
        console.log("Call accepted!");
        setIsActiveCall(true);
    });

    session.on("confirmed", () => {
        console.log("call confirmed");
        setState("");
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
                }
            });
        }
    });

    session.on("progress", function () {
        console.log("Call is in progress...");
    });

    session.on("failed", function (e: any) {
        console.log("call failed", e);
        setState("");
    });

    session.on("ended", () => {
        setIsActiveCall(false);
        setState("");
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
        }
    });

    setCurrentSession(session);
}
