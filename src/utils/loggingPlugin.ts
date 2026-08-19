// Wtyczka Apollo logująca każde żądanie GraphQL z czasem odpowiedzi i ukryciem danych wrażliwych

import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from "@apollo/server";
import { logger } from "./logger.js";

const DEBUG_PAYLOADS = process.env.DEBUG_GRAPHQL === "true";

const SENSITIVE_KEYS = new Set([
  "password", "currentPassword", "newPassword", "adminPassword",
  "code", "token", "pendingToken", "accessToken", "secret", "backupCodes",
]);

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SENSITIVE_KEYS.has(key) ? "***" : redact(val);
    }
    return out;
  }
  return value;
}

export const loggingPlugin: ApolloServerPlugin = {
  async requestDidStart(requestContext): Promise<GraphQLRequestListener<any>> {
    const startTime = Date.now();
    const { request, contextValue } = requestContext;

    const opName = (request.operationName || "Unnamed_Op").replace(/[\r\n]+/g, " ");
    const ip = (contextValue as any).ip || "Unknown_IP";

    logger.info(`🌐 [CONN] Incoming: ${opName} | From: ${ip}`);
    if (DEBUG_PAYLOADS && request.variables) {
      console.log(`📥 [VARS] ${opName}:`, JSON.stringify(redact(request.variables), null, 2));
    }

    return {
      async willSendResponse(requestContext) {
        const duration = Date.now() - startTime;
        const { response } = requestContext;

        if (
          response.body.kind === "single" &&
          response.body.singleResult.errors
        ) {
          logger.error(
            `❌ [FAIL] ${opName} | Duration: ${duration}ms | Errors: ${response.body.singleResult.errors.length}`,
          );
        } else {
          logger.success(`✅ [DONE] ${opName} | Duration: ${duration}ms`);
        }

        if (DEBUG_PAYLOADS && response.body.kind === "single") {
          console.log(`📦 [PAYLOAD] ${opName}:`, JSON.stringify(redact(response.body.singleResult.data), null, 2));
        }
      },
    };
  },
};
