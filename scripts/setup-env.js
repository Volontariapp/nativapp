const fs = require('fs');
const os = require('os');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.development');
const gitignorePath = path.join(__dirname, '..', '.gitignore');

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (name.startsWith('en') || name.startsWith('eth') || name.startsWith('wl')) {
          return net.address;
        }
      }
    }
  }
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
const apiGatewayUrl = `http://${localIp}:3000`;

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

if (envContent.includes('API_GATEWAY_URL=')) {
  envContent = envContent.replace(/API_GATEWAY_URL=.*/g, `API_GATEWAY_URL=${apiGatewayUrl}`);
  fs.writeFileSync(envPath, envContent);
  console.log(`[setup-env] Updated API_GATEWAY_URL=${apiGatewayUrl} in .env.development`);
} else {
  const newLine = `API_GATEWAY_URL=${apiGatewayUrl}\n`;
  fs.appendFileSync(
    envPath,
    (envContent.length > 0 && !envContent.endsWith('\n') ? '\n' : '') + newLine,
  );
  console.log(`[setup-env] Added API_GATEWAY_URL=${apiGatewayUrl} to .env.development`);
}

if (fs.existsSync(gitignorePath)) {
  let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (!/^.env.development$/m.test(gitignoreContent)) {
    fs.appendFileSync(
      gitignorePath,
      (gitignoreContent.length > 0 && !gitignoreContent.endsWith('\n') ? '\n' : '') +
        '.env.development\n',
    );
    console.log(`[setup-env] Added .env.development to .gitignore`);
  }
}
