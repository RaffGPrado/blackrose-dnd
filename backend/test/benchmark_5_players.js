import http from 'http';

const BASE_URL = 'http://localhost:4000';

const PLAYERS = [
  { name: 'Thorin Stoneforge', email: 'thorin@blackrose.dnd', pass: 'Dwarf123!', race_id: 2, class_id: 4, level: 3, max_hp: 28, armor_class: 18 },
  { name: 'Elidor Moonwhisper', email: 'elidor@blackrose.dnd', pass: 'Elf12345!', race_id: 3, class_id: 12, level: 3, max_hp: 18, armor_class: 12 },
  { name: 'Lyra Dawnbringer', email: 'lyra@blackrose.dnd', pass: 'Cleric123!', race_id: 1, class_id: 2, level: 3, max_hp: 24, armor_class: 16 },
  { name: 'Shadow Quickfoot', email: 'shadow@blackrose.dnd', pass: 'Rogue123!', race_id: 4, class_id: 9, level: 3, max_hp: 21, armor_class: 14 },
  { name: 'Garrick Flameheart', email: 'garrick@blackrose.dnd', pass: 'Paladin123!', race_id: 5, class_id: 7, level: 3, max_hp: 26, armor_class: 17 }
];

async function request(method, path, body = null, token = null) {
  const start = performance.now();
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const duration = performance.now() - start;
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, ok: res.ok, duration, data };
  } catch (err) {
    const duration = performance.now() - start;
    return { status: 0, ok: false, duration, error: err.message };
  }
}

async function runPlayerSession(playerDef, playerIndex, resultsCollector) {
  const metrics = [];
  const record = (action, res) => {
    metrics.push({ action, duration: res.duration, ok: res.ok, status: res.status });
    resultsCollector.push({ player: playerDef.name, action, duration: res.duration, ok: res.ok, status: res.status });
  };

  // 1. Register or Login
  let authRes = await request('POST', '/api/auth/register', {
    name: playerDef.name,
    email: playerDef.email,
    password: playerDef.pass
  });
  if (!authRes.ok) {
    authRes = await request('POST', '/api/auth/login', {
      email: playerDef.email,
      password: playerDef.pass
    });
  }
  record('Auth', authRes);
  if (!authRes.ok || !authRes.data?.token) {
    throw new Error(`Auth failed for ${playerDef.name}: ${JSON.stringify(authRes)}`);
  }
  const token = authRes.data.token;

  // 2. Fetch Characters list or create character
  let charsRes = await request('GET', '/api/characters', null, token);
  record('List Characters', charsRes);

  let charId;
  if (charsRes.ok && charsRes.data?.characters?.length > 0) {
    charId = charsRes.data.characters[0].id;
  } else {
    const createRes = await request('POST', '/api/characters', {
      name: playerDef.name,
      race_id: playerDef.race_id,
      class_id: playerDef.class_id,
      level: playerDef.level,
      max_hp: playerDef.max_hp,
      armor_class: playerDef.armor_class,
      speed: 9
    }, token);
    record('Create Character', createRes);
    charId = createRes.data?.character?.id;
  }

  if (!charId) throw new Error(`Could not get character ID for ${playerDef.name}`);

  // 3. Intensive Concurrent Gameplay Action Loop (20 rounds per player = 100+ rounds across 5 players)
  for (let round = 1; round <= 20; round++) {
    // 3.1 Fetch full character sheet
    const getChar = await request('GET', `/api/characters/${charId}`, null, token);
    record('Read Character Sheet', getChar);

    // 3.2 Update HP & Temp HP
    const newHp = Math.floor(Math.random() * playerDef.max_hp) + 1;
    const hpRes = await request('PATCH', `/api/characters/${charId}`, {
      current_hp: newHp,
      temp_hp: round % 2 === 0 ? 5 : 0
    }, token);
    record('Update HP/Temp HP', hpRes);

    // 3.3 Adjust Hit Dice
    const hdRes = await request('PATCH', `/api/characters/${charId}`, {
      hit_dice_current: (round % playerDef.level) + 1
    }, token);
    record('Update Hit Dice', hdRes);

    // 3.4 Toggle Skills
    const skillKeys = ['athletics', 'stealth', 'perception', 'arcana', 'insight'];
    const skillRes = await request('POST', `/api/characters/${charId}/skills/toggle`, {
      skill_key: skillKeys[round % skillKeys.length]
    }, token);
    record('Toggle Skill', skillRes);

    // 3.5 Spell Slots (simulate slot consumption and restoration)
    const slotRes = await request('PATCH', `/api/characters/${charId}/spell-slots/1`, {
      used_slots: round % 3
    }, token);
    record('Update Spell Slots', slotRes);

    // 3.6 Search Spells catalog (Grimoire search)
    const spellSearchRes = await request('GET', `/api/spells?search=a&level=${(round % 3) + 1}`, null, token);
    record('Query Spells Catalog', spellSearchRes);

    // 3.7 Add / Equip a spell if found
    if (spellSearchRes.ok && spellSearchRes.data?.spells?.length > 0) {
      const spellId = spellSearchRes.data.spells[0].id;
      const addSpellRes = await request('POST', `/api/spells/character/${charId}/spells`, { spell_id: spellId }, token);
      record('Equip Spell to Grimoire', addSpellRes);
    }

    // 3.8 Fetch static spell card image
    const cardImgRes = await request('GET', '/cards/LV1/ARMADURA%20ARCANA.jpg', null, token);
    record('Load Spell Card Image', cardImgRes);

    // 3.9 Currency update
    const coinRes = await request('PATCH', `/api/characters/${charId}`, {
      coins_gp: 50 + round * 5,
      coins_sp: 10 + round
    }, token);
    record('Update Currency', coinRes);

    // 3.10 Add Item to Mochila
    const itemRes = await request('POST', `/api/characters/${charId}/items`, {
      name: `Poção de Cura Menor #${round}`,
      quantity: 1,
      weight: 0.5,
      effect: 'Cura 2d4+2 pontos de vida'
    }, token);
    record('Add Inventory Item', itemRes);
  }

  // 4. Perform Long Rest at end of session
  const longRestRes = await request('POST', `/api/characters/${charId}/long-rest`, null, token);
  record('Long Rest', longRestRes);

  return metrics;
}

