import { NextResponse } from 'next/server';

const API_KEY = '6f366b58fba0418e89cdd262fd07a333';
const BASE_URL = 'https://devapi.qweather.com/v7';
const GEO_URL = 'https://geoapi.qweather.com/v2';

// 缓存对象
const cache = new Map();
const CACHE_DURATION = 1800000; // 30分钟缓存

async function fetchWithCache(url: string) {
  const now = Date.now();
  const cached = cache.get(url);
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const res = await fetch(url);
  const data = await res.json();
  
  cache.set(url, {
    data,
    timestamp: now
  });
  
  return data;
}

// 获取城市ID
async function getCityId(city: string) {
  const url = `${GEO_URL}/city/lookup?location=${encodeURIComponent(city)}&key=${API_KEY}`;
  const data = await fetchWithCache(url);
  
  if (data.code === '200' && data.location && data.location.length > 0) {
    return data.location[0].id;
  }
  throw new Error('城市未找到');
}

// 获取实时天气
async function getNowWeather(cityId: string) {
  const url = `${BASE_URL}/weather/now?location=${cityId}&key=${API_KEY}`;
  return fetchWithCache(url);
}

// 获取天气预报
async function getForecast(cityId: string) {
  const url = `${BASE_URL}/weather/3d?location=${cityId}&key=${API_KEY}`;
  return fetchWithCache(url);
}

// 获取生活指数
async function getIndices(cityId: string) {
  const url = `${BASE_URL}/indices/1d?type=1,2,3&location=${cityId}&key=${API_KEY}`;
  return fetchWithCache(url);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || '北京';

  try {
    const cityId = await getCityId(city);
    const [now, forecast, indices] = await Promise.all([
      getNowWeather(cityId),
      getForecast(cityId),
      getIndices(cityId)
    ]);

    return NextResponse.json({
      code: 200,
      data: {
        now: now.now,
        forecast: forecast.daily,
        indices: indices.daily
      },
      updateTime: now.updateTime
    });
  } catch (error) {
    return NextResponse.json({
      code: 500,
      error: error instanceof Error ? error.message : '获取天气数据失败'
    }, { status: 500 });
  }
} 