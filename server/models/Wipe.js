// models/Wipe.js

const mongoose = require('mongoose');

const wipeSchema = new mongoose.Schema({
  // 1. 배경색 (Hex 코드)
  topColor: {
    type: String,
    required: true,
  },
  // 2. 텍스트 색상 (Hex 코드)
  bottomColor: {
    type: String,
    required: true,
  },
  // 3. 텍스트 내용
  text: {
    type: String,
    required: true,
  },
  // 4. Text Quantity (정수)
  textQuantity: {
    type: Number,
    required: true,
  },
  // 5. Text Size (정수)
  textSize: {
    type: Number,
    required: true,
  },
  // 6. Kick Force (실수)
  kickForce: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Wipe', wipeSchema);