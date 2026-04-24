# E-commerce Backend

Production-ready backend foundation using NestJS + GraphQL + PostgreSQL.

## Stack
- NestJS
- GraphQL (Apollo, code-first schema)
- TypeORM
- PostgreSQL

## Features implemented
- Users (create/list/get)
- Products (create/list/get)
- Cart (add/list/remove)
- Wishlist (add/list/remove)
- Orders (create/list/get with computed total)

## Run locally
1. Copy env file:
   - `cp .env.example .env`
2. Start database:
   - `docker compose up -d`
3. Install backend deps:
   - `npm install`
4. Start backend:
   - `npm run start:dev`

GraphQL endpoint: `http://localhost:4000/api/graphql`

## Example GraphQL workflow
1. `createUser`
2. `createProduct`
3. `addCartItem` / `addWishlistItem`
4. `createOrder`