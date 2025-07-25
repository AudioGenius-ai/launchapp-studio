import { Template, TemplateCategory, TemplateType } from '@code-pilot/feature-templates';

export const templates: Template[] = [
  // ===== REACT TEMPLATES =====
  {
    id: 'react-vite',
    name: 'React + Vite',
    description: 'Fast React development with Vite and TypeScript',
    category: TemplateCategory.React,
    tags: ['react', 'vite', 'typescript', 'fast'],
    icon: 'react',
    repository: 'https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts',
    config: {
      framework: 'react',
      language: 'typescript',
      packageManager: 'npm',
      features: ['Hot Module Replacement', 'TypeScript', 'JSX Fast Refresh', 'CSS Modules']
    },
  },
  
  {
    id: 'react-cra',
    name: 'Create React App',
    description: 'Official React app scaffolding tool',
    category: TemplateCategory.React,
    tags: ['react', 'typescript', 'official'],
    icon: 'react',
    repository: 'https://github.com/facebook/create-react-app',
    config: {
      framework: 'react',
      language: 'typescript',
      packageManager: 'npm',
      features: ['React', 'Webpack', 'TypeScript']
    },
  },

  // ===== NEXT.JS TEMPLATES =====
  {
    id: 'nextjs-app-router',
    name: 'Next.js App Router',
    description: 'Full-stack React framework with App Router and Server Components',
    category: TemplateCategory.FullStack,
    type: TemplateType.Create,
    command: 'npx create-next-app@latest',
    hasProjectName: true,
    tags: ['nextjs', 'react', 'typescript', 'tailwind', 'fullstack'],
    icon: 'nextjs',
    framework: 'nextjs',
    stack: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS'],
    color: {
      from: '#000000',
      to: '#434343',
    },
    repoUrl: 'https://github.com/vercel/next.js',
    docsUrl: 'https://nextjs.org/docs',
    features: [
      'App Router',
      'Server Components',
      'API Routes',
      'TypeScript',
      'Tailwind CSS',
      'ESLint',
      'Server Actions',
    ],
    prerequisites: ['node >= 18.17.0'],
  },

  {
    id: 'nextjs-commerce',
    name: 'Next.js Commerce',
    description: 'Production-ready ecommerce template',
    category: TemplateCategory.Starter,
    type: TemplateType.Vercel,
    command: 'npx create-next-app@latest --example commerce',
    hasProjectName: true,
    tags: ['nextjs', 'ecommerce', 'production', 'tailwind'],
    icon: 'nextjs',
    framework: 'nextjs',
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    color: {
      from: '#000000',
      to: '#171717',
    },
    repoUrl: 'https://github.com/vercel/commerce',
    demoUrl: 'https://demo.vercel.store',
    isPremium: false,
  },

  // ===== VUE TEMPLATES =====
  {
    id: 'vue-vite',
    name: 'Vue 3 + Vite',
    description: 'Modern Vue 3 with Vite and TypeScript',
    category: TemplateCategory.Framework,
    type: TemplateType.Vite,
    command: 'npm create vue@latest',
    hasProjectName: true,
    tags: ['vue', 'vite', 'typescript', 'composition-api'],
    icon: 'vue',
    framework: 'vue',
    stack: ['Vue 3', 'Vite', 'TypeScript'],
    color: {
      from: '#42B883',
      to: '#35495E',
    },
    repoUrl: 'https://github.com/vuejs/create-vue',
    docsUrl: 'https://vuejs.org',
    features: ['Composition API', 'TypeScript', 'Vue Router', 'Pinia', 'Vitest'],
    prerequisites: ['node >= 18'],
  },

  {
    id: 'nuxt3',
    name: 'Nuxt 3',
    description: 'Full-stack Vue framework with SSR/SSG',
    category: TemplateCategory.FullStack,
    type: TemplateType.Create,
    command: 'npx nuxi@latest init',
    hasProjectName: true,
    tags: ['vue', 'nuxt', 'ssr', 'fullstack', 'typescript'],
    icon: 'nuxt',
    framework: 'nuxt',
    stack: ['Nuxt 3', 'Vue 3', 'TypeScript', 'Nitro'],
    color: {
      from: '#00DC82',
      to: '#003543',
    },
    repoUrl: 'https://github.com/nuxt/nuxt',
    docsUrl: 'https://nuxt.com',
    features: ['Server-Side Rendering', 'Static Site Generation', 'API Routes', 'Auto-imports'],
  },

  // ===== SVELTE TEMPLATES =====
  {
    id: 'svelte-vite',
    name: 'Svelte + Vite',
    description: 'Cybernetically enhanced web apps',
    category: TemplateCategory.Framework,
    type: TemplateType.Vite,
    command: 'npm create vite@latest -- --template svelte-ts',
    hasProjectName: true,
    tags: ['svelte', 'vite', 'typescript'],
    icon: 'svelte',
    framework: 'svelte',
    stack: ['Svelte', 'Vite', 'TypeScript'],
    color: {
      from: '#FF3E00',
      to: '#FF3E00',
    },
    repoUrl: 'https://github.com/sveltejs/svelte',
    docsUrl: 'https://svelte.dev',
  },

  {
    id: 'sveltekit',
    name: 'SvelteKit',
    description: 'Full-stack Svelte framework',
    category: TemplateCategory.FullStack,
    type: TemplateType.Create,
    command: 'npm create svelte@latest',
    hasProjectName: true,
    tags: ['svelte', 'sveltekit', 'ssr', 'fullstack'],
    icon: 'svelte',
    framework: 'sveltekit',
    stack: ['SvelteKit', 'Svelte', 'TypeScript', 'Vite'],
    color: {
      from: '#FF3E00',
      to: '#FF3E00',
    },
    repoUrl: 'https://github.com/sveltejs/kit',
    docsUrl: 'https://kit.svelte.dev',
    features: ['Server-Side Rendering', 'Static Site Generation', 'API Routes', 'TypeScript'],
  },

  // ===== OTHER FRAMEWORKS =====
  {
    id: 'solid-vite',
    name: 'SolidJS + Vite',
    description: 'Simple and performant reactivity',
    category: TemplateCategory.Framework,
    type: TemplateType.Vite,
    command: 'npm create vite@latest -- --template solid-ts',
    hasProjectName: true,
    tags: ['solid', 'vite', 'typescript', 'reactive'],
    icon: 'solid',
    framework: 'solid',
    stack: ['SolidJS', 'Vite', 'TypeScript'],
    color: {
      from: '#2C4F7C',
      to: '#335D92',
    },
    repoUrl: 'https://github.com/solidjs/solid',
    docsUrl: 'https://solidjs.com',
  },

  {
    id: 'qwik-city',
    name: 'Qwik City',
    description: 'Resumable framework for instant apps',
    category: TemplateCategory.FullStack,
    type: TemplateType.Create,
    command: 'npm create qwik@latest',
    hasProjectName: true,
    tags: ['qwik', 'resumable', 'performance', 'fullstack'],
    icon: 'qwik',
    framework: 'qwik',
    stack: ['Qwik', 'Qwik City', 'TypeScript'],
    color: {
      from: '#AC7EF4',
      to: '#4A42D3',
    },
    repoUrl: 'https://github.com/BuilderIO/qwik',
    docsUrl: 'https://qwik.builder.io',
  },

  {
    id: 'astro',
    name: 'Astro',
    description: 'Content-focused static site builder',
    category: TemplateCategory.FullStack,
    type: TemplateType.Create,
    command: 'npm create astro@latest',
    hasProjectName: true,
    tags: ['astro', 'static', 'performance', 'content'],
    icon: 'astro',
    framework: 'astro',
    stack: ['Astro', 'TypeScript'],
    color: {
      from: '#FF5D01',
      to: '#C026D3',
    },
    repoUrl: 'https://github.com/withastro/astro',
    docsUrl: 'https://astro.build',
    features: ['Islands Architecture', 'Zero JS by default', 'Framework agnostic', 'Markdown support'],
  },

  {
    id: 'remix',
    name: 'Remix',
    description: 'Full-stack web framework focused on web standards',
    category: TemplateCategory.FullStack,
    type: TemplateType.Create,
    command: 'npx create-remix@latest',
    hasProjectName: true,
    tags: ['remix', 'react', 'fullstack', 'ssr'],
    icon: 'remix',
    framework: 'remix',
    stack: ['Remix', 'React', 'TypeScript'],
    color: {
      from: '#3992FF',
      to: '#121212',
    },
    repoUrl: 'https://github.com/remix-run/remix',
    docsUrl: 'https://remix.run',
    features: ['Nested routes', 'Progressive enhancement', 'Error boundaries', 'Data loading'],
  },

  // ===== DESKTOP APPS =====
  {
    id: 'tauri-react',
    name: 'Tauri + React',
    description: 'Native desktop app with React and Rust',
    category: TemplateCategory.Desktop,
    type: TemplateType.Tauri,
    command: 'npm create tauri-app@latest',
    hasProjectName: true,
    tags: ['tauri', 'desktop', 'rust', 'react'],
    icon: 'tauri',
    framework: 'tauri',
    stack: ['Tauri', 'React', 'Rust', 'TypeScript'],
    color: {
      from: '#FFC131',
      to: '#24C8DB',
    },
    repoUrl: 'https://github.com/tauri-apps/tauri',
    docsUrl: 'https://tauri.app',
    prerequisites: ['rust', 'node >= 18'],
    features: ['Small bundle size', 'System tray', 'Native APIs', 'Auto-updater'],
  },

  {
    id: 'tauri-vue',
    name: 'Tauri + Vue',
    description: 'Native desktop app with Vue and Rust',
    category: TemplateCategory.Desktop,
    type: TemplateType.Tauri,
    command: 'npm create tauri-app@latest -- --framework vue',
    hasProjectName: true,
    tags: ['tauri', 'desktop', 'rust', 'vue'],
    icon: 'tauri',
    framework: 'tauri',
    stack: ['Tauri', 'Vue 3', 'Rust', 'TypeScript'],
    color: {
      from: '#FFC131',
      to: '#42B883',
    },
    repoUrl: 'https://github.com/tauri-apps/tauri',
    docsUrl: 'https://tauri.app',
    prerequisites: ['rust', 'node >= 18'],
  },

  {
    id: 'electron-react',
    name: 'Electron + React',
    description: 'Cross-platform desktop app with web technologies',
    category: TemplateCategory.Desktop,
    type: TemplateType.Create,
    command: 'npm create electron-app@latest',
    hasProjectName: true,
    tags: ['electron', 'desktop', 'react', 'nodejs'],
    icon: 'electron',
    framework: 'electron',
    stack: ['Electron', 'React', 'TypeScript'],
    color: {
      from: '#47848F',
      to: '#2B2E3B',
    },
    repoUrl: 'https://github.com/electron/electron',
    docsUrl: 'https://electronjs.org',
  },

  // ===== MOBILE APPS =====
  {
    id: 'react-native',
    name: 'React Native',
    description: 'Build native mobile apps with React',
    category: TemplateCategory.Mobile,
    type: TemplateType.Create,
    command: 'npx react-native@latest init',
    hasProjectName: true,
    tags: ['react-native', 'mobile', 'ios', 'android'],
    icon: 'reactnative',
    framework: 'reactnative',
    stack: ['React Native', 'TypeScript'],
    color: {
      from: '#61DAFB',
      to: '#282C34',
    },
    repoUrl: 'https://github.com/facebook/react-native',
    docsUrl: 'https://reactnative.dev',
    prerequisites: ['node >= 18', 'watchman'],
  },

  {
    id: 'expo',
    name: 'Expo',
    description: 'Universal React Native apps',
    category: TemplateCategory.Mobile,
    type: TemplateType.Create,
    command: 'npx create-expo-app@latest',
    hasProjectName: true,
    tags: ['expo', 'react-native', 'mobile', 'ios', 'android'],
    icon: 'expo',
    framework: 'expo',
    stack: ['Expo', 'React Native', 'TypeScript'],
    color: {
      from: '#000020',
      to: '#4630EB',
    },
    repoUrl: 'https://github.com/expo/expo',
    docsUrl: 'https://expo.dev',
    features: ['Over-the-air updates', 'Expo SDK', 'EAS Build', 'Expo Go'],
  },

  // ===== BACKEND TEMPLATES =====
  {
    id: 'express-api',
    name: 'Express API',
    description: 'Fast, unopinionated web framework for Node.js',
    category: TemplateCategory.Backend,
    type: TemplateType.Create,
    command: 'npx express-generator',
    hasProjectName: true,
    tags: ['express', 'nodejs', 'api', 'backend'],
    icon: 'express',
    framework: 'express',
    stack: ['Express', 'Node.js'],
    color: {
      from: '#000000',
      to: '#68A063',
    },
    repoUrl: 'https://github.com/expressjs/express',
    docsUrl: 'https://expressjs.com',
  },

  {
    id: 'nestjs',
    name: 'NestJS',
    description: 'Progressive Node.js framework for enterprise apps',
    category: TemplateCategory.Backend,
    type: TemplateType.Create,
    command: 'npx @nestjs/cli@latest new',
    hasProjectName: true,
    tags: ['nestjs', 'nodejs', 'typescript', 'enterprise'],
    icon: 'nestjs',
    framework: 'nestjs',
    stack: ['NestJS', 'TypeScript', 'Node.js'],
    color: {
      from: '#E0234E',
      to: '#E0234E',
    },
    repoUrl: 'https://github.com/nestjs/nest',
    docsUrl: 'https://nestjs.com',
    features: ['Dependency Injection', 'Modular Architecture', 'TypeScript', 'GraphQL Support'],
  },

  {
    id: 'fastify',
    name: 'Fastify',
    description: 'Fast and low overhead web framework',
    category: TemplateCategory.Backend,
    type: TemplateType.Create,
    command: 'npm create fastify@latest',
    hasProjectName: true,
    tags: ['fastify', 'nodejs', 'api', 'performance'],
    icon: 'fastify',
    framework: 'fastify',
    stack: ['Fastify', 'Node.js', 'TypeScript'],
    color: {
      from: '#000000',
      to: '#000000',
    },
    repoUrl: 'https://github.com/fastify/fastify',
    docsUrl: 'https://fastify.io',
  },

  {
    id: 'hono',
    name: 'Hono',
    description: 'Ultrafast web framework for the edge',
    category: TemplateCategory.Backend,
    type: TemplateType.Create,
    command: 'npm create hono@latest',
    hasProjectName: true,
    tags: ['hono', 'edge', 'cloudflare', 'deno'],
    icon: 'hono',
    framework: 'hono',
    stack: ['Hono', 'TypeScript'],
    color: {
      from: '#FF6B00',
      to: '#FF6B00',
    },
    repoUrl: 'https://github.com/honojs/hono',
    docsUrl: 'https://hono.dev',
  },

  // ===== PYTHON BACKENDS =====
  {
    id: 'django',
    name: 'Django',
    description: 'High-level Python web framework',
    category: TemplateCategory.Backend,
    type: TemplateType.Custom,
    command: 'django-admin startproject',
    hasProjectName: true,
    tags: ['django', 'python', 'fullstack', 'orm'],
    icon: 'django',
    framework: 'django',
    stack: ['Django', 'Python'],
    color: {
      from: '#092E20',
      to: '#44B78B',
    },
    repoUrl: 'https://github.com/django/django',
    docsUrl: 'https://djangoproject.com',
    prerequisites: ['python >= 3.8'],
  },

  {
    id: 'flask',
    name: 'Flask',
    description: 'Lightweight Python web framework',
    category: TemplateCategory.Backend,
    type: TemplateType.Custom,
    command: 'flask create-app',
    hasProjectName: true,
    tags: ['flask', 'python', 'api', 'microframework'],
    icon: 'flask',
    framework: 'flask',
    stack: ['Flask', 'Python'],
    color: {
      from: '#000000',
      to: '#000000',
    },
    repoUrl: 'https://github.com/pallets/flask',
    docsUrl: 'https://flask.palletsprojects.com',
    prerequisites: ['python >= 3.8'],
  },

  {
    id: 'fastapi',
    name: 'FastAPI',
    description: 'Modern, fast Python web framework',
    category: TemplateCategory.Backend,
    type: TemplateType.Custom,
    command: 'pip install fastapi uvicorn && mkdir',
    hasProjectName: true,
    tags: ['fastapi', 'python', 'api', 'async'],
    icon: 'fastapi',
    framework: 'fastapi',
    stack: ['FastAPI', 'Python', 'Uvicorn'],
    color: {
      from: '#009688',
      to: '#009688',
    },
    repoUrl: 'https://github.com/tiangolo/fastapi',
    docsUrl: 'https://fastapi.tiangolo.com',
    prerequisites: ['python >= 3.8'],
    features: ['Automatic API docs', 'Type hints', 'Async support', 'High performance'],
  },

  // ===== OTHER LANGUAGES =====
  {
    id: 'go-api',
    name: 'Go API',
    description: 'Simple and efficient Go web service',
    category: TemplateCategory.Backend,
    type: TemplateType.Custom,
    command: 'go mod init',
    hasProjectName: true,
    tags: ['go', 'golang', 'api', 'backend'],
    icon: 'go',
    framework: 'go',
    stack: ['Go'],
    color: {
      from: '#00ADD8',
      to: '#00ADD8',
    },
    repoUrl: 'https://github.com/golang/go',
    docsUrl: 'https://go.dev',
    prerequisites: ['go >= 1.21'],
  },

  {
    id: 'rust-actix',
    name: 'Actix Web',
    description: 'Powerful Rust web framework',
    category: TemplateCategory.Backend,
    type: TemplateType.Custom,
    command: 'cargo new --bin',
    hasProjectName: true,
    tags: ['rust', 'actix', 'api', 'performance'],
    icon: 'rust',
    framework: 'actix',
    stack: ['Rust', 'Actix Web'],
    color: {
      from: '#CE422B',
      to: '#CE422B',
    },
    repoUrl: 'https://github.com/actix/actix-web',
    docsUrl: 'https://actix.rs',
    prerequisites: ['cargo'],
  },

  // ===== TOOLS & UTILITIES =====
  {
    id: 'tailwind-config',
    name: 'Tailwind CSS',
    description: 'Add Tailwind CSS to your project',
    category: TemplateCategory.Tool,
    type: TemplateType.Custom,
    command: 'npx tailwindcss init -p',
    hasProjectName: false,
    tags: ['tailwind', 'css', 'styling', 'utility'],
    icon: 'tailwind',
    framework: 'tailwind',
    color: {
      from: '#06B6D4',
      to: '#3B82F6',
    },
    repoUrl: 'https://github.com/tailwindlabs/tailwindcss',
    docsUrl: 'https://tailwindcss.com',
  },

  {
    id: 'eslint-config',
    name: 'ESLint',
    description: 'Set up ESLint for your project',
    category: TemplateCategory.Tool,
    type: TemplateType.Custom,
    command: 'npm init @eslint/config',
    hasProjectName: false,
    tags: ['eslint', 'linting', 'code-quality'],
    icon: 'eslint',
    color: {
      from: '#4B32C3',
      to: '#4B32C3',
    },
    repoUrl: 'https://github.com/eslint/eslint',
    docsUrl: 'https://eslint.org',
  },

  {
    id: 'prettier-config',
    name: 'Prettier',
    description: 'Add code formatting with Prettier',
    category: TemplateCategory.Tool,
    type: TemplateType.Custom,
    command: 'npm install --save-dev prettier && echo {} > .prettierrc',
    hasProjectName: false,
    tags: ['prettier', 'formatting', 'code-style'],
    icon: 'prettier',
    color: {
      from: '#F7B93E',
      to: '#F7B93E',
    },
    repoUrl: 'https://github.com/prettier/prettier',
    docsUrl: 'https://prettier.io',
  },

  {
    id: 'vitest',
    name: 'Vitest',
    description: 'Blazing fast unit testing framework',
    category: TemplateCategory.Tool,
    type: TemplateType.Custom,
    command: 'npm install --save-dev vitest',
    hasProjectName: false,
    tags: ['vitest', 'testing', 'vite', 'unit-test'],
    icon: 'vitest',
    color: {
      from: '#FCC72B',
      to: '#729B1B',
    },
    repoUrl: 'https://github.com/vitest-dev/vitest',
    docsUrl: 'https://vitest.dev',
  },

  {
    id: 'playwright',
    name: 'Playwright',
    description: 'End-to-end testing for modern web apps',
    category: TemplateCategory.Tool,
    type: TemplateType.Custom,
    command: 'npm init playwright@latest',
    hasProjectName: false,
    tags: ['playwright', 'e2e', 'testing', 'automation'],
    icon: 'playwright',
    color: {
      from: '#2EAD33',
      to: '#D65348',
    },
    repoUrl: 'https://github.com/microsoft/playwright',
    docsUrl: 'https://playwright.dev',
  },

  // ===== MONOREPO TEMPLATES =====
  {
    id: 'turborepo',
    name: 'Turborepo',
    description: 'High-performance build system for monorepos',
    category: TemplateCategory.Tool,
    type: TemplateType.Create,
    command: 'npx create-turbo@latest',
    hasProjectName: true,
    tags: ['turborepo', 'monorepo', 'build', 'cache'],
    icon: 'turborepo',
    framework: 'turborepo',
    stack: ['Turborepo', 'pnpm', 'TypeScript'],
    color: {
      from: '#EF4444',
      to: '#EF4444',
    },
    repoUrl: 'https://github.com/vercel/turborepo',
    docsUrl: 'https://turbo.build',
    features: ['Remote caching', 'Parallel execution', 'Incremental builds'],
  },

  {
    id: 'nx',
    name: 'Nx Workspace',
    description: 'Smart, extensible build framework',
    category: TemplateCategory.Tool,
    type: TemplateType.Create,
    command: 'npx create-nx-workspace@latest',
    hasProjectName: true,
    tags: ['nx', 'monorepo', 'build', 'tooling'],
    icon: 'nx',
    framework: 'nx',
    stack: ['Nx', 'TypeScript'],
    color: {
      from: '#002F55',
      to: '#143055',
    },
    repoUrl: 'https://github.com/nrwl/nx',
    docsUrl: 'https://nx.dev',
  },

  // ===== PREMIUM TEMPLATES =====
  {
    id: 'launchapp-saas',
    name: 'LaunchApp SaaS Starter',
    description: 'Production-ready SaaS boilerplate with auth, payments, and more',
    category: TemplateCategory.Premium,
    type: TemplateType.Custom,
    command: 'git clone https://github.com/launchapp/saas-starter',
    hasProjectName: true,
    tags: ['saas', 'nextjs', 'stripe', 'auth', 'production'],
    icon: 'nextjs',
    framework: 'nextjs',
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Prisma', 'Stripe'],
    color: {
      from: '#7C3AED',
      to: '#DB2777',
    },
    isPremium: true,
    features: [
      'Authentication',
      'Stripe payments',
      'Multi-tenancy',
      'Admin dashboard',
      'Email templates',
      'API rate limiting',
    ],
  },
];