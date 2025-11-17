// This file is a fallback for Firebase App Hosting
// It will be used if apphosting.yaml is not detected
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || '8080';
const distPath = join(__dirname, 'dist');

if (!existsSync(distPath)) {
  console.error(`Error: dist directory not found at ${distPath}`);
  console.error('Please run "npm run build" first');
  process.exit(1);
}

console.log(`Starting server on port ${PORT}, serving from ${distPath}`);

// Use serve directly from node_modules if available, otherwise use npx
const servePath = join(__dirname, 'node_modules', '.bin', 'serve');
const serveCommand = existsSync(servePath) ? servePath : 'npx';
const serveArgs = existsSync(servePath) 
  ? ['-s', distPath, '-l', PORT]
  : ['serve', '-s', distPath, '-l', PORT];

const serve = spawn(serveCommand, serveArgs, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: PORT,
  },
});

serve.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

serve.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Server exited with code ${code}`);
  }
  process.exit(code || 0);
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  serve.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  serve.kill('SIGINT');
});

