import { z } from "zod";

export const appEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  APP_TIMEZONE: z.string().min(1).default("America/Sao_Paulo")
});

export type AppEnv = z.infer<typeof appEnvSchema>;

export function parseAppEnv(env: NodeJS.ProcessEnv): AppEnv {
  return appEnvSchema.parse(env);
}
