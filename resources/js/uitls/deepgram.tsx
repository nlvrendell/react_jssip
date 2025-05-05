const initializeDeepgram = (s) => {
    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream: MediaStream) => {
            currentStream = stream;
            console.log("currentStream", currentStream);

            let newMicrophone = new MediaRecorder(stream, {
                mimeType: "audio/webm",
            });

            let newSocket = new WebSocket("wss://api.deepgram.com/v1/listen", [
                "token",
                "9287a156fdfafaee5e1a26ccfecd941785124709",
            ]);

            newSocket.onopen = () => {
                newMicrophone?.addEventListener("dataavailable", (event) => {
                    newSocket?.send(event.data);
                });

                // Start recording audio in 150ms chunks. The audio will be sent to the deepgram server
                // as it is recorded. The server will then return a transcript of what was said.
                newMicrophone?.start(50);

                setMicrophone(newMicrophone);
            };

            newSocket.onmessage = (message) => {
                const received = JSON.parse(message.data);
                const transcript =
                    received?.channel?.alternatives[0].transcript;

                if (transcript) {
                    setTranscripts((prev) => [...prev, transcript]);
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

    microphone?.stop();
    socket?.close();
    stopStream();
};

export { initializeDeepgram, stopRecording };