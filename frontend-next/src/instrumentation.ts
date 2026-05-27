export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { runMigration } = await import('@/lib/db');
      await runMigration();
    } catch (err) {
      console.error('[instrumentation] DB migration failed:', err);
    }
  }
}
