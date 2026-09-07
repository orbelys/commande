const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const full=path.resolve(root,file);if(cache.has(full))return cache.get(full);
 const exports={};const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:id=>load(path.resolve(path.dirname(full),id+'.ts'))});cache.set(full,exports);return exports;
}
const a=load('src/lib/agenda.ts');let count=0;
function test(name,fn){fn();console.log('OK '+name);count++;}
const snapshot={date:'2026-09-07',journee:[{id:'today'}],agenda:{debut:'2026-08-31',fin:'2026-09-20',jours:[{date:'2026-09-08',evenements:[]},{date:'2026-09-09',evenements:[{id:'future'}]}]}};
test('week starts Monday',()=>assert.equal(a.lundiDe('2026-09-13'),'2026-09-07'));
test('week crosses year',()=>assert.equal(a.lundiDe('2027-01-01'),'2026-12-28'));
test('seven days in week',()=>assert.equal(a.datesAffichees('2026-09-07','semaine').length,7));
test('one day in day mode',()=>assert.equal(a.datesAffichees('2026-09-07','jour').join(','),'2026-09-07'));
test('empty day is known',()=>assert.equal(a.evenementsDuJour(snapshot,'2026-09-08').length,0));
test('future meeting available',()=>assert.equal(a.evenementsDuJour(snapshot,'2026-09-09')[0].id,'future'));
test('unknown day is not empty',()=>assert.equal(a.evenementsDuJour(snapshot,'2026-09-10'),null));
test('today legacy fallback',()=>assert.equal(a.evenementsDuJour(snapshot,'2026-09-07')[0].id,'today'));
test('no snapshot is unknown',()=>assert.equal(a.evenementsDuJour(null,'2026-09-07'),null));
test('old bridge bounds',()=>assert.equal(a.bornesAgenda({date:'2026-09-07',journee:[]}).fin,'2026-09-07'));
test('lower boundary included',()=>assert.equal(a.dateDansPeriode('2026-08-31',a.bornesAgenda(snapshot)),true));
test('upper boundary included',()=>assert.equal(a.dateDansPeriode('2026-09-20',a.bornesAgenda(snapshot)),true));
test('beyond boundary refused',()=>assert.equal(a.dateDansPeriode('2026-09-21',a.bornesAgenda(snapshot)),false));
const values=new Map();
const win={addEventListener(){},StorageService:{get:k=>values.get(k)||null,set:(k,v)=>values.set(k,v)},PSE_AGENDA:{journee:date=>({horaires:[{id:date,titre:'FICTIF',heure:'10:00',heureFin:'11:00',sourceExtrait:'PRIVATE',note:'PRIVATE'}],journee:[]})}};
vm.runInNewContext(fs.readFileSync(path.join(root,'electron/pse-mobile-bridge.js'),'utf8'),{window:win,document:{readyState:'loading',addEventListener(){}},location:{pathname:'/test.html',origin:'file://',protocol:'file:'},crypto:require('node:crypto').webcrypto,console,setTimeout,clearTimeout,setInterval,clearInterval});
const produced=win.PSE_MOBILE.construireInstantane('2026-09-07');
test('bridge publishes 21 days',()=>assert.equal(produced.agenda.jours.length,21));
test('bridge period begins previous Monday',()=>assert.equal(produced.agenda.debut,'2026-08-31'));
test('bridge period ends following Sunday',()=>assert.equal(produced.agenda.fin,'2026-09-20'));
test('source and note metadata stay private',()=>assert.equal(JSON.stringify(produced.agenda).includes('PRIVATE'),false));
test('version remains compatible',()=>assert.equal(produced.version,5));
test('sample payload comfortably bounded',()=>assert.ok(Buffer.byteLength(JSON.stringify(produced))<100000));
console.log(count+' checks passed; no network or real data.');
