import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { DataSource } from 'typeorm';
import { ARANGO_DB_CONNECTION } from '../arango/arango.provider';
import { Venta } from './ventas.interface';

@Injectable()
export class VentasService {
    constructor(
        @Inject(ARANGO_DB_CONNECTION) private readonly db: Database,
        private readonly dataSource: DataSource,
    ) { }

    private get collection() {
        return this.db.collection('ventas');
    }

    async create(ventaData: any): Promise<Venta> {
        try {
            const { documento, items, total } = ventaData;

            // 1. Lookup Client in Postgres
            const client = await this.dataSource.query(
                `
        SELECT c.id_cliente, 
               COALESCE(pn.nombres || ' ' || pn.apellidos, pj.razon_social) as nombre_completo
        FROM cliente c
        LEFT JOIN persona_natural pn ON c.id_cliente = pn.id_cliente
        LEFT JOIN persona_juridica pj ON c.id_cliente = pj.id_cliente
        WHERE COALESCE(pn.dni, pj.ruc) = $1
        LIMIT 1
        `,
                [documento]
            );

            if (!client || client.length === 0) {
                throw new BadRequestException('Cliente no encontrado con ese DNI/RUC');
            }

            const foundClient = client[0];

            // 2. Prepare Sale Document
            const newVenta: Venta = {
                clienteId: foundClient.id_cliente,
                clienteNombre: foundClient.nombre_completo,
                fecha: new Date().toISOString(),
                items,
                total,
                estado: 'pendiente'
            };

            // 3. Save to ArangoDB
            const collectionExists = await this.collection.exists();
            if (!collectionExists) {
                await this.collection.create();
            }

            const result = await this.collection.save(newVenta);

            return { ...newVenta, _key: result._key, _id: result._id, _rev: result._rev };
        } catch (error) {
            console.error('Error in VentasService.create:', error);
            throw error;
        }
    }

    async findAll(): Promise<Venta[]> {
        console.log('DEBUG: Starting findAll');
        try {
            const collectionExists = await this.collection.exists();
            console.log('DEBUG: Collection ventas exists:', collectionExists);

            if (!collectionExists) {
                console.log('DEBUG: Collection does not exist');
                return [];
            }

            // Check count
            const countCursor = await this.db.query(aql`RETURN LENGTH(ventas)`);
            const count = await countCursor.next();
            console.log('DEBUG: Total documents in ventas:', count);

            const cursor = await this.db.query(aql`
              FOR v IN ventas
              SORT v.fecha DESC
              RETURN v
            `);
            const results = await cursor.all();
            console.log('DEBUG: Results returned:', results.length);
            return results;
        } catch (e) {
            console.error('DEBUG: Error in findAll:', e);
            throw e;
        }
    }
    async findByClient(clienteId: number): Promise<Venta[]> {
        console.log(`DEBUG: findByClient called for id: ${clienteId}`);
        try {
            const collectionExists = await this.collection.exists();
            if (!collectionExists) {
                console.log('DEBUG: Collection ventas does not exist');
                return [];
            }
            const cursor = await this.db.query(aql`
                FOR v IN ventas
                FILTER v.clienteId == ${clienteId} OR v.clienteId == ${String(clienteId)}
                SORT v.fecha DESC
                RETURN v
            `);
            const results = await cursor.all();
            console.log(`DEBUG: Found ${results.length} sales for client ${clienteId}`);
            return results;
        } catch (error) {
            console.error('DEBUG: Error in findByClient:', error);
            throw error;
        }
    }
    async updateStatus(id: string, estado: string): Promise<any> {
        try {
            const collectionExists = await this.collection.exists();
            if (!collectionExists) {
                throw new Error('Collection ventas does not exist');
            }
            await this.collection.update(id, { estado });
            return { success: true, id, estado };
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    }
}
