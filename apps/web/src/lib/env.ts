import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STORAGE_PUBLIC_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_NAME: z.string().default("CardBuy"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Variables de entorno inválidas:", result.error.flatten().fieldErrors);
    throw new Error("Variables de entorno inválidas. Revisa .env");
  }
  return result.data;
}

export const env = validateEnv();
