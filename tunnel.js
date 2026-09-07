// Cloudflare Tunnel'ni ishga tushiradi va olingan https manzilni
// avtomatik ravishda backend'ga (va shu orqali Telegram botga) ulaydi.
// Hech qanday ogohlantirish sahifasi yo'q.

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(ROOT, 'backend', '.env');
const API = 'http://localhost:4000';
const LOCAL_PORT = 5173;

// cloudflared qayerda turganini topamiz
function findCloudflared() {
  const candidates = [
    join(process.env['ProgramFiles(x86)'] || '', 'cloudflared', 'cloudflared.exe'),
    join(process.env.ProgramFiles || '', 'cloudflared', 'cloudflared.exe'),
    join(ROOT, 'cloudflared.exe'),
  ];

  for (const p of candidates) {
    if (p && existsSync(p)) return p;
  }

  return 'cloudflared.exe'; // PATH orqali
}

const CLOUDFLARED = findCloudflared();

let found = false;

console.log('Cloudflare tunnel ochilmoqda...\n');

const cf = spawn(
  CLOUDFLARED,
  ['tunnel', '--url', `http://localhost:${LOCAL_PORT}`, '--no-autoupdate'],
  { shell: false }
);

function handle(chunk) {
  const text = chunk.toString();
  process.stdout.write(text);

  if (found) return;

  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
  if (match) {
    found = true;
    connect(match[0]);
  }
}

cf.stdout.on('data', handle);
cf.stderr.on('data', handle);

async function connect(url) {
  console.log(`\n=================================================`);
  console.log(`  Tunnel manzili: ${url}`);
  console.log(`=================================================\n`);

  // 1) .env faylini yangilaymiz
  try {
    const env = readFileSync(ENV_PATH, 'utf8');
    const updated = env.replace(
      /WEBAPP_URL=.*/,
      `WEBAPP_URL="${url}"`
    );
    writeFileSync(ENV_PATH, updated, 'utf8');
    console.log('[tunnel] .env yangilandi');
  } catch (e) {
    console.error('[tunnel] .env yangilanmadi:', e.message);
  }

  // 2) Backend'ga yuboramiz (u Telegram menyu tugmasini qayta sozlaydi)
  for (let i = 1; i <= 30; i++) {
    try {
      const res = await fetch(`${API}/api/webapp-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (data.ok) {
        console.log('[tunnel] Telegram botga ulandi ✅');
        console.log('[tunnel] Botni oching va /start yuboring\n');
        return;
      }
    } catch {
      // backend hali ishga tushmagan — kutamiz
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.error('[tunnel] Backend javob bermadi. Backend ishlayotganini tekshiring.');
}

cf.on('error', (e) => {
  console.error('\ncloudflared ishga tushmadi:', e.message);
  console.error('Uni o\'rnatish: winget install Cloudflare.cloudflared\n');
});

cf.on('close', (code) => {
  console.log(`\ncloudflared to'xtadi (kod: ${code})`);
});
