// routes/bouncing.js (최종 수정본)

const express = require('express');
const router = express.Router();
const Bouncing = require('../models/Bouncing'); // Bouncing 모델 가져오기

// 1. (Create) 새로운 Bouncing 데이터 생성 API
// Method: POST, Endpoint: /api/bouncing
router.post('/', async (req, res) => {
    try {
     // 프론트에서 보낸 데이터(req.body)를 그대로 사용합니다.
     // api.js에서 이미 필드명을 변환해서 보내주므로, 서버에서는 추가 변환이 필요 없습니다.
     const receivedData = req.body;
     console.log('[/api/bouncing] POST 요청 도착. 받은 데이터:', receivedData);
 
     // Bouncing 모델을 사용해 받은 데이터로 새 문서를 만듭니다.
     const newBouncing = new Bouncing(receivedData);
 
     // 데이터베이스에 저장합니다.
     const savedBouncing = await newBouncing.save();
 
     console.log('✅ MongoDB에 성공적으로 저장됨:', savedBouncing);
     // 성공 응답(201)과 함께 저장된 데이터를 클라이언트로 보냅니다.
     res.status(201).json(savedBouncing);

    } catch (err) {
     // 에러가 발생하면, 어떤 에러인지 서버 콘솔에 자세히 출력합니다.
     console.error('🔥 DB 저장 중 에러 발생:', err.message);
     // 클라이언트에게 500(서버 에러) 상태 코드와 에러 메시지를 응답합니다.
     res.status(500).json({ message: '데이터 저장 중 오류가 발생했습니다.', error: err.message });
    }
  });

// 4. (Update) 특정 ID의 Bouncing 데이터 수정 API
// Method: PATCH, Endpoint: /api/bouncing/:id
router.patch('/:id', async (req, res) => {
  try {
    // findByIdAndUpdate 메소드는 ID로 문서를 찾아 req.body의 내용으로 업데이트합니다.
    // { new: true } 옵션은 업데이트된 후의 문서를 반환하도록 합니다.
    const updatedBouncing = await Bouncing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBouncing) {
      return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }
    res.json(updatedBouncing);
  } catch (err) {console.error('🔥 DB 업데이트 중 에러 발생:', err.message); // 디버깅을 위한 로그 추가
    res.status(500).json({ message: '데이터 업데이트 중 오류가 발생했습니다.', error: err.message });
  }
});


// 5. (Delete) 특정 ID의 Bouncing 데이터 삭제 API
// Method: DELETE, Endpoint: /api/bouncing/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedBouncing = await Bouncing.findByIdAndDelete(req.params.id);
     if (!deletedBouncing) {
      return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }
    res.json({ message: '데이터가 성공적으로 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/latest', async (req, res) => {
  try {
    // 1. find({})로 모든 문서를 찾음
    // 2. sort({ createdAt: -1 })로 생성된 날짜(createdAt) 기준 내림차순 정렬 (최신순)
    // 3. limit(1)로 그중 첫 번째 데이터 1개만 가져옴
    // 4. findOne()을 사용하면 더 간결하게 작성할 수 있습니다.
    const latestBouncing = await Bouncing.findOne().sort({ createdAt: -1 });

    if (!latestBouncing) {
      // DB에 아무 데이터도 없을 경우
      return res.status(404).json({ message: '저장된 설정값이 없습니다.' });
    }

    // 성공적으로 찾으면 클라이언트에게 최신 데이터를 응답
    res.json(latestBouncing);

  } catch (err) {
    res.status(500).json({ message: '서버에서 데이터를 조회하는 데 실패했습니다.', error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const bouncings = await Bouncing.find();
    res.json(bouncings);
  } catch (err) {
    res.status(500).json({ message: '데이터 조회 중 오류가 발생했습니다.', error: err.message });
  }
});

// 3. (Read) 특정 ID의 Bouncing 데이터 조회 API
// Method: GET, Endpoint: /api/bouncing/:id
router.get('/:id', async (req, res) => {
  try {
    const bouncing = await Bouncing.findById(req.params.id);
    if (!bouncing) {
      return res.status(404).json({ message: '해당 ID의 데이터를 찾을 수 없습니다.' });
    }
    res.json(bouncing);
  } catch (err) {
    res.status(500).json({ message: '데이터 조회 중 오류가 발생했습니다.', error: err.message });
  }
});
// 이 라우터 파일의 코드를 외부(index.js)에서 사용할 수 있도록 내보냅니다.
module.exports = router;