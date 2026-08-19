// Start serwera Apollo: limity zapytań, kontekst z tokenu i sprawdzenie unieważnienia sesji

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
import dns from "node:dns";
import { connectDB } from "./config/db.js";
import { resolvers, typeDefs } from "./graphql/schema.js";
import { logger } from "./utils/logger.js";
import { loggingPlugin } from "./utils/loggingPlugin.js";
import { verifyToken } from "./utils/jwt.js";
import { User } from "./models/users.js";
import { validateEnv } from "./utils/validate.js";
import { depthLimit, fieldCountLimit, complexityLimit } from "./utils/graphqlGuards.js";
import { checkRateLimit } from "./utils/rateLimiter.js";

dotenv.config();

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const MAX_QUERY_DEPTH = 12;
const MAX_FIELD_COUNT = 2000;
const MAX_QUERY_COST = 5000;
const RATE_LIMIT_MAX = 600;
const RATE_LIMIT_WINDOW_MS = 60_000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
  plugins: [loggingPlugin],
  validationRules: [
    depthLimit(MAX_QUERY_DEPTH),
    fieldCountLimit(MAX_FIELD_COUNT),
    complexityLimit(MAX_QUERY_COST),
  ],
});

const start = async () => {
  console.clear();
  logger.info("🏗️  Starting Realty Nest Modular Engine...");

  validateEnv();

  await connectDB();

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4000 },
    context: async ({ req }) => {
      const authHeader = req.headers.authorization ?? "";
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
      const userAgent = (req.headers["user-agent"] as string | undefined) ?? null;
      let user = null;
      const [scheme, token] = authHeader.split(/\s+/, 2);
      if (scheme?.toLowerCase() === "bearer" && token) {
        const payload = await verifyToken(token);
        if (payload) {
          const doc = await User.findById(payload.sub).select("sessionInvalidatedAt assignedAgentId").lean();
          const invalidatedAt = (doc as any)?.sessionInvalidatedAt;
          const iat = typeof payload.iat === "number" ? payload.iat : null;
          const issuedAt = iat !== null ? new Date(iat * 1000) : null;
          if (!invalidatedAt || !issuedAt || issuedAt > invalidatedAt) {
            user = { ...payload, assignedAgentId: (doc as any)?.assignedAgentId ?? null };
          }
        }
      }

      const rateKey = `gql:${user?.sub ?? (Array.isArray(ip) ? ip[0] : ip)}`;
      checkRateLimit(rateKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);

      return { user, ip, userAgent };
    },
  });

  logger.ready(url);
};

start();
