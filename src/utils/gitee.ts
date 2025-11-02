// src/utils/gitee.ts
import axios from 'axios';

const GITEE_API = 'https://gitee.com/api/v5';
const GITEE_PAT = process.env.GITEE_PAT!;
const GITEE_OWNER = process.env.GITEE_OWNER!;
const GITEE_REPO = process.env.GITEE_REPO!;
const GITEE_BRANCH = process.env.GITEE_BRANCH || 'master';

// 创建 axios 实例
const giteeAxios = axios.create({
  baseURL: GITEE_API,
  timeout: 10000,
});

// 获取文件内容（文本文件）
export async function getFileContent(path: string): Promise<string> {
  try {
    // 编码路径（保留斜杠，只编码特殊字符和中文）
    const encodedPath = path.split('/').map(part => encodeURIComponent(part)).join('/');
    const url = `/repos/${GITEE_OWNER}/${GITEE_REPO}/contents/${encodedPath}`;
    const res = await giteeAxios.get(url, {
      params: { 
        access_token: GITEE_PAT, 
        ref: GITEE_BRANCH 
      },
    });

    if (res.data.content) {
      // Base64 解码
      return Buffer.from(res.data.content, 'base64').toString('utf-8');
    }

    throw new Error(`No content found for ${path}`);
  } catch (error) {
    console.error(`Error getting file content for ${path}:`, error);
    throw error;
  }
}

// 获取图片的 Buffer（用于上传到 OSS）
export async function getImageBuffer(path: string): Promise<Buffer> {
  try {
    // 编码路径（保留斜杠，只编码特殊字符和中文）
    const encodedPath = path.split('/').map(part => encodeURIComponent(part)).join('/');
    const url = `/repos/${GITEE_OWNER}/${GITEE_REPO}/contents/${encodedPath}`;
    const res = await giteeAxios.get(url, {
      params: { 
        access_token: GITEE_PAT, 
        ref: GITEE_BRANCH 
      },
    });

    if (res.data.content) {
      // 返回 Buffer
      return Buffer.from(res.data.content, 'base64');
    }

    throw new Error(`No content found for image ${path}`);
  } catch (error) {
    console.error(`Error getting image buffer for ${path}:`, error);
    throw error;
  }
}

// 获取文件树（递归）
export async function getFileTree(sha: string = GITEE_BRANCH): Promise<any> {
  try {
    const url = `/repos/${GITEE_OWNER}/${GITEE_REPO}/git/trees/${sha}`;
    const res = await giteeAxios.get(url, {
      params: { 
        access_token: GITEE_PAT, 
        recursive: 1 
      },
    });

    return res.data;
  } catch (error) {
    console.error('Error getting file tree:', error);
    throw error;
  }
}

// 获取仓库信息
export async function getRepoInfo(): Promise<any> {
  try {
    const url = `/repos/${GITEE_OWNER}/${GITEE_REPO}`;
    const res = await giteeAxios.get(url, {
      params: { access_token: GITEE_PAT },
    });

    return res.data;
  } catch (error) {
    console.error('Error getting repo info:', error);
    throw error;
  }
}

export default giteeAxios;

