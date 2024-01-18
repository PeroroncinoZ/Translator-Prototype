// import { useState } from 'react';
// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
// import './App.css';

// const App = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordedAudio, setRecordedAudio] = useState(null);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [showToast, setShowToast] = useState(false);

//   const startRecording = () => {
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then(stream => {
//         const newMediaRecorder = new MediaRecorder(stream);
//         setMediaRecorder(newMediaRecorder);
//         newMediaRecorder.start();
//         setIsRecording(true);

//         const audioChunks = [];
//         newMediaRecorder.addEventListener("dataavailable", event => {
//           audioChunks.push(event.data);
//         });

//         newMediaRecorder.addEventListener("stop", () => {
//           const audioBlob = new Blob(audioChunks);
//           setRecordedAudio(URL.createObjectURL(audioBlob));
//         });
//       });
//   };

//   const stopRecording = () => {
//     if (mediaRecorder) {
//       mediaRecorder.stop();
//       setIsRecording(false);
//     }
//   };

//   const toggleRecording = () => {
//     isRecording ? stopRecording() : startRecording();
//   };

//   const playRecording = () => {
//     if (recordedAudio) {
//       const audio = new Audio(recordedAudio);
//       audio.play();
//     }
//   };

//   const toggleTheme = () => {
//     document.body.classList.toggle('darkTheme');
//   };

//   const downloadRecording = () => {
//     if (recordedAudio) {
//       setShowToast(true);

//       const link = document.createElement("a");
//       link.href = recordedAudio;
//       link.download = "recording.wav";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   return (
//     <div className="container">
//       <button onClick={toggleTheme} className="theme-toggle">
//         Toggle Theme
//       </button>
//       <button
//         onClick={toggleRecording}
//         className={isRecording ? 'recording' : ''}
//       >
//         {isRecording ? 'Stop Recording' : 'Start Recording'}
//       </button>
//       <button onClick={playRecording} disabled={!recordedAudio}>
//         Play Recording
//       </button>
//       <button onClick={downloadRecording} disabled={!recordedAudio}>
//         Download Recording
//       </button>

//       {showToast && (
//         <div className="toast">
//           Audio downloaded successfully!
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
import { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const apiEndpoint = 'http://127.0.0.1:5000/api';
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const toggleTheme = () => {
    document.body.classList.toggle('darkTheme');
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const newMediaRecorder = new MediaRecorder(stream);
        setMediaRecorder(newMediaRecorder);
        newMediaRecorder.start();
        setIsRecording(true);

        const audioChunks = [];
        newMediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        newMediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          setRecordedAudio(URL.createObjectURL(audioBlob));
          var ffmpeg = require('ffmpeg');
          try {
            var process = new ffmpeg('path/to/blob/file');
            process.then(function(audioBlob){
              audioBlob.fnExtractSoundToMP3('path/to/new/file.mp3', function (error, file) {
                if(!error)
                  console.log('audio file: ' + file);
              });
            }, function (err){
              console.log('Error: ' + err);
            });
          }
          catch (e) {
            console.log(e.code);
            console.log(e.msg);
          }
          uploadAudio(audioBlob);
        });
      })
      .catch(error => {
        console.error('Error accessing microphone:', error.message);
      });
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
  
      const response = await axios.post(`${apiEndpoint}/upload-audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Handle the response from the server as needed
      console.log('Server response:', response.data);
  
      // Additional logic if required based on the server response
  
      // Display a success message or perform further actions
      setShowToast(true);
    } catch (error) {
      console.error('Error uploading audio:', error.message);
      // Add more detailed error handling or logging here
    }
  };

  const playRecording = () => {
    if (recordedAudio) {
      const audio = new Audio(recordedAudio);
      audio.play();
    }
  };

  return (
    <div className="container">
      <button onClick={toggleTheme} className="theme-toggle">
        Toggle Theme
      </button>
      <button
        onClick={toggleRecording}
        className={isRecording ? 'recording' : ''}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <button onClick={playRecording} disabled={!recordedAudio}>
        Play Recording
      </button>

      {showToast && (
        <div className="toast">
          Audio processed successfully!
        </div>
      )}
    </div>
  );
};

export default App;