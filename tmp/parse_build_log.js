const fs = require('fs');
const log = fs.readFileSync('tmp/build.log', 'utf16le');
const lines = log.split('\n');
for (const line of lines) {
  if (line.includes('Error') || line.includes('error') || line.includes('Warning') || line.includes('warning') || line.includes('Failed')) {
    console.log(line);
  }
}
