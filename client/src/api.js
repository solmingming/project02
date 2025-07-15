import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 5000, // 5초 이상 응답이 없으면 에러 처리
});

// 공통 에러 핸들러 함수 (코드 중복 방지)
const handleApiError = (error, functionName) => {
  console.error(`🔥 [API Error] ${functionName} 실패:`, error.response?.data?.message || error.message);
  return null; // 에러 발생 시 일관되게 null 반환
};

/**
 * Bouncing 데이터 생성 API
 * @param {object} data - 프론트엔드에서 받은 데이터
 * @returns {Promise<object|null>} 성공 시 생성된 데이터, 실패 시 null
 */
export const createBouncing = async (data) => {
  // ✅ 이제 모든 API에서 topColor, bottomColor를 사용합니다.
  const { topColor, bottomColor, text, damping, kValue, sampleFactor, textSize } = data;
  
  const bouncingData = {
    topColor,
    bottomColor,
    text,
    damping,
    kValue,
    sampleFactor,
    textSize,
  };

  try {
    const response = await apiClient.post('/bouncing', bouncingData);
    console.log('🎉 Bouncing 데이터 저장 성공:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'createBouncing');
  }
};

/**
 * Wipe 데이터 생성 API
 * @param {object} data - 프론트엔드에서 받은 데이터
 * @returns {Promise<object|null>} 성공 시 생성된 데이터, 실패 시 null
 */
export const createWipe = async (data) => {
  // ✅ 이제 모든 API에서 topColor, bottomColor를 사용합니다.
  const { topColor, bottomColor, text, textQuantity, textSize, kickForce } = data;

  const wipeData = {
    topColor,
    bottomColor,
    text,
    textQuantity,
    textSize,
    kickForce,
  };
  
  try {
    const response = await apiClient.post('/wipe', wipeData);
    console.log('🎉 Wipe 데이터 저장 성공:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'createWipe');
  }
};

/**
 * Grass 데이터 생성 API
 * @param {object} data - 프론트엔드에서 받은 데이터
 * @returns {Promise<object|null>} 성공 시 생성된 데이터, 실패 시 null
 */
export const createGrass = async (data) => {
  // ✅ 이제 모든 API에서 topColor, bottomColor를 사용합니다.
  const { topColor, bottomColor, text } = data;

  const grassData = {
    topColor,
    bottomColor,
    text,
  };

  try {
    const response = await apiClient.post('/grass', grassData);
    console.log('🎉 Grass 데이터 저장 성공:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'createGrass');
  }
};

/**
 * 최신 Bouncing 설정 데이터 조회 API
 * @returns {Promise<object|null>} 성공 시 최신 데이터, 실패 시 null
 */
export const getLatestBouncing = async () => {
  try {
    const response = await apiClient.get('/bouncing/latest');  
    return response.data;
  } catch (error) {
    return handleApiError(error, 'getLatestBouncing');
  }
};

/**
 * 최신 Wipe 설정 데이터 조회 API
 * @returns {Promise<object|null>} 성공 시 최신 데이터, 실패 시 null
 */
export const getLatestWipe = async () => {
  try {
    const response = await apiClient.get('/wipe/latest');
    return response.data;
  } catch (error) {
    return handleApiError(error, 'getLatestWipe');
  }
};

/**
 * 최신 Grass 설정 데이터 조회 API
 * @returns {Promise<object|null>} 성공 시 최신 데이터, 실패 시 null
 */
export const getLatestGrass = async () => {
  try {
    const response = await apiClient.get('/grass/latest');
    return response.data;
  } catch (error) {
    return handleApiError(error, 'getLatestGrass');
  }
};
