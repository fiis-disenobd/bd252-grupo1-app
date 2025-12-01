const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

try {
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const newContent = content.split('\n').filter(line => !line.startsWith('PORT=')).join('\n');
        fs.writeFileSync(envPath, newContent);
        console.log('PORT removed from .env');
    } else {
        console.log('.env not found');
    }
} catch (err) {
    console.error(err);
}
