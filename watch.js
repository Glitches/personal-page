const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const POSTS_DIR = path.join(__dirname, 'posts');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const WATCH_DIRS = [POSTS_DIR, TEMPLATES_DIR, __dirname];

let buildTimeout;
let serverProcess;

function build() {
  console.log('\n[Watch] Rebuilding...');
  const buildProcess = spawn('node', ['build.js'], { stdio: 'inherit' });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('[Watch] Build complete!\n');
    } else {
      console.error('[Watch] Build failed!\n');
    }
  });
}

function watchDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    
    // Ignore dist and node_modules
    if (filename.includes('dist') || filename.includes('node_modules')) {
      return;
    }

    // Only watch relevant files
    if (filename.endsWith('.md') || 
        filename.endsWith('.html') || 
        filename.endsWith('.js') || 
        filename.endsWith('.css')) {
      
      console.log(`[Watch] ${eventType}: ${filename}`);
      
      // Debounce rebuilds
      clearTimeout(buildTimeout);
      buildTimeout = setTimeout(build, 500);
    }
  });
}

function startServer() {
  console.log('[Watch] Starting server on http://localhost:3000');
  serverProcess = spawn('npx', ['serve', 'dist', '-l', '3000'], { stdio: 'inherit' });
  
  serverProcess.on('error', (err) => {
    console.error('[Watch] Server error:', err);
  });
}

// Initial build
build();

// Start watching
WATCH_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    watchDirectory(dir);
  }
});

// Start server
setTimeout(startServer, 2000);

// Handle exit
process.on('SIGINT', () => {
  console.log('\n[Watch] Stopping...');
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

console.log('[Watch] Watching for changes...');
