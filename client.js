const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('pg');

const API_URL = 'http://revflow-api.manhbv.id.vn/endUsers/billingEvents';
const API_KEY = 'sk_DAFKOSpLbSXkAZxjMvAyzIdmuooutAZLSyoDggOTIslWwEmYsamBcMGBLpgattOX';
const PG_CONNECTION_STRING =
  'postgresql://admin:unstatic123%40@postgres.galva.dev/revflow?sslmode=require';

const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function rule(char = '─', n = 60) {
  return c.gray + char.repeat(n) + c.reset;
}

async function send(body) {
  const start = Date.now();
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });
    const ms = Date.now() - start;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: res.status, statusText: res.statusText, ms, body: text };
    }
    return { ok: true, status: res.status, ms };
  } catch (err) {
    return { ok: false, ms: Date.now() - start, error: err.message };
  }
}

function prompt(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function extractEndUserId(dir, files) {
  for (const file of files) {
    const body = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const id = body && body.event && body.event.endUserId;
    if (id) return id;
  }
  return null;
}

function fmt(v) {
  if (v === null || v === undefined) return c.dim + '—' + c.reset;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function logEntitlements(rows) {
  if (rows.length === 0) {
    console.log(`  ${c.dim}(no entitlements)${c.reset}`);
    return;
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    console.log(`  ${c.magenta}#${i + 1}${c.reset} ${c.dim}id${c.reset} ${r.id}`);
    console.log(`     ${c.dim}billing_status        ${c.reset} ${c.bold}${fmt(r.billing_status)}${c.reset}`);
    console.log(`     ${c.dim}billing_status_detail ${c.reset} ${fmt(r.billing_status_detail)}`);
    console.log(`     ${c.dim}started_at            ${c.reset} ${fmt(r.started_at)}`);
    console.log(`     ${c.dim}expires_at            ${c.reset} ${fmt(r.expires_at)}`);
    console.log(`     ${c.dim}revoked_at            ${c.reset} ${fmt(r.revoked_at)}`);
  }
}

async function runScenario(dir, files) {
  const scenario = path.basename(dir);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const endUserId = extractEndUserId(dir, files);
  if (!endUserId) {
    console.error(`${c.red}Could not find event.endUserId in any file under ${scenario}${c.reset}`);
    rl.close();
    process.exit(1);
  }

  const db = new Client({ connectionString: PG_CONNECTION_STRING });
  try {
    await db.connect();
  } catch (err) {
    console.error(`${c.red}Postgres connect failed:${c.reset} ${err.message}`);
    rl.close();
    process.exit(1);
  }

  console.log('\n' + rule('═'));
  console.log(`${c.bold}${c.cyan}▶ ${scenario}${c.reset}  ${c.dim}(${files.length} step${files.length === 1 ? '' : 's'})${c.reset}`);
  console.log(`${c.dim}  endUserId: ${endUserId}${c.reset}`);
  console.log(rule('═'));

  let okCount = 0;
  let failCount = 0;

  try {
    process.stdout.write(`\n${c.blue}⌫  cleanup${c.reset}  ${c.dim}DELETE FROM entitlements WHERE end_user_id = $1${c.reset}\n`);
    try {
      const del = await db.query('DELETE FROM entitlements WHERE end_user_id = $1', [endUserId]);
      console.log(`  ${c.green}✓${c.reset} ${c.dim}removed ${del.rowCount} row${del.rowCount === 1 ? '' : 's'}${c.reset}`);
    } catch (err) {
      console.error(`  ${c.red}✗ delete failed:${c.reset} ${err.message}`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const idx = `${i + 1}/${files.length}`;

      const answer = await prompt(
        rl,
        `\n${c.yellow}[${idx}]${c.reset} ${c.bold}${file}${c.reset}\n${c.dim}  press Enter to send · q to quit ›${c.reset} `
      );
      if (answer.trim().toLowerCase() === 'q') {
        console.log(`\n${c.yellow}⏸  Aborted at step ${idx}${c.reset}`);
        return;
      }

      process.stdout.write(`${c.dim}  → POST ${API_URL}${c.reset}\n`);
      const body = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      const result = await send(body);

      if (result.ok) {
        okCount++;
        console.log(`  ${c.green}✓${c.reset} ${c.green}${result.status}${c.reset} ${c.dim}${result.ms}ms${c.reset}`);
      } else {
        failCount++;
        if (result.error) {
          console.log(`  ${c.red}✗ network${c.reset} ${c.dim}${result.ms}ms${c.reset}  ${c.red}${result.error}${c.reset}`);
        } else {
          const snippet = (result.body || '').replace(/\s+/g, ' ').slice(0, 200);
          console.log(`  ${c.red}✗ ${result.status} ${result.statusText}${c.reset} ${c.dim}${result.ms}ms${c.reset}`);
          if (snippet) console.log(`    ${c.red}${snippet}${c.reset}`);
        }
      }

      console.log(`  ${c.cyan}■ entitlements${c.reset}`);
      try {
        const sel = await db.query(
          'SELECT id, billing_status, billing_status_detail, expires_at, started_at, revoked_at FROM entitlements WHERE end_user_id = $1 ORDER BY started_at NULLS LAST, id',
          [endUserId]
        );
        logEntitlements(sel.rows);
      } catch (err) {
        console.error(`  ${c.red}✗ select failed:${c.reset} ${err.message}`);
      }
    }

    console.log('\n' + rule('─'));
    const summary = `${c.green}${okCount} ok${c.reset}` + (failCount ? `  ${c.red}${failCount} failed${c.reset}` : '');
    console.log(`${c.bold}✔ Done${c.reset}  ${summary}`);
    console.log(rule('─'));
  } finally {
    rl.close();
    await db.end().catch(() => {});
  }
}

module.exports = { runScenario };
