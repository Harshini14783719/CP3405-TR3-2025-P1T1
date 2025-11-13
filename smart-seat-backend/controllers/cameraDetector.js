const tf = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const { createCanvas, loadImage } = require('canvas');
const bookings = require('./bookingController');

let model;
const seatStates = new Map();

const loadModel = async () => {
  if (!model) {
    model = await cocoSsd.load({ base: 'mobilenet_v2' });
    console.log('Model loaded successfully');
  }
};

const detectFromFrame = async (buffer) => {
  if (!model) return false;
  const room = 'canteen';
  const seatNumber = 1;
  const key = `${room}-${seatNumber}`;
  try {
    const img = await loadImage(buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const predictions = await model.detect(canvas);
    console.log('model result:', predictions.map(p => ({ class: p.class, score: p.score })));

    const hasPerson = predictions.some(p => p.class === 'person' && p.score > 0.5);

    const lastState = seatStates.get(key);
    if (hasPerson !== lastState) {
      seatStates.set(key, hasPerson);
      console.log(`status change: ${key} → ${hasPerson ? 'occupied' : 'available'}`);

      if (hasPerson) {
        console.log('call updateSeatStatusByDetection');
        await bookings.updateSeatStatusByDetection(room, seatNumber);
      } else {
        console.log('call deleteDefaultBookingIfExists');
        await bookings.deleteDefaultBookingIfExists(room, seatNumber);
      }
    } else {
      console.log(`stutas stay: ${key} (${hasPerson ? 'occupied' : 'available'})`);
    }

    return hasPerson;
  } catch (err) {
    console.error(`Detection error for seat ${key}:`, err);
    return false;
  }
};

module.exports = { loadModel, detectFromFrame };
