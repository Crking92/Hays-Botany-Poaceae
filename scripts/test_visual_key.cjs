const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {chromium} = require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try {
 const html=await fs.readFile(path.join(root,'site/visual-key-lab/index.html'),'utf8');
 new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
 const species=(await Promise.all(['a','b','c1','c2','c3','d1','d2','d3','d4'].map(k=>fs.readFile(path.join(root,'site/visual-key-lab/species-'+k+'.json'),'utf8').then(JSON.parse)))).flat();
 assert.equal(species.length,112);assert.equal(new Set(species.map(s=>s.id)).size,112);
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.origin!=='https://key.test')return route.abort();
  const file=path.resolve(root,'.'+decodeURIComponent(u.pathname));
  if(!file.startsWith(root+path.sep))return route.abort();
  try{let body=await fs.readFile(file);if(file.endsWith(path.join('visual-key-lab','index.html')))body=html.replace('boot();','window.review={qs,headIcon,characterIcon,flowerheadSections,state,currentResults,render};boot();');
  await route.fulfill({body,contentType:file.endsWith('.html')?'text/html':file.endsWith('.json')?'application/json':'application/octet-stream'});}catch{await route.fulfill({status:404,body:'missing'});}
 });
 await page.goto('https://key.test/site/visual-key-lab/index.html');
 await page.waitForFunction(()=>window.review?.state.species.length>=112 && document.querySelectorAll('.result').length>0);
 const result=await page.evaluate(()=>{
  const {qs,headIcon,characterIcon,flowerheadSections,state,currentResults}=review;
  const options=qs.flatMap(q=>q.options.map(o=>({kind:q.id,key:o[0]})));
  const placements=[...options,...flowerheadSections.map(g=>({kind:'head',key:g.icon})),...qs.map(q=>({kind:q.id,key:({head:'airy',habit:'tuft',ligule:'membrane',awns:'three'})[q.id]}))];
  const out=[];for(const item of placements){const svg=item.kind==='head'?headIcon(item.key):characterIcon(item.kind,item.key);document.body.append(svg);const b=svg.getBBox();if(!b.width||!b.height||b.x<1||b.y<1||b.x+b.width>109||b.y+b.height>109)out.push({...item,box:[b.x,b.y,b.width,b.height]});svg.remove();}
  const official=state.species.filter(s=>!s.trial);if(official.length!==112)throw Error('Original scored population changed');
  const provisional=state.species.filter(s=>s.trial);if(provisional.length!==6)throw Error('Six research trials missing or silently admitted');
  let paths=0;for(const s of official){let combinations=[{}];for(const q of qs){const vals=s.traits[q.id]?.length?s.traits[q.id]:[null];combinations=combinations.flatMap(c=>vals.map(v=>({...c,[q.id]:v})));}for(const c of combinations){state.selected=c;if(!currentResults().some(r=>r.s.id===s.id))throw Error('False exclusion: '+s.id+JSON.stringify(c));paths++;}}
  state.selected={head:null,habit:null,ligule:null,awns:null};
  const grouped=flowerheadSections.flatMap(g=>g.keys);return {placements:placements.length,options:options.length,groupCount:flowerheadSections.length,out,paths,grouped,heads:qs[0].options.map(o=>o[0])};
 });
 assert.deepEqual(result.out,[]);assert.equal(result.placements,result.options+result.groupCount+4);assert.ok(result.options>=38,'Missing formerly supported visual choices');assert.deepEqual([...result.grouped].sort(),[...result.heads].sort());
 for(const [width,height]of [[1366,900],[390,844],[320,740]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{review.state.question=0;review.render()});
  assert.equal(await page.locator('.whole-head').count(),result.heads.length);
  assert.equal(await page.locator('.whole-head img').count(),result.heads.length);
  assert.ok(await page.evaluate(()=>[...document.querySelectorAll('.whole-head img')].every(img=>getComputedStyle(img).objectFit==='contain')),'Flowerhead photos must use object-fit:contain');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow at '+width);
  for(const name of ['Growth form','Leaf collar','Awns / bristles','Flowerhead'])await page.getByRole('button',{name,exact:true}).click();
  await page.locator('.answer').first().click();assert.equal(await page.locator('.answer[aria-pressed=true]').count(),1);
  await page.getByRole('button',{name:'Clear this choice',exact:true}).click();assert.equal(await page.locator('.answer[aria-pressed=true]').count(),0);
  await page.locator('.result').first().click();assert.equal(await page.locator('#detail-dialog').evaluate(d=>d.open),true);await page.getByRole('button',{name:'Close species detail',exact:true}).click();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',...result,grouped:undefined,heads:undefined,viewports:[1366,390,320],photos:'Network images blocked: no image-content or license certification'},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
