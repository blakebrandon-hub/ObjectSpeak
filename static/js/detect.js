let video = document.getElementById('webcam');
let statusText = document.getElementById('status');
let toggleSoundBtn = document.getElementById('toggle-sound');
let switchCameraBtn = document.getElementById('switch-camera');

let muted = false;
let currentFacingMode = 'environment'; // default to back camera
let model;

// Handle mute/unmute
toggleSoundBtn.addEventListener('click', () => {
  muted = !muted;
  toggleSoundBtn.textContent = muted ? 'Unmute' : 'Mute';
});

// Handle camera switching
switchCameraBtn.addEventListener('click', async () => {
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  await setupWebcam(currentFacingMode);
});

// Speak detected object name
async function speak(text) {
  if (muted) return;
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

// Set up webcam with facing mode
async function setupWebcam(facingMode = 'environment') {
  // Stop existing stream if any
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode },
    audio: false
  });

  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// Object detection loop
async function detectFrame() {
  const predictions = await model.detect(video);

  if (predictions.length > 0) {
    const top = predictions[0];
    const label = top.class;
    statusText.textContent = `Detected: ${label}`;
    speak(label);
  } else {
    statusText.textContent = 'No objects detected.';
  }

  setTimeout(detectFrame, 2000); // adjust delay for performance
}

// Main app logic
async function main() {
  model = await cocoSsd.load();
  statusText.textContent = 'Model loaded. Starting webcam...';
  await setupWebcam(currentFacingMode);
  detectFrame();
}

main();
