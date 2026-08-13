import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages 서빙용 basePath (Pages는 repo 경로 아래에 호스팅됨)
  basePath: '/cellverse',
  // 정적 export 활성화 (gh-pages에 HTML/JS/CSS 직접 커밋)
  output: 'export',
};

export default nextConfig;
