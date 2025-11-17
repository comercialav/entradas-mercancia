import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || '8080';
const distPath = join(__dirname, 'dist');

console.log(`Starting server on port ${PORT}, serving from ${distPath}`);

const serve = spawn('npx', ['serve', '-s', distPath, '-l', PORT], {
  stdio: 'inherit',
  shell: true,
});

serve.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

serve.on('exit', (code) => {
  process.exit(code || 0);
});

