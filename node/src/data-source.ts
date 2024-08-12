import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * The default values follow the convention over configuration approach.
 * They should only be used in the development mode.
 * Notes:
 * The configuration is compatible with standard PostgreSQL environment
 * variables.
 * The configuration uses database defaults which are also used in PostgreSQL
 * dockerized version.
 * In development mode the configuration uses the default postgres database
 * which already exists in the default installation and is the simplest
 * way to start for the developer.
 */
const config = {
  type: 'postgres',
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  username: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'postgres',
  entities: ['src/entities/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false, // this should always be false
  // migrationsTableName has to be different for each service and environment
  migrationsTableName: 'api_backend_traitss_migration',
};

/**
 * this needs to be a default export because we need it also in the migration
 * framework.
 */
export default new DataSource(config as DataSourceOptions);
