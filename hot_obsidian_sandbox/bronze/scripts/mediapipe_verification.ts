import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIDEO_PATH = path.resolve(__dirname, '../test_videos/open-palm-side.mp4');
const MODEL_PATH = path.resolve(__dirname, '../infra/models/hand_landmarker.task');

async function verify() {
  console.log('🚀 Starting MediaPipe Verification...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Serve local files via Playwright routing
  await page.route('https://example.com/video.mp4', async (route) => {
    const buffer = fs.readFileSync(VIDEO_PATH);
    await route.fulfill({ body: buffer, contentType: 'video/mp4' });
  });

  await page.route('https://example.com/hand_landmarker.task', async (route) => {
    const buffer = fs.readFileSync(MODEL_PATH);
    await route.fulfill({ body: buffer, contentType: 'application/octet-stream' });
  });

  // Load MediaPipe from CDN in the browser
  await page.goto('https://example.com'); // Use a real domain to avoid about:blank issues

  const results = await page.evaluate(async () => {
    const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js');
    const { HandLandmarker, FilesetResolver } = vision;

    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    const handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://example.com/hand_landmarker.task`,
        delegate: "CPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });

    const video = document.createElement('video');
    video.src = 'https://example.com/video.mp4';
    video.muted = true;
    video.playsInline = true;
    
    await new Promise((resolve) => {
      video.onloadeddata = resolve;
    });

    // Process a few frames
    const framesToProcess = 5;
    const frameResults = [];
    
    for (let i = 0; i < framesToProcess; i++) {
      const startTimeMs = i * 100; // 10fps-ish
      video.currentTime = startTimeMs / 1000;
      
      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      const result = handLandmarker.detectForVideo(video, startTimeMs);
      frameResults.push({
        timestamp: startTimeMs,
        handCount: result.landmarks.length,
        landmarks: result.landmarks[0] ? result.landmarks[0].slice(0, 5) : null // Just first 5 landmarks for brevity
      });
    }

    return frameResults;
  });

  console.log('📊 Verification Results:');
  console.log(JSON.stringify(results, null, 2));

  await browser.close();
  console.log('✅ Verification Complete.');
}

verify().catch(err => {
  console.error('❌ Verification Failed:', err);
  process.exit(1);
});
