const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');
const sharp = require('sharp');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let loaded = false;

async function loadModels() {
  if (loaded) return;
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
  loaded = true;
}

exports.processPhoto = async (buffer) => {
  await loadModels();

  const img = await canvas.loadImage(buffer);
  const detections = await faceapi.detectAllFaces(img);

  let crop = { left: 0, top: 0, width: img.width, height: img.height };

  if (detections.length) {
    const box = detections[0].box;

    crop = {
      left: Math.max(0, box.x - 40),
      top: Math.max(0, box.y - 40),
      width: Math.min(img.width, box.width + 80),
      height: Math.min(img.height, box.height + 80)
    };
  }

  const output = await sharp(buffer)
    .extract(crop)
    .resize(400, 500)
    .jpeg()
    .toBuffer();

  return output;
};
