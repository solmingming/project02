// models/Grass.js

const mongoose = require('mongoose');

const grassSchema = new mongoose.Schema({
  // 1. 배경색 (Hex 코드)
  backgroundColor: {
    type: String,
    required: true,
  },
  // 2. 텍스트 색상 (Hex 코드)
  textColor: {
    type: String,
    required: true,
  },
  // 3. 텍스트 내용
  text: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Grass', grassSchema);