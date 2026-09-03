# Contact form production fix

The contact lead endpoint uses the existing mysql2 connection pool for the write transaction. This keeps production lead capture compatible with the MySQL database already used by the application while Prisma remains available for dashboard and sales operations.
