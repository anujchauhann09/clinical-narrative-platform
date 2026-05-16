# Backend Foundation

This backend follows a layered architecture:

- `routes`: route declarations only
- `controllers`: HTTP request and response coordination
- `services`: business rules and orchestration
- `repositories`: database access
- `models`: database/domain shape definitions
- `middlewares`: cross-cutting request concerns
- `validators`: Zod request schemas
- `errors`: centralized custom error types
- `utils`: shared stateless helpers
- `config`: validated runtime configuration
- `database`: PostgreSQL connection and migration-related code
- `ai`: AI provider integration modules
- `jobs`: background and scheduled work

Controllers should stay thin. Services should own business behavior. Repositories should own SQL and persistence details.
