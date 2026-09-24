const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/lib/analytics.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function boot(hostname='moonpost.pages.dev',dnt='0'){
 const sent=[],scripts=[];let now=0;
 const context={exports:{},window:{},location:{hostname,search:'?utm_source=wechat&message=private'},navigator:{language:'zh-CN',doNotTrack:dnt},screen:{width:390,height:844},document:{referrer:'https://example.com/private?secret=yes',createElement:()=>({dataset:{}}),head:{appendChild:s=>scripts.push(s)}},performance:{now:()=>now},URL,URLSearchParams,Promise,Set};
 vm.runInNewContext(code,context);
 return {api:context.exports,sent,scripts,time:v=>now=v,load(){context.window.umami={track:p=>sent.push(p)};scripts[0].onload();}};
}
const t=boot();t.api.initAnalytics();t.api.initAnalytics();assert.equal(t.scripts.length,1);assert.equal(t.scripts[0].dataset.autoPageview,'false');
t.api.trackPage('/');t.api.trackPage('/');t.api.trackPage('/quiz');assert.equal(t.sent.length,0);t.load();assert.equal(t.sent.filter(p=>!p.name).length,2);assert.equal(t.sent[0].url,'/');assert.equal(t.sent[2].url,'/quiz');assert.equal(t.sent[0].referrer,'https://example.com');
t.api.startActivity('quiz');t.time(3200);t.api.finishActivity('quiz',{outcome:'completed',correct:8,text:'secret',name:'private'});t.api.finishActivity('quiz');const end=t.sent.filter(p=>p.name==='activity_end');assert.equal(end.length,1);assert.equal(end[0].data.elapsed_seconds,3);assert.equal(end[0].data.text,undefined);assert.equal(end[0].data.name,undefined);assert.equal(end[0].data.utm_source,'wechat');
t.api.startActivity('quiz');t.api.trackPage('/wall');assert.equal(t.sent.filter(p=>p.name==='activity_end').at(-1).data.reason,'route_change');
for(const test of [boot('localhost'),boot('moonpost.pages.dev','1')]){test.api.initAnalytics();test.api.trackPage('/');assert.equal(test.scripts.length,0);assert.equal(test.sent.length,0);}
const blocked=boot();blocked.api.initAnalytics();blocked.scripts[0].onerror();assert.doesNotThrow(()=>{blocked.api.trackPage('/');blocked.api.startActivity('parkour');blocked.api.finishActivity('parkour');});
console.log('PASS: page deduplication, delayed SDK, captured routes, lifecycle, privacy fields, DNT, local exclusion, blocked SDK');
