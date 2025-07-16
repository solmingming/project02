// server/models/universe.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

// 사용자가 그린 선 하나에 대한 스키마
const LineSchema = new Schema({
  points: {
    type: [Number], // [x1, y1, x2, y2, ...] 형식의 숫자 배열
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  userId: { // 어떤 유저가 그렸는지 식별 (googleId 등)
    type: String,
    required: true,
    index: true, // 검색 속도 향상을 위해 인덱스 추가
  },
}, {
  timestamps: true, // createdAt, updatedAt 자동 생성
});


// Universe 페이지의 유저 정보에 대한 스키마
const UniverseUserSchema = new Schema({
  userId: { // 유저를 식별하는 고유 ID (googleId 등)
    type: String,
    required: true,
    unique: true, // 각 유저는 하나의 문서만 가짐
  },
  color: { // 유저에게 할당된 고유 색상
    type: String,
    required: true,
  },
  remainingLength: { // 하루 동안 그릴 수 있는 남은 길이 (px)
    type: Number,
    required: true,
    default: 5000, // 기본 제공량 5000px
  },
  lastReset: { // 남은 길이가 마지막으로 초기화된 날짜
    type: Date,
    default: Date.now,
  },
});

const Line = mongoose.model('Line', LineSchema);
const UniverseUser = mongoose.model('UniverseUser', UniverseUserSchema);

module.exports = { Line, UniverseUser };