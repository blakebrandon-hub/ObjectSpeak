let video = document.getElementById('webcam');
let statusText = document.getElementById('status');
let model;

async function setupWebcam() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

let muted = false;
const toggleBtn = document.getElementById('toggle-sound');

toggleBtn.addEventListener('click', () => {
  muted = !muted;
  toggleBtn.textContent = muted ? 'Unmute' : 'Mute';
});

async function speak(text) {
  if (muted) return;
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

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

  setTimeout(detectFrame, 2000); // Run detection every 2 seconds
}

async function main() {
  model = await cocoSsd.load();
  statusText.textContent = 'Model loaded. Starting webcam...';

  await setupWebcam();
  detectFrame();
}

main();
