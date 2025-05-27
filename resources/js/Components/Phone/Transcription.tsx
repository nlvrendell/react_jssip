import { useForm, usePage } from "@inertiajs/react";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { RTCSession } from "jssip/lib/RTCSession";
import { filterRedundantTranscripts } from "@/utils";

export type TranscriptionComponentProps = {
    isActiveCall?: boolean;
    isImCaller?: boolean;
    currentSession: RTCSession | null;
    isMuted: boolean;
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
>(({ isActiveCall, isImCaller, currentSession, isMuted }, ref) => {
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

    var currentLocalScript = "";
    var currentRemoteScript = "";

    var currentLocalMicrophoneStream = useRef<MediaStream>();

    const [remoteSocket, setRemoteSocket] = useState<WebSocket>();
    const [remoteMicrophone, setRemoteMicrophone] = useState<MediaRecorder>(
        new MediaRecorder(new MediaStream())
    );

    const config = usePage().props.config as {
        deepgram_api_key: string;
    };

    useEffect(() => {
        if (currentLocalMicrophoneStream.current) {
            const audioTrack =
                currentLocalMicrophoneStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !isMuted;
            }
        }
    }, [isMuted]);

    const initializeDeepgram = () => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((localStream: MediaStream) => {
                currentLocalMicrophoneStream.current = localStream;

                const audioContext = new AudioContext();
                const destination = audioContext.createMediaStreamDestination();
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
                        currentLocalScript != transcript &&
                        isActiveCall
                    ) {
                        const labeledTranscript = `${speaker}: ${transcript}`;
                        currentLocalScript = transcript;

                        setCurrentTranscript(labeledTranscript); // to be shown as transcription below the webphone
                        setScripts((prev) => [...prev, labeledTranscript]);
                        if (scripts !== undefined) {
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
                    }
                };

                setSocket(newSocket);
            });
    };

    const initializeRemoteStream = (remoteStream: MediaStream) => {
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();

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

            if (
                transcript &&
                currentRemoteScript != transcript &&
                isActiveCall
            ) {
                const labeledTranscript = `${speaker}: ${transcript}`;
                currentRemoteScript = transcript;

                setCurrentTranscript(labeledTranscript); // to be shown as transcription below the webphone
                setScripts((prev) => [...prev, labeledTranscript]);

                if (scripts !== undefined) {
                    if (speaker == "Caller") {
                        setScriptsFromCaller((prev) => [...prev, transcript]);
                    } else {
                        setScriptsFromReceiver((prev) => [...prev, transcript]);
                    }
                }
                // console.log(labeledTranscript);
            }
        };

        setRemoteSocket(newSocket);
    };

    const transcriptForm = useForm({
        session_id: "",
        term_id: "",
        transcripts: [] as string[],
    });

    const stopRecording = () => {
        var holdId = currentSession?.id;

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

        let filteredTranscripts = filterRedundantTranscripts(scripts);
        // save from db

        if (currentSession) {
            transcriptForm.data.session_id = holdId ?? "";
            transcriptForm.data.term_id = holdId?.slice(0, 53) ?? "";
            transcriptForm.data.transcripts = filteredTranscripts;

            // console.log({
            //     scripts: scripts,
            //     filteredTranscripts: filteredTranscripts,
            // });

            if (
                transcriptForm.data.session_id.length >= 53 &&
                filteredTranscripts[0]
            ) {
                submitForm();
            }
        }

        setScripts([""]);
        setCurrentTranscript("");
    };

    const submitForm = () => {
        transcriptForm.submit("post", route("transcript.store"), {
            only: ["callHistory"],
        });
    };

    useImperativeHandle(ref, () => ({
        initializeDeepgram,
        initializeRemoteStream,
        stopRecording,
    }));

    return <div>{isActiveCall && <h1>{currentTranscript}</h1>}</div>;
});

export default Transcription;
