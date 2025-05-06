import { usePage } from "@inertiajs/react";
import { forwardRef, useImperativeHandle, useState } from "react";

export type TranscriptionComponentProps = {
    setTranscripts?: (message: string[]) => void;
    isActiveCall?: boolean;
    isImCaller?: boolean;
};

// Define what functions will be exposed to the parent via ref
export type TranscriptionComponentRef = {
    initializeDeepgram: (remoteStream: MediaStream | null) => void;
    stopRecording: () => void;
};

const Transcription = forwardRef<
    TranscriptionComponentRef,
    TranscriptionComponentProps
>(({ setTranscripts, isActiveCall, isImCaller }, ref) => {
    const [socket, setSocket] = useState<WebSocket>();
    const [scripts, setScripts] = useState<string[]>([""]);
    const [microphone, setMicrophone] = useState<MediaRecorder>(
        new MediaRecorder(new MediaStream())
    );
    const [currentTranscript, setCurrentTranscript] = useState("");
    const [scriptsFromCaller, setScriptsFromCaller] = useState<string[]>([""]);
    const [scriptsFromReceiver, setScriptsFromReceiver] = useState<string[]>([
        "",
    ]);

    const config = usePage().props.config as {
        deepgram_api_key: string;
    };

    let currentStream: MediaStream;

    const initializeDeepgram = (remoteStream: MediaStream | null) => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((localStream: MediaStream) => {
                currentStream = new MediaStream();

                const audioContext = new AudioContext();
                const destination = audioContext.createMediaStreamDestination();

                console.log("currentStream", currentStream);
                console.log("remoteStream", remoteStream);

                const localSource =
                    audioContext.createMediaStreamSource(localStream);
                localSource.connect(destination);

                if (remoteStream) {
                    const remoteSource =
                        audioContext.createMediaStreamSource(remoteStream);
                    remoteSource.connect(destination);
                }

                const mixedStream = destination.stream;

                let newMicrophone = new MediaRecorder(mixedStream, {
                    mimeType: "audio/webm",
                });

                let newSocket = new WebSocket(
                    "wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true&model=nova-3&smart_format=true&utterances=true&multichannel=true&diarize=true",
                    ["token", config?.deepgram_api_key]
                );

                newSocket.onopen = () => {
                    newMicrophone?.addEventListener(
                        "dataavailable",
                        (event) => {
                            if (isActiveCall) {
                                newSocket?.send(event.data);
                            }
                        }
                    );

                    // Start recording audio in 150ms chunks. The audio will be sent to the deepgram server
                    newMicrophone?.start(100);

                    setMicrophone(newMicrophone);
                };

                newSocket.onmessage = (message) => {
                    const received = JSON.parse(message.data);
                    const transcript =
                        received?.channel?.alternatives[0].transcript;

                    const words = received?.channel?.alternatives[0].words;

                    const source =
                        words?.[0]?.speaker == 1 ? "Remote" : "Local"; // Adjust labels as needed.

                    let speaker = "";
                    if (source == "Local") {
                        // the speaker is me
                        speaker = isImCaller ? "Caller" : "Receiver";
                    } else {
                        // the speaker is the other person
                        speaker = isImCaller ? "Receiver" : "Caller";
                    }

                    if (
                        transcript &&
                        currentTranscript != transcript &&
                        isActiveCall
                    ) {
                        const labeledTranscript = `${speaker}: ${transcript}`;
                        console.log("received", {
                            message: message,
                            received: received,
                            channel: received?.channel,
                            localStream: localStream,
                            remoteStream: remoteStream,
                            labeledTranscript: labeledTranscript,
                        });

                        setCurrentTranscript(labeledTranscript);
                        setScripts((prev) => [...prev, transcript]);

                        if (
                            scripts !== undefined &&
                            setTranscripts !== undefined
                        ) {
                            setTranscripts(scripts);
                            if (speaker == "Caller") {
                                setScriptsFromCaller((prev) => [
                                    ...prev,
                                    transcript,
                                ]);
                            } else {
                                setScriptsFromReceiver((prev) => [
                                    ...prev,
                                    transcript,
                                ]);
                            }
                        }
                        console.log(labeledTranscript);
                    }
                };

                setSocket(newSocket);
            });
    };

    const stopRecording = () => {
        console.log({
            all: scripts.join(","),
            scriptsFromCaller: scriptsFromCaller.join(","),
            scriptsFromReceiver: scriptsFromReceiver.join(","),
        });

        if (microphone && microphone.state === "recording") {
            microphone.stop();
            console.log("MediaRecorder stopped.");
        }

        // Close the WebSocket connection
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
            console.log("Deepgram WebSocket closed.");
        }

        stopStream();
        setScripts([""]);
        setCurrentTranscript("");
    };

    const stopStream = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            currentStream?.getTracks().forEach((track) => {
                if (track.readyState == "live") {
                    track.stop();
                }
            });
        });
    };

    useImperativeHandle(ref, () => ({
        initializeDeepgram,
        stopRecording,
    }));

    return <div>{isActiveCall && <h1>{currentTranscript}</h1>}</div>;
});

export default Transcription;
