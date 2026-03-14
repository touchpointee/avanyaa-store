const { execSync } = require('child_process');

try {
  const output = execSync('npx eslint app --ext .ts,.tsx', { encoding: 'utf8' });
  console.log('No lint errors');
} catch (e) {
  const lines = e.stdout.split('\n');
  let currentFile = '';
  lines.forEach(line => {
    if (line.startsWith('d:\\') || line.startsWith('/') || /^[a-zA-Z]:\\/.test(line)) {
        currentFile = line.trim();
    } else if (line.includes('error') && !line.includes('warning')) {
        console.log(`${currentFile}: ${line.trim()}`);
    }
  });
}
