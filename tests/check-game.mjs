// Semak index.html: skrip boleh dibaca, data 10 level untuk setiap game, dan soalan matematik betul.
// Guna: node tests/check-game.mjs .
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const html = fs.readFileSync(path.join(process.argv[2] || '.', 'index.html'), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
new Function(script); // gagal kalau ada ralat sintaks
const src = script.split('// PURE-START')[1].split('// PURE-END')[0];
const M = new Function(src + '; return {emojiLevel,EMOJI,FACTS,bsLevel,CITY_GOALS,BUILD,cityGrid,laneSpec,mathQ};')();
const calc = s => Function(`return ${s.replace('×', '*').replace('−', '-').replace('÷', '/')}`)();

assert.strictEqual(M.EMOJI.length, 30, 'Teka Emoji perlu 30 teka-teki (3 x 10 level)');
assert.strictEqual(M.FACTS.length, 30, 'Betul atau Salah perlu 30 fakta (3 x 10 level)');
assert.strictEqual(new Set(M.EMOJI.map(e => e[2])).size, 30, 'jawapan emoji berulang');

for (let L = 1; L <= 10; L++) {
  for (let n = 0; n < 200; n++) {
    for (const q of M.emojiLevel(L)) {
      assert.strictEqual(new Set(q.opts).size, 4, `emoji L${L}: pilihan berulang`);
      assert.ok(q.opts.includes(q.a), `emoji L${L}: jawapan tiada dalam pilihan`);
    }
    const b = M.bsLevel(L);
    assert.strictEqual(b.length, 6);
    for (const s of b) if (s.tag === 'Matematik') {
      const [lhs, rhs] = s.t.split(' = ');
      assert.strictEqual(calc(lhs) === +rhs, s.v, `betul/salah L${L}: ${s.t} ditanda ${s.v}`);
    }
  }
  const goal = M.CITY_GOALS[L - 1];
  const count = Object.values(goal).reduce((a, b) => a + b, 0);
  assert.ok(count <= M.cityGrid(L) ** 2, `bandar L${L}: bangunan tak muat dalam grid`);
  Object.keys(goal).forEach(k => assert.ok(M.BUILD[k], `bandar L${L}: bangunan ${k} tiada`));
  assert.strictEqual(M.laneSpec(L).length, 9, `haiwan L${L}: lorong salah`);
}
for (const t of [8, 9, 10]) for (let i = 0; i < 3000; i++) {
  const q = M.mathQ(t);
  assert.strictEqual(calc(q.q), q.a, `matematik salah: ${q.q}`);
  assert.strictEqual(new Set(q.opts).size, 4);
  assert.ok(q.opts.every(v => v >= 0), `nombor negatif: ${q.opts}`);
}
console.log('OK: 5 game x 10 level disemak');
