/**
 * build.js — runs on Vercel before deployment
 * Generates env.js from Vercel environment variables
 * so credentials never live in source code.
 */

const fs = require('fs');

const SUPABASE_URL            = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error(
    '[build] ERROR: SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY is not set.\n' +
    'Add them in Vercel → Project → Settings → Environment Variables.'
  );
  process.exit(1);
}

const content = `window.__ENV__ = {
  SUPABASE_URL: '${SUPABASE_URL}',
  SUPABASE_PUBLISHABLE_KEY: '${SUPABASE_PUBLISHABLE_KEY}',
};\n`;

fs.writeFileSync('env.js', content);
console.log('[build] env.js generated successfully.');
