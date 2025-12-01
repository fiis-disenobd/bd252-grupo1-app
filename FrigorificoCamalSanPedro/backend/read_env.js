const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('--- START ENV ---');
    console.log(content);
    console.log('--- END ENV ---');
} catch (err) {
    console.error(err);
}
