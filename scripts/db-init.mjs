// Creates/updates the Payload CMS tables in the database by pushing the schema
// defined in payload.config.ts. This runs as the first step of the Vercel build
// so the CMS tables exist without running migrations by hand. It is idempotent:
// on a stable schema it does nothing; on a fresh database it creates the tables.
//
// Payload only pushes the schema when NODE_ENV is not "production", so we force
// development mode for this one short-lived process. The subsequent `next build`
// runs in its own process and is unaffected.
//
// Run via:  node --import tsx/esm scripts/db-init.mjs
process.env.NODE_ENV = "development";

async function main() {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    console.error(
      "✖ db-init: DATABASE_URI and PAYLOAD_SECRET must be set. Skipping."
    );
    process.exit(1);
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config.ts");

  const payload = await getPayload({ config });
  console.log("✓ Payload schema synced to the database.");
  try {
    await payload.db?.destroy?.();
  } catch {}
  process.exit(0);
}

main().catch((err) => {
  console.error("✖ db-init failed: " + (err?.message || err));
  process.exit(1);
});
