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

            session.on("accepted", (e: any) => {
                console.log("Call accepted!");
                stopRingtone(ringtone);
            });

            session.on("failed", function (e: any) {
                console.log("call failed");
                setIsCallIncoming(false);
                setDestination("");
                stopRingtone(ringtone);
            });

            session.on("ended", (e: any) => {
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

const calculateSimilarity = (s1: string, s2: string): number => {
    const words1 = new Set(
        s1
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 0)
    );
    const words2 = new Set(
        s2
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 0)
    );

    if (words1.size === 0 || words2.size === 0) {
        return 0; // Avoid division by zero if one string is empty
    }

    const intersection = new Set(
        [...words1].filter((word) => words2.has(word))
    );
    const union = new Set([...words1, ...words2]);

    return intersection.size / words1.size; // Percentage of words from s1 present in s2
};

export const filterRedundantTranscripts = (
    transcripts: string[],
    similarityThreshold: number = 0.7
) => {
    if (transcripts.length === 0) {
        return [];
    }

    if (transcripts.length === 1) {
        return [transcripts[0]];
    }

    const filteredTranscripts: string[] = [];
    const toRemoveIndices: Set<number> = new Set();

    for (let i = 0; i < transcripts.length - 1; i++) {
        const currentSentence = transcripts[i];
        const nextSentence = transcripts[i + 1];

        // Check for direct `startsWith` redundancy
        if (nextSentence.startsWith(currentSentence)) {
            toRemoveIndices.add(i);
            continue; // Move to the next iteration, as this one is definitely redundant
        }

        // Check for 70% content overlap (similarity)
        const similarity = calculateSimilarity(currentSentence, nextSentence);
        if (similarity >= similarityThreshold) {
            toRemoveIndices.add(i);
        }
    }

    // Add the last transcript if it wasn't marked for removal (as it has no 'nextSentence' to compare against)
    // or if the second to last transcript wasn't removed and it was redundant by itself.
    for (let i = 0; i < transcripts.length; i++) {
        if (!toRemoveIndices.has(i)) {
            filteredTranscripts.push(transcripts[i]);
        }
    }

    // The last item in the original array is always considered unless it was itself redundant based on previous items
    if (
        transcripts.length > 0 &&
        !toRemoveIndices.has(transcripts.length - 1)
    ) {
        filteredTranscripts.push(transcripts[transcripts.length - 1]);
    }

    // One final pass to ensure the last item is handled correctly
    if (
        transcripts.length > 0 &&
        !toRemoveIndices.has(transcripts.length - 1)
    ) {
        const lastOriginalIndex = transcripts.length - 1;
        let shouldAddLast = true;

        // If the last item was considered for removal in the loop, check if it was truly redundant.
        // This is a bit of a tricky edge case, but ensures the last item isn't accidentally dropped
        // if it's the most complete version.
        if (lastOriginalIndex > 0) {
            const secondToLast = transcripts[lastOriginalIndex - 1];
            const last = transcripts[lastOriginalIndex];
            if (
                last.startsWith(secondToLast) ||
                calculateSimilarity(secondToLast, last) >= similarityThreshold
            ) {
                // If the last item itself made the second-to-last redundant,
                // and the second-to-last was consequently removed, then we should keep the last.
                // However, if the last item itself was made redundant *by a later item that doesn't exist*,
                // then it should be kept. This logic ensures we always keep the most complete version.
                // The `toRemoveIndices` already handles previous items. We just need to make sure the last item is kept.
            }
        }
        if (
            shouldAddLast &&
            !filteredTranscripts.includes(transcripts[lastOriginalIndex])
        ) {
            filteredTranscripts.push(transcripts[lastOriginalIndex]);
        }
    }

    // Corrected logic for handling the last item
    const finalFilteredTranscripts: string[] = [];
    for (let i = 0; i < transcripts.length; i++) {
        if (!toRemoveIndices.has(i)) {
            finalFilteredTranscripts.push(transcripts[i]);
        }
    }

    // Ensure the very last item is always included if it's the most complete,
    // and it wasn't directly made redundant by starting with a previous item
    // or if its content wasn't subsumed by a *later* item (which doesn't exist for the last item).
    if (
        transcripts.length > 0 &&
        !toRemoveIndices.has(transcripts.length - 1)
    ) {
        finalFilteredTranscripts.push(transcripts[transcripts.length - 1]);
    }

    // Remove duplicates that might arise from the above logic if the last item was already pushed.
    return [...new Set(finalFilteredTranscripts)];
};
