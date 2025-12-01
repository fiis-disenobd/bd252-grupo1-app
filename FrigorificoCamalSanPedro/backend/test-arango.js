process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const { Database, aql } = require('arangojs');
const https = require('https');

async function testConnection() {
    console.log('Testing ArangoDB Connection...');
    console.log('URL:', process.env.ARANGO_URL);
    console.log('DB:', process.env.ARANGO_DB_NAME);
    console.log('User:', process.env.ARANGO_USER);

    const encodedCA = process.env.ARANGO_CA_CERT;
    let agent;

    if (encodedCA) {
        console.log('Using CA Cert');
        agent = new https.Agent({
            ca: Buffer.from(encodedCA, 'base64'),
            rejectUnauthorized: false
        });
    }

    const db = new Database({
        url: process.env.ARANGO_URL,
        databaseName: process.env.ARANGO_DB_NAME,
        agent,
    });

    db.useBasicAuth(process.env.ARANGO_USER, process.env.ARANGO_PASSWORD);

    try {
        const version = await db.version();
        console.log('Connected to ArangoDB! Version:', version);

        const collection = db.collection('ventas');
        const exists = await collection.exists();
        console.log('Collection "ventas" exists:', exists);

        if (exists) {
            const cursor = await db.query(aql`RETURN LENGTH(ventas)`);
            const count = await cursor.next();
            console.log('Total documents in "ventas":', count);

            const listCursor = await db.query(aql`FOR v IN ventas LIMIT 5 RETURN v`);
            const list = await listCursor.all();
            console.log('Sample documents:', list);
        }

    } catch (err) {
        console.error('Connection failed:', err);
    }
}

testConnection();
