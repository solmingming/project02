// server/index.js

// 1. .env 파일의 환경 변수를 로드합니다. (반드시 최상단에 위치해야 합니다)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // ✅ path 모듈 추가
const http = require('http'); // ✅ http 모듈 추가
const { Server } = require('socket.io'); // ✅ socket.io 추가

const app = express();
const httpServer = http.createServer(app); // ✅ Express 앱으로 http 서버 생성

// =======================================================
// CORS 설정 객체 (재사용을 위해 분리)
// =======================================================
const corsOptions = {
  origin: (process.env.CORS_ORIGIN || '').split(','),
  credentials: true,
};

// =======================================================
// 미들웨어(Middleware) 설정
// =======================================================

// 1순위: CORS 설정
app.use(cors(corsOptions));

// 2순위: Body Parser
app.use(express.json());

// =======================================================
// Socket.IO 서버 설정
// =======================================================

const io = new Server(httpServer, {
  cors: corsOptions, // ✅ socket.io에도 CORS 설정 적용
});

// socket 이벤트 핸들러를 별도 파일로 분리하여 관리
require('./socket/socketHandler')(io);

// =======================================================
// API 라우터(Router) 등록
// =======================================================

const bouncingRoutes = require('./routes/bouncing');
const wipeRoutes = require('./routes/wipe');
const grassRoutes = require('./routes/grass');
// universe 라우트는 이제 거의 사용되지 않지만, 예비용으로 남겨둘 수 있습니다.
const universeRoutes = require('./routes/universe'); 

app.use('/api/bouncing', bouncingRoutes);
app.use('/api/wipe', wipeRoutes);
app.use('/api/grass', grassRoutes);
app.use('/api/universe', universeRoutes);

// =======================================================
// React 빌드 파일 서빙 (프로덕션 환경)
// =======================================================
// public 폴더를 정적 파일 경로로 지정합니다.
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// API 요청이 아닌 모든 GET 요청에 대해 React 앱의 index.html을 서빙합니다.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});


// =======================================================
// MongoDB 연결 및 서버 실행
// =======================================================
const PORT = process.env.PORT || 5001;
const mongoUri =
  process.env.MONGO_URL
  || process.env.MONGO_URI
  || process.env.RAILWAY_MONGO_URL;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB에 성공적으로 연결되었습니다.');

    // ✅ app.listen 대신 httpServer.listen을 사용해야 socket.io가 함께 실행됩니다.
    httpServer.listen(PORT, () => {
      console.log(`✅✅✅ 새로운 서버가 ${PORT} 에서 실행 중입니다! ✅✅✅`);
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  })
  .catch(err => {
    console.error('MongoDB 연결 오류:', err);
    process.exit(1);
  });