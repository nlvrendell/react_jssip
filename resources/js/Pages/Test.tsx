import { PageProps } from "@/types";
import { Head, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { useEffect, useState } from "react";
import JsSIP from "jssip";
import DangerButton from "@/Components/DangerButton";
import { RTCSession } from "jssip/lib/RTCSession";

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const [ua, setUa] = useState<JsSIP.UA | null>(null);
    const [currentSession, setCurrentSession] = useState<RTCSession | null>(
        null
    );
    const [callStatus, setCallStatus] = useState<string>("Idle");

    useEffect(() => {
        const config = {
            uri: "sip:1030wp@switchboard.developer.uc",
            password: "qf1R4XtJe93OKXjh",
            wsServers: "wss://core1-atl.ucsandbox.net:9002",
            user_agent: "RendellUser",
        };

        // const userAgent = createSipUA(config, setCurrentSession);
        // setUa(userAgent);

        // // Cleanup on unmount
        // return () => {
        //     userAgent.stop();
        // };
    }, []);

    const handleCall = (e: any) => {
        e.preventDefault();
        if (!ua) {
            console.log("UA not initialized");
            return;
        }

        if (!data.destination) {
            console.log("Destination not set");
            return;
        }

        const destinationSIP = `sip:${data.destination}@switchboard.developer.uc`;
        console.log("destinationSIP", destinationSIP);

        const session = ua.call(destinationSIP, {
            mediaConstraints: { audio: true, video: false },
        });

        console.log("session", session);

        session.on("sending", function (e: any) {
            console.log("sending", e);
            setCallStatus("Calling");
        });

        session.on("accepted", () => {
            console.log("Call accepted!");
            setCallStatus("In Call");
        });

        session.on("confirmed", () => {
            console.log("call confirmed");
            if (session.connection) {
                session.connection.addEventListener("track", (e: any) => {
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
            setCallStatus("In Progress");
        });

        session.on("failed", function (e: any) {
            console.log("call failed", e);
            setCallStatus("Call Failed");
        });

        session.on("ended", () => {
            console.log("Call ended!");
            setCallStatus("Call Ended");
        });

        session.connection.addEventListener("track", (e: any) => {
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
    };

    const { data, setData, processing, errors } = useForm({
        destination: "",
    });

    return (
        <>
            <Head title="Welcome" />

            <div className="bg-gray-50 text-black/50 ">
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <h1>SIP Client</h1>
                        <div>Call Status: {callStatus}</div>

                        <form onSubmit={handleCall}>
                            <div>
                                <InputLabel
                                    htmlFor="destination"
                                    value="Destination"
                                />

                                <TextInput
                                    id="destination"
                                    name="destination"
                                    value={data.destination}
                                    className="mt-1 block w-full"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => {
                                        setData("destination", e.target.value);
                                    }}
                                />

                                <InputError
                                    message={errors.destination}
                                    className="mt-2"
                                />
                            </div>
                            <div className="mt-4 flex items-center justify-end">
                                <PrimaryButton
                                    type="button"
                                    className="ms-4"
                                    disabled={processing}
                                    onClick={handleCall}
                                >
                                    Call
                                </PrimaryButton>
                                {callStatus === "In Call" && (
                                    <DangerButton
                                        type="button"
                                        className="ms-4"
                                        onClick={() => {
                                            if (currentSession) {
                                                currentSession.terminate();
                                            }
                                        }}
                                    >
                                        Hangup
                                    </DangerButton>
                                )}
                                {callStatus === "Incoming" && (
                                    <PrimaryButton
                                        type="button"
                                        className="ms-4"
                                        onClick={() => {
                                            if (currentSession) {
                                                currentSession.answer({
                                                    mediaConstraints: {
                                                        audio: true,
                                                        video: false,
                                                    },
                                                });
                                            }
                                        }}
                                    >
                                        Accept
                                    </PrimaryButton>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
