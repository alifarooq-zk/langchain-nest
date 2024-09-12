// nestjs common imports
import { Injectable } from '@nestjs/common';

// langchain imports
import {
  DistanceStrategy,
  PGVectorStore,
} from '@langchain/community/vectorstores/pgvector';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';

// postgres imports
import * as pg from 'pg';
import { PoolConfig } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VectorStoreService {
  private pool: pg.Pool;
  private pgVectorStore: PGVectorStore;

  constructor(private readonly configService: ConfigService) {}

  private readonly postgresConfig = {
    port: this.configService.get('postgres.port'),
    password: this.configService.get('postgres.password'),
    user: this.configService.get('postgres.user'),
    database: this.configService.get('postgres.database'),
    host: this.configService.get('postgres.host'),
  } as PoolConfig;

  private readonly vectorDbConfig = {
    tableName: 'LangchainChat',
    distanceStrategy: 'cosine' as DistanceStrategy,
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'vector',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
  };

  async onModuleInit() {
    this.pool = new pg.Pool(this.postgresConfig);

    await this.ensureDatabaseSchema();

    this.pgVectorStore = new PGVectorStore(new OpenAIEmbeddings(), {
      pool: this.pool,
      ...this.vectorDbConfig,
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  private async ensureDatabaseSchema() {
    const client = await this.pool.connect();
    try {
      // Check and create table and columns
      const query = `
      CREATE TABLE IF NOT EXISTS ${this.vectorDbConfig.tableName} (
        ${this.vectorDbConfig.columns.idColumnName} UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ${this.vectorDbConfig.columns.vectorColumnName} VECTOR,
        ${this.vectorDbConfig.columns.contentColumnName} TEXT,
        ${this.vectorDbConfig.columns.metadataColumnName} JSONB
      );
    `;

      // Create requried extensions first
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
      await client.query(query);
    } finally {
      client.release();
    }
  }

  async addDocuments(documents: Document[]): Promise<void> {
    await this.pgVectorStore.addDocuments(documents);
  }

  async similaritySearch(query: string, limit: number): Promise<any> {
    return this.pgVectorStore.similaritySearch(query, limit);
  }
}
