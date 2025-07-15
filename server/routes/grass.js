// routes/grass.js

const express = require('express');
const router = express.Router();
const Grass = require('../models/Grass'); // Grass 모델 가져오기

// -- CRUD API for Grass --

// 1. (Create) 새로운 Grass 데이터 생성 API
// Method: POST, Endpoint: /api/grass
router.post('/', async (req, res) => {
  try {
    const { backgroundColor, textColor, text } = req.body;

    const newGrass = new Grass({
      backgroundColor,
      textColor,
      text
    });

    const savedGrass = await newGrass.save();
    res.status(201).json(savedGrass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 2. (Read) 모든 Grass 데이터 조회 API
// Method: GET, Endpoint: /api/grass
router.get('/', async (req, res) => {
  try {
    const grasses = await Grass.find({});
    res.json(grasses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. (Read) 특정 ID의 Grass 데이터 조회 API
// Method: GET, Endpoint: /api/grass/:id
router.get('/:id', async (req, res) => {
  try {
    const grass = await Grass.findById(req.params.id);
    if (!grass) {
      return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }
    res.json(grass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. (Update) 특정 ID의 Grass 데이터 수정 API
// Method: PATCH, Endpoint: /api/grass/:id
router.patch('/:id', async (req, res) => {
  try {
    const updatedGrass = await Grass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGrass) {
      return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }
    res.json(updatedGrass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. (Delete) 특정 ID의 Grass 데이터 삭제 API
// Method: DELETE, Endpoint: /api/grass/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedGrass = await Grass.findByIdAndDelete(req.params.id);
    if (!deletedGrass) {
      return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }
    res.json({ message: '데이터가 성공적으로 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;