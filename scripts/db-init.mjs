// Creates/updates the Payload CMS tables in the database by pushing the schema
// defined in payload.config.ts. This runs as the first step of the Vercel build
// so the CMS tables exist without running migrations by hand. It is idempotent:
// on a stable schema it does nothing; on a fresh database it creates the tables.
//
// Payload only pushes the schema when NODE_ENV is not "production", so we force
// development mode for this one short-lived process. The subsequent `next build`
// runs in its own process and is unaffected.
//
// Resilience: the schema is normally already in place, so a transient database
// hiccup must NOT fail an otherwise-fine deploy. We retry a few times and, if it
// still fails, log loudly but exit 0 so the build proceeds.
//
// Run via:  node --import tsx/esm scripts/db-init.mjs
process.env.NODE_ENV = "development";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function syncOnce() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config.ts");
  const payload = await getPayload({ config });
  try {
    await payload.db?.destroy?.();
  } catch {}
}

async function main() {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    console.warn(
      "⚠ db-init: DATABASE_URI / PAYLOAD_SECRET not set; skipping schema sync."
    );
    process.exit(0);
  }

  const attempts = 3;
  for (let i = 1; i <= attempts; i++) {
    try {
      await syncOnce();
      console.log("✓ Payload schema synced to the database.");
      process.exit(0);
    } catch (err) {
      console.warn(
        `⚠ db-init attempt ${i}/${attempts} failed: ${err?.message || err}`
      );
      if (i < attempts) await sleep(i * 3000);
    }
  }

  // Do not block the deploy: the schema is usually already present, and the app
  // will surface a clear error at runtime if the database is genuinely down.
  console.warn(
    "⚠ db-init could not sync the schema after retries. Continuing the build " +
      "anyway (existing tables are unaffected)."
  );
  process.exit(0);
}

main().catch((err) => {
  console.warn("⚠ db-init unexpected error: " + (err?.message || err));
  process.exit(0);
});
