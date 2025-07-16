// server/routes/universe.js

const express = require('express');
const router = express.Router();
const { Line } = require('../models/Universe');

// 이 라우터는 이제 주로 예비용입니다.
// 대부분의 실시간 데이터 교환은 socket.io를 통해 이루어집니다.

// GET /api/universe/lines
// 모든 선 데이터를 가져오는 예비 API
router.get('/lines', async (req, res) => {
  try {
    const allLines = await Line.find({}).sort({ createdAt: 1 });
    res.status(200).json(allLines);
  } catch (error) {
    console.error('모든 라인 데이터를 가져오는 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;