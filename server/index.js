// index.js (수정 최종본)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ 1. 파일 상단에서 한 번만 require 합니다.
require('dotenv').config();

const app = express();
const port = process.env.PORT; // PORT 환경 변수를 사용하도록 수정하면 더 좋습니다.

// =======================================================
// 미들웨어(Middleware) 설정: 순서가 매우 중요합니다!
// =======================================================

// 1순위: CORS 설정 - 특정 출처(origin)를 명시적으로 허용합니다.
app.use(cors({
  origin: 'http://localhost:3000', // 클라이언트의 주소
  credentials: true, // 필요한 경우 쿠키 교환을 허용
}));

// 2순위: Body Parser - 들어오는 요청의 body를 json으로 파싱합니다.
// 이 코드가 라우터보다 위에 있어야 req.body를 사용할 수 있습니다.
app.use(express.json());

// =======================================================

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB에 성공적으로 연결되었습니다.'))
  .catch(err => console.error('MongoDB 연결 오류:', err));

// 라우터(Router) 가져오기
const bouncingRoutes = require('./routes/bouncing');
const wipeRoutes = require('./routes/wipe');
const grassRoutes = require('./routes/grass');

// 기본 웰컴 페이지 (테스트용)
app.get('/', (req, res) => {
  res.send('백엔드 서버에 오신 것을 환영합니다!');
});

// API 라우터 등록
app.use('/api/bouncing', bouncingRoutes);
app.use('/api/wipe', wipeRoutes);
app.use('/api/grass', grassRoutes);

// 서버 실행
app.listen(port, () => {
  console.log(`✅✅✅ 새로운 서버가 ${port} 에서 실행 중입니다! ✅✅✅`); 
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
