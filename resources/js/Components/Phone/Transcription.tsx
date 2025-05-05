import { usePage } from "@inertiajs/react";
import { forwardRef, useImperativeHandle, useState } from "react";

export type TranscriptionComponentProps = {
    setTranscripts?: (message: string[]) => void;
};

// Define what functions will be exposed to the parent via ref
export type ranscriptionComponentRef = {
    initializeDeepgram: () => void;
    stopRecording: () => void;
};

const Transcription = forwardRef<
    ranscriptionComponentRef,
    TranscriptionComponentProps
>(({ setTranscripts }, ref) => {
    const [socket, setSocket] = useState<WebSocket>();
    const [scripts, setScripts] = useState<string[]>([""]);
    const [microphone, setMicrophone] = useState<MediaRecorder>(
        new MediaRecorder(new MediaStream())
    );
    const [currentTranscript, setCurrentTranscript] = useState("");

    const config = usePage().props.config as {
        deepgram_api_key: string;
    };

    let currentStream: MediaStream;

    const initializeDeepgram = () => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                currentStream = stream;
                console.log("currentStream", currentStream);

                let newMicrophone = new MediaRecorder(stream, {
                    mimeType: "audio/webm",
                });

                let newSocket = new WebSocket(
                    "wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true",
                    ["token", config?.deepgram_api_key]
                );

                newSocket.onopen = () => {
                    newMicrophone?.addEventListener(
                        "dataavailable",
                        (event) => {
                            newSocket?.send(event.data);
                        }
                    );

                    // Start recording audio in 150ms chunks. The audio will be sent to the deepgram server
                    // as it is recorded. The server will then return a transcript of what was said.
                    newMicrophone?.start(50);

                    setMicrophone(newMicrophone);
                };

                newSocket.onmessage = (message) => {
                    const received = JSON.parse(message.data);
                    const transcript =
                        received?.channel?.alternatives[0].transcript;

                    if (transcript && currentTranscript != transcript) {
                        setCurrentTranscript(transcript);
                        setScripts((prev) => [...prev, transcript]);

                        if (
                            scripts !== undefined &&
                            setTranscripts !== undefined
                        ) {
                            setTranscripts(scripts);
                        }
                        console.log(transcript);
                    }
                };

                setSocket(socket);
            });
    };

    const stopRecording = () => {
        // stops the stream
        currentStream?.getTracks().forEach((track) => {
            if (track.readyState == "live") {
                track.stop();
            }
        });

        console.log("recoreded transription", scripts.join(","));

        microphone.stop();
        socket?.close();
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

    return (
        <div>
            <h1>{currentTranscript}</h1>
        </div>
    );
});

export default Transcription;
