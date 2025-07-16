// src/api.js

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 5000,
});

const handleApiError = (error, functionName) => {
  console.error(`🔥 [API Error] ${functionName} 실패:`, error.response?.data?.message || error.message);
  return null;
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


// ✅ [수정] Bouncing 설정을 저장하는 함수 (Upsert)
// 로그인된 사용자의 email을 포함하여 요청합니다.
export const saveBouncingSettings = async (data) => {
  const { email, topColor, bottomColor, text, damping, kValue, sampleFactor, textSize } = data;
  
  if (!email) {
    console.warn('[API] saveBouncingSettings: 이메일이 제공되지 않아 저장 요청을 건너뜁니다.');
    return null; // 이메일 없으면 요청하지 않음
  }

  const bouncingData = {
    email, // 사용자를 식별하기 위한 email 필드 추가
    topColor,
    bottomColor,
    text,
    damping,
    kValue,
    sampleFactor,
    textSize,
  };

  try {
    // 백엔드에서는 이 email을 기준으로 데이터를 찾아서 업데이트하거나, 없으면 새로 생성해야 합니다.
    // 일반적으로 이런 API는 POST /bouncing/save 또는 PUT /bouncing/user 와 같이 설계합니다.
    const response = await apiClient.post('/bouncing/save', bouncingData); 
    console.log(`🎉 [${email}]님의 Bouncing 데이터 저장/업데이트 성공:`, response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, `saveBouncingSettings for ${email}`);
  }
};

// ✅ [신규] 이메일로 Bouncing 설정을 조회하는 함수
export const getBouncingSettingsByEmail = async (email) => {
  if (!email) return null;
  try {
    // 백엔드 API는 /bouncing/user/:email 과 같은 형태로 해당 유저의 데이터를 반환해야 합니다.
    const response = await apiClient.get(`/bouncing/user/${email}`);
    return response.data;
  } catch (error) {
    // 404 에러(찾는 사용자 데이터 없음)는 정상일 수 있으므로 콘솔에만 기록하고 null 반환
    if (error.response && error.response.status === 404) {
      console.log(`[API] ${email} 사용자의 Bouncing 설정이 아직 없습니다. 기본값으로 시작합니다.`);
      return null;
    }
    return handleApiError(error, 'getBouncingSettingsByEmail');
  }
};


// ✅ [유지] 비로그인 사용자를 위한 최신 설정 조회 함수
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

export const saveWipeSettings = async (data) => {
  const { email, topColor, bottomColor, text, textQuantity, textSize, kickForce } = data;
  if (!email) return null;

  const wipeData = { email, topColor, bottomColor, text, textQuantity, textSize, kickForce };
  try {
    const response = await apiClient.post('/wipe/save', wipeData);
    console.log(`🎉 [${email}]님의 Wipe 데이터 저장/업데이트 성공:`, response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, `saveWipeSettings for ${email}`);
  }
};

// ✅ [신규] 이메일로 Wipe 설정을 조회하는 함수
export const getWipeSettingsByEmail = async (email) => {
  if (!email) return null;
  try {
    const response = await apiClient.get(`/wipe/user/${email}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`[API] ${email} 사용자의 Wipe 설정이 없습니다. 기본값으로 시작합니다.`);
      return null;
    }
    return handleApiError(error, 'getWipeSettingsByEmail');
  }
};

// ✅ [신규] Grass 설정을 저장/업데이트하는 함수 (Upsert)
export const saveGrassSettings = async (data) => {
  const { email, topColor, bottomColor, text } = data;
  if (!email) return null;

  const grassData = { email, topColor, bottomColor, text };
  try {
    const response = await apiClient.post('/grass/save', grassData);
    console.log(`🎉 [${email}]님의 Grass 데이터 저장/업데이트 성공:`, response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, `saveGrassSettings for ${email}`);
  }
};

// ✅ [신규] 이메일로 Grass 설정을 조회하는 함수
export const getGrassSettingsByEmail = async (email) => {
  if (!email) return null;
  try {
    const response = await apiClient.get(`/grass/user/${email}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`[API] ${email} 사용자의 Grass 설정이 없습니다. 기본값으로 시작합니다.`);
      return null;
    }
    return handleApiError(error, 'getGrassSettingsByEmail');
  }
};