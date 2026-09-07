const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'commande-liaison-'));
require('esbuild').buildSync({entryPoints:[path.join(__dirname,'fixtures/liaison.tsx')],bundle:true,outfile:path.join(dir,'app.js'),jsx:'automatic',define:{'process.env.NODE_ENV':'"test"'}});
const results=[];const check=(name,ok)=>{results.push({name,ok:!!ok});if(!ok)throw Error(name)};
const server=http.createServer((req,res)=>{
 const name=req.url.split('?')[0];
 if(name==='/'){res.setHeader('Content-Type','text/html');return res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><div id="root"></div><script src="/app.js"></script>');}
 if(!['/app.js','/app.css'].includes(name)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',name.endsWith('css')?'text/css':'text/javascript');res.end(fs.readFileSync(path.join(dir,name.slice(1))));
});
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 await p.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());p.on('pageerror',e=>errors.push(e.message));
 await p.clock.install({time:new Date('2026-09-07T20:43:00Z')});await p.clock.pauseAt(new Date('2026-09-07T20:44:00Z'));await p.goto(base);await p.waitForFunction(()=>!!window.fixture);
 await p.clock.runFor(7000);await p.evaluate(()=>{window.recevoir();window.ouvrir()});
 const next=p.getByRole('button',{name:'Suivant',exact:true});await next.waitFor();
 await p.clock.runFor(25000);await p.evaluate(()=>window.recevoir());
 await p.waitForFunction(()=>window.fixture.snapshot.majA==='2026-09-07T20:44:32.000Z');
 const green=await p.getByRole('link').innerText().then(t=>t.includes('Liaison active'));
 if(process.argv.includes('--baseline')){check('Bug reproduit : liaison active mais commandes bloquees avec instantane frais',green&&await next.isDisabled());return;}
 check('En-tete et projection concordants apres montage decale',green&&await next.isEnabled());
 for(let i=0;i<18;i++){await p.clock.runFor(2000);await p.evaluate(()=>window.recevoir());await p.waitForFunction(()=>Date.parse(window.fixture.snapshot.majA)===Date.now());check('Instantane frais pilotable '+i,await next.isEnabled());}
 await next.click();await p.getByText(/Confirmation en attente/).waitFor();check('Commande en attente expliquee et double clic bloque',await next.isDisabled());
 await p.evaluate(()=>window.confirmer('echouee','L’étape a changé'));
 await p.getByText(/L’étape a changé/).waitFor();check('Erreur de commande visible dans la projection',await next.isEnabled());
 await p.evaluate(()=>{window.commandes([]);window.recevoir({projection:{...window.fixture.snapshot.projection,minuteur:{actif:true,enPause:false,restant:53}}})});
 await p.getByRole('button',{name:'Arrêter',exact:true}).click();
 check('Arret minuteur envoie la bonne commande',await p.evaluate(()=>window.fixture.commandes[0].type==='projection.minuteur.arreter'));
 await p.evaluate(()=>{window.confirmer();window.recevoir({projection:{...window.fixture.snapshot.projection,minuteur:{actif:false,enPause:false,restant:0}}})});
 await p.waitForFunction(()=>!document.body.innerText.includes('Arrêter'));check('Arret confirme refleté par le telephone',await p.getByRole('button',{name:'30 s',exact:true}).isEnabled());
 await p.evaluate(()=>window.connexion('offline'));await p.getByText(/Téléphone hors ligne/).waitFor();check('Hors ligne commandes bloquees',await next.isDisabled());
 await p.evaluate(()=>{window.connexion('online');window.recevoir({version:4})});await p.getByText(/Versions incompatibles/).waitFor();check('Ancienne version expliquee',await next.isDisabled());
 await p.evaluate(()=>window.recevoir({version:5,majA:new Date(Date.now()+6000).toISOString()}));await p.getByText(/Heure des appareils/).waitFor();check('Vraie heure future encore refusee',await next.isDisabled());
 await p.evaluate(()=>window.recevoir({majA:new Date(Date.now()-91000).toISOString()}));await p.getByText(/Dernier état trop ancien/).waitFor();check('Vraie liaison ancienne encore refusee',await next.isDisabled());
 await p.evaluate(()=>{window.recevoir();window.dispatchEvent(new Event('focus'))});check('Reprise sur instantane frais',await next.isEnabled());
 await p.evaluate(()=>window.commandes([{id:'autre-session',type:'projection.etape.suivante',libelle:'Autre cours',deviceId:window.fixture.snapshot.deviceId,projectionSessionId:'autre-session',statut:'envoyee',expiresAt:new Date(Date.now()+20000).toISOString()}]));
 await p.waitForFunction(()=>window.fixture.commandes[0]?.id==='autre-session');check('Une ancienne session ne bloque pas le cours actuel',await next.isEnabled());
 await p.evaluate(()=>window.commandes([{...window.fixture.commandes[0],id:'autre-poste',deviceId:'autre-poste',projectionSessionId:window.fixture.snapshot.projection.sessionId}]));
 await p.waitForFunction(()=>window.fixture.commandes[0]?.id==='autre-poste');check('Un autre poste ne bloque pas le cours actuel',await next.isEnabled());
 await p.evaluate(()=>window.commandes([{...window.fixture.commandes[0],id:'expiree',deviceId:window.fixture.snapshot.deviceId,expiresAt:new Date(Date.now()-1000).toISOString()}]));
 await p.waitForFunction(()=>window.fixture.commandes[0]?.id==='expiree');check('Une commande expiree ne bloque pas le cours actuel',await next.isEnabled());
 await p.evaluate(()=>window.commandes([]));
 for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:900});check('Sans debordement '+width,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 if(process.env.TEST_OUTPUT){await p.setViewportSize({width:390,height:844});await p.screenshot({path:path.join(process.env.TEST_OUTPUT,'liaison.png'),fullPage:true});}
 check('Aucune erreur navigateur',errors.length===0);
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{server.close();if(process.env.TEST_OUTPUT)fs.writeFileSync(path.join(process.env.TEST_OUTPUT,process.argv.includes('--baseline')?'baseline.json':'browser.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));fs.rmSync(dir,{recursive:true,force:true});});
