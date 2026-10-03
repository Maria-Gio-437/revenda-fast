   const { execSync } = require('child_process');
   const path = require('path');

   let saida = '';
   try {
     saida = execSync('npm run lint --silent', {
       cwd: path.join(__dirname, '..'),
       encoding: 'utf8',
     });
   } catch (e) {
     saida = (e.stdout || '') + (e.stderr || '');
   }
   process.stderr.write(saida);
   console.log(JSON.stringify({}));