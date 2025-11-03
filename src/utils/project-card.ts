export interface ProjectCardData {
  title: string;
  description: string;
  button: string;
  link: string;
}

export function parseProjectCard(comment: string): ProjectCardData | null {
  // 支持双引号、单引号，以及冒号和等号两种格式
  // 格式1: title:"xxx" 或 title:'xxx'
  // 格式2: title="xxx" 或 title='xxx'
  const titleMatch = comment.match(/title[:=]\s*["']([^"']+)["']/);
  const descMatch = comment.match(/description[:=]\s*["']([^"']+)["']/);
  const buttonMatch = comment.match(/button[:=]\s*["']([^"']+)["']/);
  const linkMatch = comment.match(/link[:=]\s*["']([^"']+)["']/);

  if (!titleMatch || !descMatch || !buttonMatch || !linkMatch) {
    return null;
  }

  return {
    title: titleMatch[1],
    description: descMatch[1],
    button: buttonMatch[1],
    link: linkMatch[1],
  };
}

export function renderProjectCard(data: ProjectCardData): string {
  return `<a 
    href="${data.link}" 
    class="project-card-link"
    target="${data.link.startsWith('http') ? '_blank' : '_self'}"
    rel="${data.link.startsWith('http') ? 'noopener noreferrer' : ''}"
  >
    <div class="project-card">
      <div class="project-card-content">
        <div class="project-card-text">
          <h4 class="project-card-title">${data.title}</h4>
          <p class="project-card-description">${data.description}</p>
        </div>
        <div class="project-card-action">
          <span class="project-card-button">${data.button}</span>
        </div>
      </div>
    </div>
  </a>`;
}

