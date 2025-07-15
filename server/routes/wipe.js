// routes/wipe.js

const express = require('express');
const router = express.Router();
const Wipe = require('../models/Wipe'); // Wipe 모델 가져오기

// -- CRUD API for Wipe --

// 1. (Create) 새로운 Wipe 데이터 생성 API
// Method: POST, Endpoint: /api/wipe
router.post('/', async (req, res) => {
  try {
    const { topColor, bottomColor, text, textQuantity, textSize, kickForce } = req.body;

    const newWipe = new Wipe({
      topColor,
      bottomColor,
      text,
      textQuantity,
      textSize,
      kickForce
    });

    const savedWipe = await newWipe.save();
    res.status(201).json(savedWipe);
  } catch (err) {
    // ✅ FIX: 데이터 저장 실패 시 500 에러와 함께 더 구체적인 메시지를 반환합니다.
    res.status(500).json({ message: '데이터 저장 중 오류가 발생했습니다.', error: err.message });
  }
});

// 2. (Read) 모든 Wipe 데이터 조회 API
// Method: GET, Endpoint: /api/wipe
router.get('/', async (req, res) => {
  try {
    const wipes = await Wipe.find({});
    res.json(wipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ FIX: 가장 최신 데이터를 가져오는 API를 추가합니다.
// 이 라우터는 반드시 '/:id' 라우터보다 먼저 와야 합니다.
router.get('/latest', async (req, res) => {
  try {
    // createdAt 필드를 기준으로 내림차순 정렬하여 가장 최신 데이터 1개를 찾습니다.
    const latestWipe = await Wipe.findOne().sort({ createdAt: -1 });
    if (!latestWipe) {
      return res.status(404).json({ message: '데이터가 없습니다.' });
    }
    res.json(latestWipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 3. (Read) 특정 ID의 Wipe 데이터 조회 API
// Method: GET, Endpoint: /api/wipe/:id
router.get('/:id', async (req, res) => {
  try {
    const wipe = await Wipe.findById(req.params.id);
    if (!wipe) {
      return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }
    res.json(wipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. (Update) 특정 ID의 Wipe 데이터 수정 API
// Method: PATCH, Endpoint: /api/wipe/:id
router.patch('/:id', async (req, res) => {
  try {
    const updatedWipe = await Wipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedWipe) {
      return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }
    res.json(updatedWipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. (Delete) 특정 ID의 Wipe 데이터 삭제 API
// Method: DELETE, Endpoint: /api/wipe/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedWipe = await Wipe.findByIdAndDelete(req.params.id);
    if (!deletedWipe) {
      return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }
    res.json({ message: '데이터가 성공적으로 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;