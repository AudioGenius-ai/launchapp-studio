/**
 * Logo and icon mappings for project templates
 */

export const logoMap: Record<string, string> = {
  // JavaScript/TypeScript Frameworks
  react: '⚛️',
  vue: '💚',
  angular: '🅰️',
  svelte: '🔥',
  solid: '⚡',
  qwik: '⚡',
  preact: '⚛️',
  
  // Meta-frameworks
  nextjs: '▲',
  nuxt: '💚',
  remix: '💿',
  sveltekit: '🔥',
  astro: '🚀',
  gatsby: '🟣',
  
  // Build Tools
  vite: '⚡',
  webpack: '📦',
  parcel: '📦',
  rollup: '📦',
  esbuild: '⚡',
  turbopack: '🔄',
  
  // Backend
  express: '🚂',
  fastify: '⚡',
  nestjs: '🐈',
  hono: '🔥',
  koa: '🥥',
  django: '🐍',
  flask: '🍶',
  fastapi: '⚡',
  rails: '💎',
  laravel: '🔴',
  
  // Desktop/Mobile
  tauri: '🦀',
  electron: '⚛️',
  reactnative: '📱',
  expo: '📱',
  flutter: '🦋',
  ionic: '📱',
  
  // Languages
  typescript: '💙',
  javascript: '💛',
  python: '🐍',
  rust: '🦀',
  go: '🐹',
  java: '☕',
  kotlin: '🟣',
  swift: '🦉',
  csharp: '🟦',
  cpp: '🔷',
  
  // Databases
  mongodb: '🍃',
  postgresql: '🐘',
  mysql: '🐬',
  sqlite: '📀',
  redis: '🔴',
  supabase: '🟩',
  firebase: '🔥',
  prisma: '◼️',
  
  // Tools
  tailwind: '🎨',
  sass: '💅',
  eslint: '🔍',
  prettier: '✨',
  jest: '🃏',
  vitest: '🧪',
  playwright: '🎭',
  cypress: '🌲',
  storybook: '📚',
  
  // Deployment
  vercel: '▲',
  netlify: '🟩',
  railway: '🚂',
  render: '🔷',
  fly: '🦋',
  
  // Other
  monorepo: '📁',
  turborepo: '🔄',
  lerna: '🐉',
  nx: '🔷',
  pnpm: '📦',
  npm: '📦',
  yarn: '🧶',
  bun: '🥟',
  deno: '🦕',
};

// Get logo with fallback
export function getLogo(key: string): string {
  return logoMap[key.toLowerCase()] || '📦';
}

// Get multiple logos
export function getLogos(keys: string[]): string[] {
  return keys.map(key => getLogo(key));
}

// Join logos with separator
export function joinLogos(keys: string[], separator = ' '): string {
  return getLogos(keys).join(separator);
}