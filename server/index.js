// server/index.js

// 1. .env 파일의 환경 변수를 로드합니다. (반드시 최상단에 위치해야 합니다)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// =======================================================
// 미들웨어(Middleware) 설정: 순서가 매우 중요합니다!
// =======================================================

// 1순위: CORS 설정 - .env 파일에 지정된 클라이언트의 요청을 허용합니다.
app.use(cors({
  origin: (process.env.CORS_ORIGIN || '').split(','),
  credentials: true,
}));

// 2순위: Body Parser - 들어오는 요청의 본문을 json 형식으로 파싱합니다.
// 이 코드가 라우터보다 위에 있어야 req.body를 올바르게 사용할 수 있습니다.
app.use(express.json());

// =======================================================
// API 라우터(Router) 등록
// =======================================================

// 라우터 파일들을 불러옵니다.
const bouncingRoutes = require('./routes/bouncing');
const wipeRoutes = require('./routes/wipe');
const grassRoutes = require('./routes/grass-art');
const riverRoutes = require('./routes/river');
const universeRoutes = require('./routes/universe');

// 각 API 경로와 라우터 파일을 연결합니다.
app.use('/api/bouncing', bouncingRoutes);
app.use('/api/wipe', wipeRoutes);
app.use('/api/grass', grassRoutes);
app.use('/api/river', riverRoutes);
app.use('/api/universe', universeRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =======================================================

// MongoDB 연결 및 서버 실행
const PORT = process.env.PORT || 5001; // .env 파일의 PORT 값을 사용하거나, 없다면 5001 사용

// ✅ FIX: mongoose 6.x 버전 이상에서는 useNewUrlParser, useUnifiedTopology 옵션이 기본값이므로 제거해도 괜찮습니다.
const mongoUri =
  process.env.MONGO_URL        // Railway 기본
  || process.env.MONGO_URI     // 로컬 .env
  || process.env.RAILWAY_MONGO_URL; // (예비) 다른 플러그인 이름

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB에 성공적으로 연결되었습니다.');

    // 데이터베이스 연결 성공 시에만 서버를 실행하여 안정성을 높입니다.
    app.listen(PORT, () => {
      console.log(`✅✅✅ 새로운 서버가 ${PORT} 에서 실행 중입니다! ✅✅✅`);
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  })
  .catch(err => {
    console.error('MongoDB 연결 오류:', err);
    process.exit(1); // 연결 실패 시 프로세스 종료
  });
