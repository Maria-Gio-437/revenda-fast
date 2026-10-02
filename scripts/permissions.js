const fs = require('fs');

let input = '';
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    const toolName = payload.toolCall.name;
    const args = payload.toolCall.args || {};

    let decision = 'allow';
    let reason = 'Allowed by default';

    if (toolName === 'run_command') {
      const cmd = args.CommandLine || '';
      
      // 2 Allow rules
      if (cmd.includes('npm run test') || cmd.includes('npm run lint')) {
        decision = 'allow';
        reason = 'Test and lint commands are explicitly allowed';
      }
      // 1 Ask rule
      else if (cmd.includes('npm install')) {
        decision = 'ask';
        reason = 'Requires permission to install new dependencies';
      }
      // 1 Deny rule
      else if (cmd.includes('rm -rf') || cmd.includes('Remove-Item')) {
        decision = 'deny';
        reason = 'Destructive commands are not allowed';
      }
    } else if (toolName === 'view_file' || toolName === 'replace_file_content' || toolName === 'write_to_file') {
      const path = args.AbsolutePath || args.TargetFile || '';
      // 1 Deny rule (protecting secrets)
      if (path.includes('.env')) {
        decision = 'deny';
        reason = 'Access to .env and secrets is blocked';
      }
    }

    console.log(JSON.stringify({ decision, reason }));
  } catch (e) {
    console.log(JSON.stringify({ decision: 'ask', reason: 'Failed to parse input: ' + e.message }));
  }
});
