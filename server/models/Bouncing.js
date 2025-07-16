// models/Bouncing.js

const mongoose = require('mongoose');

const bouncingSchema = new mongoose.Schema({
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
  // 4. damping (실수)
  damping: {
    type: Number,
    required: true,
  },
  // 5. k-value (실수) -> 변수명은 kValue로 지정
  kValue: {
    type: Number,
    required: true,
  },
  // 6. sample factor (실수)
  sampleFactor: {
    type: Number,
    required: true,
  },
  // 7. text size (실수)
  textSize: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Bouncing', bouncingSchema);