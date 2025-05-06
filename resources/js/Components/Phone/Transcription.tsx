import { usePage } from "@inertiajs/react";
import { forwardRef, useImperativeHandle, useState } from "react";

export type TranscriptionComponentProps = {
    setTranscripts?: (message: string[]) => void;
    isActiveCall?: boolean;
};

// Define what functions will be exposed to the parent via ref
export type TranscriptionComponentRef = {
    initializeDeepgram: (remoteStream: MediaStream | null) => void;
    stopRecording: () => void;
};

const Transcription = forwardRef<
    TranscriptionComponentRef,
    TranscriptionComponentProps
>(({ setTranscripts, isActiveCall }, ref) => {
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

    const initializeDeepgram = (remoteStream: MediaStream | null) => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((localStream: MediaStream) => {
                currentStream = new MediaStream();

                const audioContext = new AudioContext();
                const destination = audioContext.createMediaStreamDestination();

                console.log("currentStream", currentStream);
                console.log("remoteStream", remoteStream);

                // Add local mic audio tracks
                // localStream.getAudioTracks().forEach((track) => {
                //     currentStream.addTrack(track);
                // });
                // Local mic
                const localSource =
                    audioContext.createMediaStreamSource(localStream);
                localSource.connect(destination);

                // Add remote audio tracks
                // if (remoteStream) {
                //     remoteStream.getAudioTracks().forEach((track) => {
                //         currentStream.addTrack(track);
                //     });
                // }

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
                    "wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true&model=nova-3&smart_format=true",
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

                    if (
                        transcript &&
                        currentTranscript != transcript &&
                        isActiveCall
                    ) {
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

    return <div>{isActiveCall && <h1>{currentTranscript}</h1>}</div>;
});

export default Transcription;
