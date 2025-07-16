// server/socket/socketHandler.js

const { Line, UniverseUser } = require('../models/universe');

// 매일 사용량을 초기화하기 위한 상수 (밀리초 단위)
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAILY_LIMIT = 5000; // 하루에 그릴 수 있는 총 길이 (px)

// 랜덤 색상을 생성하는 헬퍼 함수
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// 사용자를 찾거나 새로 생성하는 함수 (일일 초기화 로직 포함)
const findOrCreateUser = async (userId) => {
  let user = await UniverseUser.findOne({ userId });

  if (user) {
    // 사용자가 존재할 경우, 마지막 리셋 시간 확인
    const now = new Date();
    const lastResetDate = new Date(user.lastReset);
    if (now.getTime() - lastResetDate.getTime() >= ONE_DAY_IN_MS) {
      // 리셋 시간이 하루 이상 지났으면 길이 초기화
      user.remainingLength = DAILY_LIMIT;
      user.lastReset = now;
      await user.save();
      console.log(`[Socket] 사용자 ${userId}의 그리기 길이를 초기화했습니다.`);
    }
  } else {
    // 사용자가 없으면 새로 생성
    user = new UniverseUser({
      userId,
      color: getRandomColor(),
      remainingLength: DAILY_LIMIT,
    });
    await user.save();
    console.log(`[Socket] 신규 사용자 ${userId}를 생성했습니다. 색상: ${user.color}`);
  }
  return user;
};


// 메인 소켓 핸들러
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] 새로운 클라이언트 연결: ${socket.id}`);

    // 1. 유저 로그인 이벤트 처리
    socket.on('user_login', async ({ userId }) => {
      if (!userId) return;

      try {
        // 소켓 인스턴스에 유저 정보 저장 (나중에 사용하기 위함)
        socket.userId = userId;

        // 유저 정보를 찾거나 생성 (일일 리셋 포함)
        const user = await findOrCreateUser(userId);
        socket.userColor = user.color; // 소켓에 색상 정보도 저장
        socket.remainingLength = user.remainingLength;

        // 모든 선 데이터를 DB에서 가져오기
        const allLines = await Line.find({}).sort({ createdAt: 1 });
        
        // 해당 클라이언트에게만 초기 데이터 전송
        socket.emit('initial_data', {
          lines: allLines,
          userColor: user.color,
          remainingLength: user.remainingLength,
        });

        console.log(`[Socket] 사용자 ${userId}에게 초기 데이터를 전송했습니다.`);

      } catch (error) {
        console.error('[Socket] user_login 이벤트 처리 중 오류:', error);
      }
    });


    // 2. 선 그리기 이벤트 처리
    socket.on('draw_line', async (lineData) => {
      // 로그인하지 않았거나 데이터가 없으면 무시
      if (!socket.userId || !lineData || !lineData.points) return;
      
      try {
        // 그린 선의 길이 계산
        let drawnLength = 0;
        for (let i = 2; i < lineData.points.length; i += 2) {
            const dx = lineData.points[i] - lineData.points[i - 2];
            const dy = lineData.points[i + 1] - lineData.points[i - 1];
            drawnLength += Math.sqrt(dx * dx + dy * dy);
        }

        if (socket.remainingLength < drawnLength) {
            // 그릴 수 있는 길이가 부족하면 이벤트를 무시하거나, 클라이언트에 에러를 보낼 수 있습니다.
            console.log(`[Socket] 사용자 ${socket.userId}의 남은 길이가 부족합니다.`);
            return;
        }

        // 남은 길이 차감
        socket.remainingLength -= drawnLength;

        // 클라이언트가 보낸 색상 대신 서버에 저장된 유저의 색상 사용 (보안)
        const newLine = new Line({
          points: lineData.points,
          color: socket.userColor, 
          userId: socket.userId,
        });

        const savedLine = await newLine.save();
        
        // DB에 유저의 남은 길이 업데이트
        await UniverseUser.updateOne(
          { userId: socket.userId },
          { $inc: { remainingLength: -drawnLength } }
        );

        // 자신을 제외한 모든 클라이언트에게 새로운 선 정보 브로드캐스팅
        socket.broadcast.emit('new_line', savedLine);

      } catch (error) {
        console.error('[Socket] draw_line 이벤트 처리 중 오류:', error);
      }
    });

    // 3. 연결 종료 이벤트 처리
    socket.on('disconnect', () => {
      console.log(`[Socket] 클라이언트 연결 종료: ${socket.id}`);
    });
  });
};