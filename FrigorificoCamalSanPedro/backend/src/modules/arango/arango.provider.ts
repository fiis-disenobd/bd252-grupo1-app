import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database } from 'arangojs';
import * as https from 'https';

export const ARANGO_DB_CONNECTION = 'ARANGO_DB_CONNECTION';

export const ArangoProvider: Provider = {
    provide: ARANGO_DB_CONNECTION,
    useFactory: async (configService: ConfigService) => {
        const encodedCA = configService.get<string>('ARANGO_CA_CERT');
        let agent: https.Agent | undefined;

        if (encodedCA) {
            agent = new https.Agent({
                ca: Buffer.from(encodedCA, 'base64'),
                rejectUnauthorized: false // TEMPORARY: Bypass SSL error
            });
        }

        const db = new Database({
            url: configService.get<string>('ARANGO_URL'),
            databaseName: configService.get<string>('ARANGO_DB_NAME'),
            auth: {
                username: configService.get<string>('ARANGO_USER'),
                password: configService.get<string>('ARANGO_PASSWORD'),
            },
            agent,
        });

        return db;
    },
    inject: [ConfigService],
};
