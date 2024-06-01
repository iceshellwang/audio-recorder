import { useState, useRef, useEffect } from "react";
import './Recorder.css';

const mimeType = "audio/webm";

const AudioRecorder = () => {
	const [permission, setPermission] = useState(false);

	const mediaRecorder = useRef(null);

	const [recordingStatus, setRecordingStatus] = useState("inactive");

	const [stream, setStream] = useState(null);

	const [audio, setAudio] = useState(null);

	const [audioChunks, setAudioChunks] = useState([]);

    useEffect(()=> {
        getMicrophonePermission()
    },[])

	const getMicrophonePermission = async () => {
		if ("MediaRecorder" in window) {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					audio: true,
					video: false,
				});
				setPermission(true);
				setStream(mediaStream);
			} catch (err) {
				alert(err.message);
			}
		} else {
			alert("The MediaRecorder API is not supported in your browser.");
		}
	};

	const handleRecordingStart = async () => {
		setRecordingStatus("recording");
		const media = new MediaRecorder(stream, { type: mimeType });

		mediaRecorder.current = media;

		mediaRecorder.current.start();

		let localAudioChunks = [];

		mediaRecorder.current.ondataavailable = (event) => {
			if (typeof event.data === "undefined") return;
			if (event.data.size === 0) return;
			localAudioChunks.push(event.data);
		};

		setAudioChunks(localAudioChunks);
       
	};
    
    const handleRecordingPause = () => {
		mediaRecorder.current.pause();
    }
    const handleRecordingResume = () => {
		mediaRecorder.current.resume();
    }

	const handleRecordingStop = () => {
        if (recordingStatus !== "recording") {
            return;
        }
		setRecordingStatus("inactive");
		mediaRecorder.current.stop();

		mediaRecorder.current.onstop = () => {
			const audioBlob = new Blob(audioChunks, { type: mimeType });
			const audioUrl = URL.createObjectURL(audioBlob);

			setAudio(audioUrl);

			setAudioChunks([]);
		};
	};



	return (
		<div className="container">
            <h1>React Media Recorder</h1>
			<div className="btn-group">
                <button onClick={handleRecordingStart}>
                    Record
                </button>
                <button onClick={handleRecordingPause}>
                    Pause
                </button>
                <button onClick={handleRecordingResume}>
                    Resume
                </button>
                {/* {permission && recordingStatus === "inactive" ? (
                    <button onClick={startRecording} type="button">
                        Record
                    </button>
                ) : null} */}
                <button onClick={handleRecordingStop}>
                    Stop
                </button>
			</div>
				{audio ? (
					<div className="audio-player">
						<audio src={audio} controls></audio>
                        <button className="convert-btn">
                            Covert to text
					    </button>
						{/* <a download href={audio}>
							Download Recording
						</a> */}
					</div>
				) : null}
		</div>
	);
};

export default AudioRecorder;