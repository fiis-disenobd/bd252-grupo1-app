import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArangoProvider, ARANGO_DB_CONNECTION } from './arango.provider';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [ArangoProvider],
    exports: [ArangoProvider, ARANGO_DB_CONNECTION],
})
export class ArangoModule { }
