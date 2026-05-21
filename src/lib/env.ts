import { z } from "zod";

// Validated environment variables.
//
// Parsed once at module load so misconfiguration fails loud at startup
// rather than surfacing as a silent `undefined` deep inside a request.
// Only NEXT_PUBLIC_* vars are read here — all are public by Next.js
// convention, so no secret ever passes through this validator.

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ required_error: "NEXT_PUBLIC_SUPABASE_URL" })
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ required_error: "NEXT_PUBLIC_SUPABASE_ANON_KEY" })
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY must not be empty"),
});

export type Env = z.infer<typeof schema>;

const parsed = schema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  // Build a readable, var-named message from Zod's issue list.
  const details = parsed.error.issues
    .map((issue) => {
      const name = issue.path.join(".");
      return issue.code === "invalid_type" && issue.received === "undefined"
        ? `Missing required env var: ${name}`
        : `Invalid env var: ${name} — ${issue.message}`;
    })
    .join("; ");
  throw new Error(`Environment validation failed — ${details}`);
}

export const env: Env = parsed.data;
