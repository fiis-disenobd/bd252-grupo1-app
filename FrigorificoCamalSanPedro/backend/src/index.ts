process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { https } from 'firebase-functions';
import { createNestServer } from './server';
import * as express from 'express';

const server = express();

// Initialize the app instance (cached for subsequent requests in the same container)
const appPromise = createNestServer(server);

export const api = https.onRequest(async (req, res) => {
    await appPromise;
    server(req, res);
});
