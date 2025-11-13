const tf = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const { createCanvas, loadImage } = require('canvas');
const bookings = require('./bookingController');

let model;
const seatStates = new Map();

const loadModel = async () => {
  if (!model) {
    console.log('Loading COCO-SSD model...');
    model = await cocoSsd.load({ base: 'mobilenet_v2' });
    console.log('Model loaded successfully');
  } else {
    console.log('Model has already been loaded');
  }
};

const detectFromFrame = async (buffer) => {
  const room = 'canteen';
  const seatNumber = 1;
  const key = `${room}-${seatNumber}`;
  console.log(`Starting detection for seat: ${key}`);

  if (!model) {
    console.log('Model is not loaded, cannot perform detection');
    return false;
  }

  try {
    const img = await loadImage(buffer);
    console.log(`Image loaded: width=${img.width}, height=${img.height}`);

    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const predictions = await model.detect(canvas);
    console.log('Model predictions:', predictions.map(p => ({ class: p.class, score: p.score })));

    const hasPerson = predictions.some(p => p.class === 'person' && p.score > 0.5);
    console.log('Person detected:', hasPerson);

    const lastState = seatStates.get(key);
    console.log('Previous state:', lastState);

    if (hasPerson !== lastState) {
      seatStates.set(key, hasPerson);
      console.log(`Seat state changed: ${key} → ${hasPerson ? 'occupied' : 'available'}`);

      if (hasPerson) {
        console.log('Calling updateSeatStatusByDetection to update database...');
        await bookings.updateSeatStatusByDetection(room, seatNumber);
        console.log('Database updated');
      } else {
        console.log('Calling deleteDefaultBookingIfExists to remove default booking...');
        await bookings.deleteDefaultBookingIfExists(room, seatNumber);
        console.log('Default booking removed');
      }
    } else {
      console.log(`Seat state unchanged: ${key} (${hasPerson ? 'occupied' : 'available'})`);
    }

    return hasPerson;
  } catch (err) {
    console.error(`Error detecting seat ${key}:`, err);
    return false;
  }
};

module.exports = { loadModel, detectFromFrame };
