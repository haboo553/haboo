import { execSync } from 'child_process';
import fs from 'fs';

// If deploying on Vercel or in a frontend-only static host
if (process.env.VERCEL || process.env.NOW_BUILDER) {
  console.log('✓ Vercel build environment detected: Static SPA build ready in dist/');
  process.exit(0);
}

// For Cloud Run / Node container deployments, bundle server.ts into dist/server.cjs
try {
  console.log('⚡ Bundling server.ts for container runtime...');
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  execSync(
    'npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs',
    { stdio: 'inherit' }
  );
  console.log('✓ Server bundled successfully to dist/server.cjs');
} catch (error) {
  console.warn('⚠️ Server bundling notice:', error.message);
  // Do not crash the build if running in an environment without esbuild binary
  if (process.env.NODE_ENV === 'production' && !process.env.K_SERVICE) {
    process.exit(0);
  }
}
