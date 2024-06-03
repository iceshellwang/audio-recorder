import { useState, useRef, useEffect } from "react";
import './Recorder.css';
import localForage from 'localforage';


const mimeType = "audio/webm";

const AudioRecorder = () => {
    // const {
    //     transcript,
    //     resetTranscript,
    //   } = useSpeechRecognition();
    

	const mediaRecorder = useRef(null);

	const [recordingStatus, setRecordingStatus] = useState("inactive");

	const [stream, setStream] = useState(null);

	const [audio, setAudio] = useState(null);

	const [audioChunks, setAudioChunks] = useState([]);
	const [convertedText, setConvertedText] = useState('');
    const [visible, setVisible] = useState(false);
    const [everDisconnected, setEverDisconnected] = useState(false);

    
    useEffect(()=> {
        getMicrophonePermission()
    },[])

    useEffect(() => {
        // save data
        async function storeOfflineData() {
          try {
            await localForage.setItem('offlineAudio', { content:audio });
            // read data
            const userData = await localForage.getItem('offlineAudio');
            console.log(userData);
          } catch (err) {
            // error handling
            console.error(err);
          }
        }
        storeOfflineData();
      }, []);

     
    
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

        // start to recognise audio
        handleRecognition();
       
	};
    
    const handleRecordingPause = () => {
		mediaRecorder.current.pause();
    }
    const handleRecordingResume = () => {
		mediaRecorder.current.resume();
        handleRecognition(true);
    }

	const handleRecordingStop = () => {
        if (recordingStatus !== "recording") {
            return;
        }
        setVisible(true);
		setRecordingStatus("inactive");
		mediaRecorder.current.stop();

		mediaRecorder.current.onstop = () => {
			const audioBlob = new Blob(audioChunks, { type: mimeType });
			const audioUrl = URL.createObjectURL(audioBlob);

			setAudio(audioUrl);

			setAudioChunks([]);
		};
	};
    const handleRecognition = (ifResume = false) => {
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        
        recognition.onresult=function(event) {
            console.log(event)
            let result = '';
            for(let i = event.resultIndex;i <= event.resultIndex; i++) {
                if (event.results[i].isFinal) {
                    result += event.results[i][0].transcript;
                }
            }
            const text = ifResume? convertedText + result : result;
            setConvertedText(text);
        }
        recognition.onend= function() {
            console.log('disconnect')
        }
        recognition.start();
    }

    async function storeOfflineData() {
        try {
          await localForage.setItem('offlineAudio', { content:audio });
          
        } catch (err) {
          // error handling
          console.error(err);
        }
    }

    async function transcribeOfflineData() {

        try {
          // read data
          const audioData = await localForage.getItem('offlineAudio');
          console.log(audioData)
          // convert audio to text
          // due to limited time, 
          // use any 3rd-party API to convert audio blob to text 
          
        } catch (err) {
          // error handling
          console.error(err);
        }
    }

    window.addEventListener('online', transcribeOfflineData())
    window.addEventListener('offline', storeOfflineData())

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
                    {visible &&
                        <div className="transcribed-text">
                            <div className="title">Transcript</div>
                            <div>
                                {convertedText}
                            </div>
                        </div>
                    }
                </div>
				) : null}
		</div>
	);
};


export default AudioRecorder;