async function runConcurrencyBenchmark() {
  console.log('===============================================================');
  console.log('⚔️  BLACK ROSE D&D 5E — CONCURRENT EFFICIENCY BENCHMARK  ⚔️');
  console.log('===============================================================');
  console.log('Testing 5 Simultaneous Players hitting the live backend concurrently...\n');

  const globalResults = [];
  const benchmarkStart = performance.now();

  // Launch all 5 players truly simultaneously using Promise.all
  const playerPromises = PLAYERS.map((player, idx) => 
    runPlayerSession(player, idx, globalResults)
  );

  await Promise.all(playerPromises);
  const totalDuration = performance.now() - benchmarkStart;

  // Analysis
  const totalRequests = globalResults.length;
  const successfulRequests = globalResults.filter(r => r.ok).length;
  const failedRequests = globalResults.filter(r => !r.ok).length;
  const durations = globalResults.map(r => r.duration).sort((a, b) => a - b);

  const minLatency = durations[0].toFixed(2);
  const maxLatency = durations[durations.length - 1].toFixed(2);
  const avgLatency = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2);
  const p50 = durations[Math.floor(durations.length * 0.50)].toFixed(2);
  const p95 = durations[Math.floor(durations.length * 0.95)].toFixed(2);
  const p99 = durations[Math.floor(durations.length * 0.99)].toFixed(2);
  const rps = ((totalRequests / totalDuration) * 1000).toFixed(1);

  // Group by action type
  const actionMap = {};
  for (const r of globalResults) {
    if (!actionMap[r.action]) actionMap[r.action] = { count: 0, totalMs: 0, errors: 0 };
    actionMap[r.action].count++;
    actionMap[r.action].totalMs += r.duration;
    if (!r.ok) actionMap[r.action].errors++;
  }

  console.log('---------------------------------------------------------------');
  console.log('📊 OVERALL BENCHMARK RESULTS:');
  console.log('---------------------------------------------------------------');
  console.log(`• Concurrent Players:       5 active players`);
  console.log(`• Total Requests Executed:  ${totalRequests}`);
  console.log(`• Successful Requests:      ${successfulRequests} (${((successfulRequests/totalRequests)*100).toFixed(1)}%)`);
  console.log(`• Failed / Error Requests:  ${failedRequests} (${((failedRequests/totalRequests)*100).toFixed(1)}%)`);
  console.log(`• Total Benchmark Time:     ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`• Throughput:               ${rps} requests/second`);
  console.log('---------------------------------------------------------------');
  console.log('⚡ LATENCY DISTRIBUTION:');
  console.log('---------------------------------------------------------------');
  console.log(`• Minimum:                  ${minLatency} ms`);
  console.log(`• Average (Mean):           ${avgLatency} ms`);
  console.log(`• Median (p50):             ${p50} ms`);
  console.log(`• 95th Percentile (p95):    ${p95} ms`);
  console.log(`• 99th Percentile (p99):    ${p99} ms`);
  console.log(`• Maximum:                  ${maxLatency} ms`);
  console.log('---------------------------------------------------------------');
  console.log('📋 BREAKDOWN BY ACTION:');
  console.log('---------------------------------------------------------------');
  console.log('Action Name                  | Count | Avg Latency | Errors');
  console.log('-----------------------------------------------------------');
  for (const [action, stats] of Object.entries(actionMap)) {
    const avg = (stats.totalMs / stats.count).toFixed(2);
    console.log(`${action.padEnd(28)} | ${String(stats.count).padStart(5)} | ${String(avg + ' ms').padStart(11)} | ${stats.errors}`);
  }
  console.log('===============================================================');
  
  if (failedRequests === 0) {
    console.log('🏆 VERDICT: EXCELLENT! 100% SUCCESS RATE ACROSS ALL 5 PLAYERS!');
  } else {
    console.log('⚠️ WARNING: SOME REQUESTS ENCOUNTERED ERRORS');
  }
}

runConcurrencyBenchmark().catch(err => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
