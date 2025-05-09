import { usePage } from "@inertiajs/react";
import { forwardRef, useImperativeHandle, useState } from "react";

export type TranscriptionComponentProps = {
    setTranscripts?: (message: string[]) => void;
    isActiveCall?: boolean;
    isImCaller?: boolean;
};

// Define what functions will be exposed to the parent via ref
export type TranscriptionComponentRef = {
    initializeDeepgram: () => void;
    initializeRemoteStream: (remoteStream: MediaStream) => void;
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

    const [remoteSocket, setRemoteSocket] = useState<WebSocket>();
    const [remoteMicrophone, setRemoteMicrophone] = useState<MediaRecorder>(
        new MediaRecorder(new MediaStream())
    );

    const config = usePage().props.config as {
        deepgram_api_key: string;
    };

    let currentStream: MediaStream;

    const initializeDeepgram = () => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((localStream: MediaStream) => {
                const audioContext = new AudioContext();
                const destination = audioContext.createMediaStreamDestination();

                console.log("localStream", localStream);

                audioContext
                    .createMediaStreamSource(localStream)
                    .connect(destination);

                const mixedStream = destination.stream;

                let newMicrophone = new MediaRecorder(mixedStream, {
                    mimeType: "audio/webm",
                });

                let newSocket = new WebSocket(
                    "wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true&model=nova-3&smart_format=true&utterances=true&multichannel=true&diarize=true&extra=source:local",
                    ["token", config?.deepgram_api_key]
                );

                newSocket.onopen = () => {
                    newMicrophone?.addEventListener(
                        "dataavailable",
                        (event) => {
                            if (
                                isActiveCall &&
                                newSocket.readyState == WebSocket.OPEN
                            ) {
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

                    if (received?.metadata?.extra?.source != "local") {
                        return;
                    }

                    let speaker = isImCaller ? "Caller" : "Receiver";

                    if (
                        transcript &&
                        currentTranscript != transcript &&
                        isActiveCall
                    ) {
                        const labeledTranscript = `${speaker}: ${transcript}`;
                        console.log("received", {
                            message: message,
                            received: received,
                            localStream: localStream,
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

    const initializeRemoteStream = (remoteStream: MediaStream) => {
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();

        console.log("remoteStream", remoteStream);

        audioContext.createMediaStreamSource(remoteStream).connect(destination);

        const mixedStream = destination.stream;

        let newMicrophone = new MediaRecorder(mixedStream, {
            mimeType: "audio/webm",
        });

        let newSocket = new WebSocket(
            "wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true&model=nova-3&smart_format=true&utterances=true&multichannel=true&diarize=true",
            ["token", config?.deepgram_api_key]
        );

        newSocket.onopen = () => {
            newMicrophone?.addEventListener("dataavailable", (event) => {
                if (isActiveCall && newSocket.readyState == WebSocket.OPEN) {
                    newSocket?.send(event.data);
                }
            });

            // Start recording audio in 150ms chunks. The audio will be sent to the deepgram server
            newMicrophone?.start(100);
            setRemoteMicrophone(newMicrophone);
        };

        newSocket.onmessage = (message) => {
            const received = JSON.parse(message.data);
            const transcript = received?.channel?.alternatives[0].transcript;

            if (received?.metadata?.extra?.source == "local") {
                return;
            }

            let speaker = isImCaller ? "Receiver" : "Caller";

            if (transcript && currentTranscript != transcript && isActiveCall) {
                const labeledTranscript = `${speaker}: ${transcript}`;
                console.log("received from remote", {
                    message: message,
                    received: received,
                    channel: received?.channel,
                    remoteStream: remoteStream,
                    labeledTranscript: labeledTranscript,
                });

                setCurrentTranscript(labeledTranscript);
                setScripts((prev) => [...prev, transcript]);

                if (scripts !== undefined && setTranscripts !== undefined) {
                    setTranscripts(scripts);
                    if (speaker == "Caller") {
                        setScriptsFromCaller((prev) => [...prev, transcript]);
                    } else {
                        setScriptsFromReceiver((prev) => [...prev, transcript]);
                    }
                }
                console.log(labeledTranscript);
            }
        };

        setRemoteSocket(newSocket);
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
        if (socket) {
            socket.close();
            console.log("Deepgram WebSocket closed.");
        }

        if (remoteMicrophone && remoteMicrophone.state === "recording") {
            remoteMicrophone.stop();
            console.log("MediaRecorder stopped.");
        }

        // Close the WebSocket connection
        if (remoteSocket) {
            remoteSocket.close();
            console.log("Deepgram WebSocket closed.");
        }

        setScripts([""]);
        setCurrentTranscript("");
    };


    useImperativeHandle(ref, () => ({
        initializeDeepgram,
        initializeRemoteStream,
        stopRecording,
    }));

    return <div>{isActiveCall && <h1>{currentTranscript}</h1>}</div>;
});

export default Transcription;
