const fs=require('fs'),path=require('path'),vm=require('vm');
async function loadApp(htmlPath){
 const d=path.dirname(htmlPath),html=fs.readFileSync(htmlPath,'utf8');let script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const fake={textContent:'',setAttribute(){},addEventListener(){},classList:{contains(){return false},add(){},toggle(){return false}}};
 const warnings=[],ctx={structuredClone,URL,URLSearchParams,Map,Set,console:{warn(...args){warnings.push(args.map(x=>x?.message||String(x)).join(' '))},log(){}},document:{getElementById(){return fake},documentElement:{dataset:{},classList:fake.classList},querySelector(){return null},querySelectorAll(){return[]},addEventListener(){}},location:{search:'?demo=1',href:'http://127.0.0.1/site/visual-key-lab/?demo=1'},localStorage:{getItem(){return null}},history:{replaceState(){}},fetch:async file=>{const p=path.resolve(d,String(file).split('?')[0]);return {ok:fs.existsSync(p),json:async()=>JSON.parse(fs.readFileSync(p,'utf8'))}}};ctx.window=ctx;
 script=script.replace('if(new Set(state.species.map(s=>s.id)).size!==state.species.length)','return;\nif(new Set(state.species.map(s=>s.id)).size!==state.species.length)');
 script=script.replace('boot();','globalThis.__app={state,qs,boot,currentResults,progressiveResultGroups,coreChoiceStatus,refinementEvidence,selectedRefinementStates,verifiedAdvancedConflict'+(script.includes('const reviewedGouldSupplements=')?',reviewedGouldSupplements':'')+'};');
 vm.createContext(ctx);vm.runInContext(script,ctx);await ctx.__app.boot();return {...ctx.__app,warnings,context:ctx};
}
module.exports={loadApp};

