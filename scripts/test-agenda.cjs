const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const cache = new Map();

function load(file) {
  const full = path.resolve(__dirname, '..', file);
  if (cache.has(full)) return cache.get(full);
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, require: id => load(path.resolve(path.dirname(full), id + '.ts')) });
  cache.set(full, exports);
  return exports;
}

const { lireHoraires, etatHoraire } = load('src/lib/horaires.ts');
const { decalerJour, jourLocal } = load('src/lib/jours.ts');
let count = 0;
function check(name, f) { f(); count++; console.log('OK ' + name); }
for (const input of ['08:30\u201309:30', '8h30 \u00e0 9h30', '08:30-09:30', '08:30\u201409:30']) {
  check('legacy range ' + input, () => assert.equal(JSON.stringify(lireHoraires(input, '')), '{"debut":"08:30","fin":"09:30"}'));
}
check('explicit end wins', () => assert.equal(lireHoraires('08:30-09:30', '10:00').fin, '10:00'));
check('end stays optional', () => assert.equal(lireHoraires('13:15', '').fin, ''));
check('invalid hour rejected', () => assert.equal(lireHoraires('25:00', '').debut, ''));
check('invalid minute rejected', () => assert.equal(lireHoraires('08:60', '').debut, ''));
check('empty hours preserved', () => assert.equal(lireHoraires('', '').debut, ''));
for (const [time, past, active] of [['08:29', false, false], ['08:30', false, true], ['09:29', false, true], ['09:30', true, false], ['20:50', true, false]]) {
  check('phase ' + time, () => {
    const result = etatHoraire('2026-09-07', '08:30', '09:30', new Date('2026-09-07T' + time + ':00'));
    assert.equal(result.passe, past); assert.equal(result.actif, active);
  });
}
const now = new Date('2026-09-07T20:50:00');
check('no endless active state', () => assert.equal(etatHoraire('2026-09-07', '08:30', '', now).actif, false));
check('old snapshot is not active', () => assert.equal(etatHoraire('2026-09-06', '20:00', '21:00', now).actif, false));
check('future snapshot is not active', () => assert.equal(etatHoraire('2026-09-08', '20:00', '21:00', now).actif, false));
check('invalid interval is not active', () => assert.equal(etatHoraire('2026-09-07', '21:00', '20:00', now).actif, false));
check('local calendar date', () => assert.equal(jourLocal(new Date('2026-09-07T00:15:00')), '2026-09-07'));
for (const [date, offset, expected] of [['2026-09-01', -1, '2026-08-31'], ['2026-12-31', 1, '2027-01-01'], ['2026-03-29', 1, '2026-03-30'], ['2026-10-25', -1, '2026-10-24']]) {
  check('calendar shift ' + date, () => assert.equal(decalerJour(date, offset), expected));
}
console.log(count + ' checks passed. No network or real data.');
