// routes/bouncing.js

const express = require('express');
const router = express.Router();
const Bouncing = require('../models/Bouncing'); // Bouncing 모델 가져오기

// -- CRUD API for Bouncing --

// 1. (Create) 새로운 Bouncing 데이터 생성
router.post('/', async (req, res) => {
  try {
    const newBouncing = new Bouncing(req.body);
    const savedBouncing = await newBouncing.save();
    res.status(201).json(savedBouncing);
  } catch (err) {
    res.status(500).json({ message: '데이터 저장 중 오류가 발생했습니다.', error: err.message });
  }
});

// ✅ FIX: 가장 최신 데이터를 가져오는 API를 추가합니다.
// 이 라우터는 반드시 '/:id' 라우터보다 먼저 와야 합니다.
router.get('/latest', async (req, res) => {
  try {
    // createdAt 필드를 기준으로 내림차순 정렬하여 가장 최신 데이터 1개를 찾습니다.
    const latestBouncing = await Bouncing.findOne().sort({ createdAt: -1 });
    if (!latestBouncing) {
      // 데이터가 하나도 없을 경우 404 에러를 반환합니다.
      return res.status(404).json({ message: '저장된 설정이 없습니다.' });
    }
    res.json(latestBouncing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. (Read) 특정 ID의 Bouncing 데이터 조회
router.get('/:id', async (req, res) => {
  try {
    const bouncing = await Bouncing.findById(req.params.id);
    if (!bouncing) {
      return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }
    res.json(bouncing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;