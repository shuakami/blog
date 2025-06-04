import os
import json
import frontmatter
from datetime import datetime
import re
from typing import Dict, List, Optional, TypedDict
from concurrent.futures import ThreadPoolExecutor
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 配置
CONTENT_DIR = 'content'
INDEX_FILE = os.path.join(CONTENT_DIR, 'index.json')
MAX_WORKERS = 4  # 并行处理文件的最大线程数

class PostData(TypedDict):
    slug: str
    title: str
    date: str
    excerpt: Optional[str]
    coverImage: Optional[str]
    tags: List[str]

def setup_content_dir() -> None:
    """确保内容目录存在"""
    if not os.path.exists(CONTENT_DIR):
        os.makedirs(CONTENT_DIR)
        logging.info(f"Created directory: {CONTENT_DIR}")

def generate_excerpt(content: str, length: int = 200) -> str:
    """生成文章摘要"""
    # 移除 Markdown 语法
    text = re.sub(r'!\[.*?\]\(.*?\)', '', content)  # 移除图片
    text = re.sub(r'\[.*?\]\((.*?)\)', r'\1', text)  # 移除链接，保留链接文字
    text = re.sub(r'[#*`_~]', '', text)  # 移除特殊字符
    text = re.sub(r'\s+', ' ', text)  # 规范化空白字符
    text = text.strip()
    
    # 如果内容超过长度限制，在单词边界处截断
    if len(text) > length:
        text = text[:length].rsplit(' ', 1)[0] + '...'
    
    return text

def format_date(date_obj: any) -> str:
    """格式化日期对象为字符串"""
    try:
        if isinstance(date_obj, str):
            # 尝试解析字符串日期
            date = datetime.strptime(date_obj, '%Y-%m-%d')
            return date.strftime('%Y-%m-%d')
        if isinstance(date_obj, datetime):
            return date_obj.strftime('%Y-%m-%d')
        if hasattr(date_obj, 'isoformat'):
            return date_obj.isoformat()[:10]
        return str(date_obj)
    except Exception as e:
        logging.warning(f"Date format error: {e}, using current date")
        return datetime.now().strftime('%Y-%m-%d')

def process_file(file_path: str) -> Optional[PostData]:
    """处理单个 Markdown 文件"""
    try:
        file_name = os.path.basename(file_path)
        if not file_name.endswith('.md'):
            return None

        with open(file_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
        
        # 获取文件修改时间作为备用日期
        mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
        mtime_str = mtime.strftime('%Y-%m-%d')
        
        # 构建文章数据
        return PostData(
            slug=os.path.splitext(file_name)[0],
            title=post.metadata.get('title', 'Untitled'),
            date=format_date(post.metadata.get('date', mtime_str)),
            excerpt=post.metadata.get('excerpt', generate_excerpt(post.content)),
            coverImage=post.metadata.get('coverImage'),
            tags=post.metadata.get('tags', [])
        )
    except Exception as e:
        logging.error(f"Error processing file {file_path}: {e}")
        return None

def main() -> None:
    try:
        setup_content_dir()
        
        # 获取所有 Markdown 文件
        md_files = [
            os.path.join(CONTENT_DIR, f) 
            for f in os.listdir(CONTENT_DIR) 
            if f.endswith('.md')
        ]
        
        if not md_files:
            logging.warning("No markdown files found")
            return
        
        # 并行处理文件
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            posts = list(filter(None, executor.map(process_file, md_files)))
        
        # 按日期排序
        posts.sort(key=lambda x: x['date'], reverse=True)
        
        # 生成索引数据
        index_data = {
            'posts': posts,
            'generated': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'),
            'stats': {
                'total': len(posts),
                'tags': len(set(tag for post in posts for tag in post['tags']))
            }
        }
        
        # 写入索引文件
        with open(INDEX_FILE, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, ensure_ascii=False, indent=2)
        
        logging.info(f"Successfully generated index.json with {len(posts)} posts")
        
    except Exception as e:
        logging.error(f"Error generating index: {e}")
        raise

if __name__ == '__main__':
    main() 
