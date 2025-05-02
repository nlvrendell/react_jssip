import { useEffect, useRef, useState } from "react";

interface MediaDeviceOption {
    deviceId: string;
    label: string;
}

export default function MicrophoneSelect() {
    const [selectedMic, setSelectedMic] = useState<string>("");
    const [microphones, setMicrophones] = useState<MediaDeviceOption[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const getMicrophones = async () => {
            try {
                // Request permission if needed
                await navigator.mediaDevices.getUserMedia({ audio: true });

                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices
                    .filter(
                        (device) =>
                            device.kind === "audioinput" &&
                            device.deviceId !== "default" &&
                            device.deviceId !== "communications"
                    )
                    .map((device) => ({
                        deviceId: device.deviceId,
                        label: device.label,
                    }));

                setMicrophones(audioInputs);

                if (audioInputs.length > 0) {
                    const savedMic = localStorage.getItem("preferredMic");
                    const hasSaved = audioInputs.some(
                        (d) => d.deviceId === savedMic
                    );
                    if (hasSaved && savedMic) {
                        setSelectedMic(savedMic);
                        return;
                    }

                    setSelectedMic(audioInputs[0].deviceId);
                }
            } catch (error) {
                console.error("Error accessing microphones:", error);
            }
        };

        getMicrophones();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDeviceId = e.target.value;
        setSelectedMic(newDeviceId);
        switchMicrophone(newDeviceId);
        localStorage.setItem("preferredMic", newDeviceId);
    };

    const switchMicrophone = async (deviceId: string) => {
        try {
            // Stop existing stream if present
            if (streamRef.current) {
                streamRef.current
                    ?.getTracks()
                    .forEach((track: MediaStreamTrack) => track.stop());
            }

            const newStream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: deviceId } },
            });

            streamRef.current = newStream;

            // Optional: connect it to an <audio> or processor
            // Example: play it
            const audioElement = document.getElementById(
                "live-audio"
            ) as HTMLAudioElement;
            if (audioElement) {
                audioElement.srcObject = newStream;
                audioElement.play();
            }
        } catch (error) {
            console.error("Failed to switch microphone:", error);
        }
    };

    return (
        <div>
            <label
                htmlFor="audio-volume"
                className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
                Microphone
            </label>

            <select
                id="mic-select"
                value={selectedMic}
                onChange={handleChange}
                className="w-full  bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white text-sm"
            >
                {microphones.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                        {mic.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
