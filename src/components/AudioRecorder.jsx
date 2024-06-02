import { useState, useRef, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './Recorder.css';

const mimeType = "audio/webm";

const AudioRecorder = () => {
    const {
        transcript,
        resetTranscript,
      } = useSpeechRecognition();
    
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
                    autoGainControl: false,
                    echoCancellation: false,
                    noiseSuppression: false
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
        SpeechRecognition.startListening();
       
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
        SpeechRecognition.stopListening();
	};
   
    // const handleRecognition = () => {
    //     const recognition = new window.webkitSpeechRecognition();
    //     recognition.lang = 'en-US';
    //     recognition.continuous = true;
    //     recognition.interimResults = true;
    //     recognition.start();
    //     recognition.onresult=function(event) {
    //         let result = ''
    //         for(let i = event.resultIndex;i <= event.resultIndex; i++) {
    //             if (event.results[i].isFinal) {
    //                 result += event.results[i][0].transcript;
    //             }
    //         }
    //         console.log(result,'res')
    //         setConvertedText(result);
    //     }
    //      recognition.stop();
    //      recognition.onend = function() {
    //      console.log('disconnected')
    //      }
    // }

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
                <button onClick={handleRecordingStop}>
                    Stop
                </button>
			</div>
            {audio ? (
                <div className="audio-player">
                    <audio src={audio} controls />
                    <div className="transcribed-text">
                        {transcript}
                    </div>
                </div>
				) : null}
		</div>
	);
};


export default AudioRecorder;