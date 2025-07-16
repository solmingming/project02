// server/index.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors =require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);

const corsOptions = {
  origin: (process.env.CORS_ORIGIN || '').split(','),
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(httpServer, {
  cors: corsOptions,
});

require('./socket/socketHandler')(io);

const bouncingRoutes = require('./routes/bouncing');
const wipeRoutes = require('./routes/wipe');
const grassRoutes = require('./routes/grass');
const universeRoutes = require('./routes/universe'); 

app.use('/api/bouncing', bouncingRoutes);
app.use('/api/wipe', wipeRoutes);
app.use('/api/grass', grassRoutes);
app.use('/api/universe', universeRoutes);


// ✅ 수정된 부분: 프로덕션 환경에서만 React 빌드 파일을 서빙하도록 변경
if (process.env.NODE_ENV === 'production') {
  // public 폴더를 정적 파일 경로로 지정합니다.
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

  // API 요청이 아닌 모든 GET 요청에 대해 React 앱의 index.html을 서빙합니다.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001;
const mongoUri =
  process.env.MONGO_URL
  || process.env.MONGO_URI
  || process.env.RAILWAY_MONGO_URL;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB에 성공적으로 연결되었습니다.');
    httpServer.listen(PORT, () => {
      console.log(`✅✅✅ 새로운 서버가 ${PORT} 에서 실행 중입니다! ✅✅✅`);
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  })
  .catch(err => {
    console.error('MongoDB 연결 오류:', err);
    process.exit(1);
  });