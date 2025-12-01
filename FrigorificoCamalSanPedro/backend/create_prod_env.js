const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const prodEnvPath = path.join(__dirname, '.env.production');

try {
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        // Ensure PORT is removed just in case
        const newContent = content.split('\n').filter(line => !line.startsWith('PORT=')).join('\n');
        fs.writeFileSync(prodEnvPath, newContent);
        console.log('.env copied to .env.production');
    } else {
        console.log('.env not found');
    }
} catch (err) {
    console.error(err);
}
