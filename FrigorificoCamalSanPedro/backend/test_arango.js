require('dotenv').config();
const { Database } = require('arangojs');
const https = require('https');

async function testConnection() {
    console.log('Testing ArangoDB Connection...');
    console.log('URL:', process.env.ARANGO_URL);

    try {
        const encodedCA = process.env.ARANGO_CA_CERT;
        let agent;

        if (encodedCA) {
            console.log('CA Cert found, length:', encodedCA.length);
            agent = new https.Agent({
                ca: Buffer.from(encodedCA, 'base64'),
                rejectUnauthorized: false // Force bypass
            });
        }

        // Connect to _system database first
        const systemDb = new Database({
            url: process.env.ARANGO_URL,
            auth: {
                username: process.env.ARANGO_USER,
                password: process.env.ARANGO_PASSWORD,
            },
            agent,
        });

        const version = await systemDb.version();
        console.log('Connection Successful to _system! ArangoDB Version:', version.version);

        const databases = await systemDb.listDatabases();
        console.log('Databases:', databases);

        const targetDbName = process.env.ARANGO_DB_NAME;
        if (!databases.includes(targetDbName)) {
            console.log(`Database ${targetDbName} does not exist. Creating...`);
            await systemDb.createDatabase(targetDbName);
            console.log('Database created!');
        } else {
            console.log(`Database ${targetDbName} exists.`);
        }

    } catch (err) {
        console.error('Connection Failed!');
        console.error('Error Message:', err.message);
        console.error('Error Code:', err.code);
        if (err.cause) console.error('Cause:', err.cause.message);
    }
}

testConnection();
