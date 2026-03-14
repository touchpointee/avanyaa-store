const fs = require('fs');

const data = JSON.parse(fs.readFileSync('tmp/eslint.json', 'utf8'));

data.forEach(file => {
  let fileLines = null;
  let modified = false;
  
  file.messages.forEach(m => {
    if (m.ruleId === 'react/no-unescaped-entities') {
      if (!fileLines) {
        fileLines = fs.readFileSync(file.filePath, 'utf8').split('\n');
      }
      // Extremely simple regex for common unescaped quotes in those files
      const lineIndex = m.line - 1;
      const original = fileLines[lineIndex];
      // Only replace quotes outside tags
      let res = '';
      let inTag = false;
      for (let i = 0; i < original.length; i++) {
        if (original[i] === '<') inTag = true;
        if (original[i] === '>') inTag = false;
        
        if (original[i] === '"' && !inTag) {
          // Check if it's already an entity or part of one? 
          // Just naively replace to &quot;
          res += '&quot;';
        } else {
          res += original[i];
        }
      }
      fileLines[lineIndex] = res;
      modified = true;
      console.log(`FIxed ${file.filePath}:${m.line}`);
    }
  });

  if (modified) {
    fs.writeFileSync(file.filePath, fileLines.join('\n'));
  }
});
