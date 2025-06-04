import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import iconv from 'iconv-lite';

// 缓存对象
const cache = new Map();
const CACHE_DURATION = 3600000; // 1小时缓存

// 清理城市名
function cleanCityName(city: string): string {
  return city
    .replace(/\s+/g, '') // 移除所有空格
    .replace(/市$/, '') // 移除末尾的"市"字
    .trim();
}

async function getLocationByIp(ip: string) {
  const url = `https://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`;
  
  try {
    console.log(`请求IP地址: ${ip}`);
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    // 将GBK编码的Buffer转换为UTF-8字符串
    const text = iconv.decode(Buffer.from(buffer), 'gbk');
    // 移除不标准的BOM头
    const cleanText = text.replace(/^\uFEFF/, '');
    const data = JSON.parse(cleanText);

    console.log(`获取到的位置信息: ${JSON.stringify(data)}`);

    // 清理并验证城市名
    const cityName = data.city ? cleanCityName(data.city) : '';
    
    // 只有当城市名完全无效时才使用默认值
    if (!cityName || cityName === '本地') {
      console.log('返回默认城市: 北京');
      return {
        city: '北京',
        pro: '北京',
        addr: '北京'
      };
    }

    return {
      city: cityName,
      pro: data.pro,
      addr: `${data.pro}${cityName}`
    };
  } catch (error) {
    console.error('获取位置信息失败:', error);
    return {
      city: '北京',
      pro: '北京',
      addr: '北京'
    };
  }
}

export async function GET(request: Request) {
  try {
    // 获取用户真实IP
    const headersList = headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    
    // 优先使用x-forwarded-for
    const ip = forwardedFor?.split(',')[0] || realIp || '127.0.0.1';
    
    // 检查缓存
    const cached = cache.get(ip);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }
    
    // 获取位置信息
    const location = await getLocationByIp(ip);
    
    // 缓存结果
    cache.set(ip, {
      data: location,
      timestamp: Date.now()
    });
    
    return NextResponse.json(location);
  } catch (error) {
    console.error('位置API错误:', error);
    return NextResponse.json({
      city: '北京',
      pro: '北京',
      addr: '北京'
    });
  }
} 