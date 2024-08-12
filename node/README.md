## Traits Service

This service is used to setup backend for Traits module. Users can enrol into traits set from the admin panel and track their progress with traits. This service will power the backend for whole traits module.

#### Setup/Deployment

The service uses PostgreSQL as database and in order to deploy this service PostgreSQL environment variables need to be set as process environment variables.

```bash
PGHOST // postgres host
PGPORT // postgres port
PGUSER // postgres user name (should be a dedicated service account)
PGPASSWORD // postgres password
PGDATABASE // postgres database
PORT // API endpoint port that the service should listen on
```

Apart from that other environment variables should also be set for common services like redis etc.

Once the build is generated then before starting up the production server following npm commands should be executed to synchronize the database with updated schema:

Run only once in test environments and in production.
This command initialises database structure based on the entity classes found in the code.
```
NODE_TLS_REJECT_UNAUTHORIZED=0 PGSSLMODE=prefer PGHOST=<db_url_or_ip> PGPORT=5432 PGDATABASE=<database> PGUSER=postgres PGPASSWORD=<password> npm run db:init
```

Run in the CI/CD pipeline and in local test environments every time you make a database/entity change.
This set of commands executes migration classes and production oriented seeds.
```
NODE_TLS_REJECT_UNAUTHORIZED=0 PGSSLMODE=prefer PGHOST=<db_url_or_ip> PGPORT=5432 PGDATABASE=<database> PGUSER=postgres PGPASSWORD=<password> npm run db:migrate
NODE_TLS_REJECT_UNAUTHORIZED=0 PGSSLMODE=prefer PGHOST=<db_url_or_ip> PGPORT=5432 PGDATABASE=<database> PGUSER=postgres PGPASSWORD=<password> npm run db:seed
```

Run only in the local test environment every time you need to seed the database with test entries.
this command runs local test oriented seeds that initialises test or mock data in the database.
```
npm run dev:db:seed
```