const RUN_FRAMES = [
  [22,170,193,330], [220,175,180,325], [403,177,176,323], [580,176,194,324],
  [777,169,176,331], [955,181,183,319], [1139,185,194,315], [1334,176,202,324],
  [104,630,248,310], [477,531,245,334], [819,533,276,332], [1215,620,279,320],
];
const MOONCAKES = [
  [12,127,262,265], [306,123,261,274], [598,127,256,271],
  [888,131,261,267], [1180,134,257,257],
];
const PICKUPS = {
  heart:[53,766,306,224], shield:[420,758,274,240],
  magnet:[770,771,325,217], dash:[1095,773,334,217],
};
const OBSTACLES = {
  rock:[42,282,162,95], boulder:[236,279,229,99],
  spire:[494,212,219,164], pillar:[731,61,246,316],
  crystal:[529,477,216,159], gap:[626,770,777,229],
};
const STAGES = ['桂花小径','流云天阶','广寒月宫'];
const HAZARDS = new Set(['rock','boulder','spire','pillar','crystal','gap']);
const GROUND = 280;
const HEIGHT = 360;
const RABBIT_X = 135;

export function mountParkour(root,ctx){
  root.innerHTML = `
    <section class="arc-intro">
      <div class="arc-intro-copy"><span class="arc-eyebrow">✦ &nbsp;05 / MOONLIT JOURNEY</span><h2>玉兔配送中<span>✦</span></h2><p class="arc-intro-lead">跟着玉兔，奔向月亮。</p><p>穿过三段月夜，把一份份思念，送到最温暖的地方。</p></div>
      <p class="arc-intro-hand">每一份小小的心意<br>都在靠近月光 ✧</p>
      <div class="arc-hero-quote" aria-hidden="true">让每一次启程<br>找到回家的光。<span>GOOD THINGS<br>REACH FURTHER</span></div>
    </section>
    <div class="arc-stats">
      <div><span class="arc-stat-icon">♜</span><span><small>奔月路程</small><strong data-distance>0 <em>/ 3000 m</em></strong></span></div>
      <div><span class="arc-stat-icon">♥</span><span><small>玉兔体力</small><strong data-life>♥ ♥ ♥</strong></span></div>
      <div><span class="arc-stat-icon">◷</span><span><small>收集月饼</small><strong data-cakes>0</strong></span></div>
      <div><span class="arc-stat-icon">⌖</span><span><small>当前旅程</small><strong data-stage>桂花小径</strong><small class="arc-passport-count" data-passport>护照贴纸 0 / 3</small></span></div>
      <div class="arc-actions"><button class="arc-run" type="button">启程奔月 &nbsp;▶</button></div>
    </div>
    <section class="arc-workshop">
      <div class="arc-workshop-head"><strong><span class="arc-live-dot">●</span> 玉兔正在配送…</strong><span>DELIVERY IN PROGRESS</span><b>空格 / ↑ / 轻点画面跳跃</b></div>
      <div class="arc-canvas-wrap">
        <button class="arc-pause arc-scene-pause" type="button" disabled aria-label="暂停配送">Ⅱ</button>
        <span class="arc-route-sign arc-route-left" aria-hidden="true">♟ &nbsp;桂花小径 <b>→</b><small>OSMANTHUS PATH</small></span>
        <span class="arc-route-sign arc-route-right" aria-hidden="true">✉ &nbsp;广寒月宫 <b>→</b><small>MOON PALACE</small></span>
        <canvas class="arc-canvas" aria-label="玉兔跑酷游戏。空格、向上箭头或轻点画面跳跃，空中可再跳一次" tabindex="0"></canvas>
        <div class="arc-run-message">桂花小径 → 流云天阶 → 广寒月宫<br><small>点击「启程奔月」开始冒险</small></div>
        <div class="arc-distance-pill">当前距离 <strong data-distance-pill>0</strong> m</div>
        <div class="arc-effect-bar" data-effects aria-live="polite"></div>
        <div class="arc-game-toast" data-toast role="status" aria-live="polite"></div>
      </div>
      <div class="arc-workshop-foot">
        <div class="arc-control-tip"><span>▦</span><p>操作提示<small>按空格 / ↑ 跳跃，空中再按一次可双跳</small></p></div>
        <p>“ 小小的一枚月饼，载着大大的团圆。 ”<small>MOON POST</small></p>
        <div class="arc-utility"><span><b>◈</b> 收集月饼<small>护照贴纸可换护盾</small></span><span><b>♥</b> 小心障碍<small>别让体力耗尽</small></span><button class="arc-jump" type="button">↑ <small>轻点起跳</small></button></div>
      </div>
    </section>
    <div class="arc-bottom"><div class="arc-legend"><span>♡ 三次受伤机会</span><span>◈ 护盾挡住一次碰撞</span><span>◎ 磁铁吸附月饼</span><span>↗ 冲刺免疫障碍</span></div><p class="arc-run-record">本机最远纪录：<strong data-run-record>${ctx.get('parkour-best',0)}</strong> 米</p><p class="arc-run-status" role="status">月亮在前方等你。每 1000 米进入下一关，速度随旅程提升。</p></div>`;

  const $ = selector => root.querySelector(selector);
  const canvas = $('.arc-canvas');
  const g = canvas.getContext('2d');
  const image = src => { const img = new Image(); img.src = src; return img; };
  const scene = image('/images/station-scenes/parkour.webp');
  const runAtlas = image('/images/station-scenes/astronaut-rabbit-atlas.webp');
  const collectiblesAtlas = image('/images/station-scenes/courier-collectibles-atlas.webp');
  const obstaclesAtlas = image('/images/station-scenes/courier-obstacles-atlas.webp');
  let rabbit3d, disposed = false;
  import('./rabbit3d').then(({createRabbit3D}) => {
    if(disposed) return;
    rabbit3d = createRabbit3D();
    canvas.dataset.characterRenderer = '3d';
  }).catch(error => {
    canvas.dataset.characterRenderer = 'fallback';
    console.warn('3D character unavailable; using image fallback.', error);
  });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let W = 1300;
  let raf = 0, last = 0, time = 0, distance = 0, spawnIn = 0, toastUntil = 0, uiElapsed = 0;
  let active = false, paused = false, stage = 0, mooncakes = 0, passports = 0, life = 3;
  let shield = 0, magnet = 0, dash = 0, invincible = 0;
  let bunnyY = GROUND, velocityY = 0, jumps = 0, landing = 0, dustTimer = 0, dust = [], objects = [];
  canvas.height = HEIGHT;

  function resize(){
    const next = canvas.parentElement.clientWidth < 650 ? 640 : 1300;
    if(canvas.width !== next){ W = next; canvas.width = W; }
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.parentElement);

  function announce(message){
    const el = $('[data-toast]');
    el.textContent = message;
    el.classList.add('is-visible');
    toastUntil = performance.now() + 1700;
    $('.arc-run-status').textContent = message;
  }
  function updateUi(){
    $('[data-distance]').innerHTML = `${Math.floor(distance)} <em>/ 3000 m</em>`;
    $('[data-distance-pill]').textContent = Math.floor(distance);
    $('[data-life]').textContent = '♥ '.repeat(life) + '♡ '.repeat(3-life);
    $('[data-cakes]').textContent = mooncakes;
    $('[data-stage]').textContent = STAGES[stage];
    $('[data-passport]').textContent = `护照贴纸 ${passports} 枚 · 每 3 枚换护盾`;
    const effects = [shield ? '◈ 护盾' : '', magnet > 0 ? `◎ 磁铁 ${Math.ceil(magnet)}s` : '', dash > 0 ? `↗ 冲刺 ${Math.ceil(dash)}s` : ''].filter(Boolean);
    $('[data-effects]').textContent = effects.join('  ·  ');
  }
  function finish(won){
    if(!active) return;
    active = false;
    $('.arc-pause').disabled = true;
    $('.arc-run').textContent = '再跑一次';
    $('.arc-run-message').style.display = 'block';
    $('.arc-run-message').innerHTML = won
      ? `已抵达广寒月宫！<br><small>收集 ${mooncakes} 枚月饼 · ${passports} 枚护照贴纸，奔月印章已点亮</small>`
      : `稍作歇息，再出发吧。<br><small>跑过 ${Math.floor(distance)} 米 · 收集 ${mooncakes} 枚月饼</small>`;
    ctx.recordParkour?.({won,distance:Math.floor(distance),coins:mooncakes,mooncakes,passports,at:new Date().toISOString()});
    if(won) ctx.award('parkour');
    const best = Math.max(Math.floor(distance), Number(ctx.get('parkour-best',0)) || 0);
    ctx.set('parkour-best',best);
    $('[data-run-record]').textContent = best;
    updateUi();
  }
  function jump(){
    if(!active || paused || jumps >= 2) return;
    velocityY = -470;
    jumps++;
  }
  function spawnMooncakes(x,count=3){
    const flavor = Math.floor(Math.random()*5);
    for(let i=0;i<count;i++) objects.push({type:'mooncake',flavor,x:x+i*57,y:GROUND-59-(i%2)*13,hit:false});
  }
  function spawnWave(){
    const x = W + 64;
    const roll = Math.random();
    if(roll < .40) spawnMooncakes(x,2+Math.floor(Math.random()*2));
    else if(roll < .72){
      const available = stage === 0 ? ['rock','boulder','crystal'] : stage === 1 ? ['rock','boulder','spire','crystal','gap'] : ['boulder','spire','pillar','crystal','gap'];
      objects.push({type:available[Math.floor(Math.random()*available.length)],x,hit:false});
    } else if(roll < .82) objects.push({type:'passport',x,y:GROUND-78,hit:false});
    else {
      const types = life < 3 ? ['heart','shield','magnet','dash'] : ['shield','magnet','dash'];
      objects.push({type:types[Math.floor(Math.random()*types.length)],x,y:GROUND-77,hit:false});
    }
    spawnIn = Math.max(.88,1.25-stage*.1) + Math.random()*.55;
  }
  function start(){
    active = true; paused = false; last = 0; time = distance = uiElapsed = 0; stage = mooncakes = passports = 0; life = 3;
    shield = magnet = dash = invincible = 0; bunnyY = GROUND; velocityY = jumps = landing = dustTimer = 0; dust = [];
    objects = [.43,.53,.63,.73].map((part,i) => ({type:'mooncake',flavor:i,x:W*part,y:GROUND-58-(i%2)*10,hit:false}));
    spawnIn = 1.3;
    $('.arc-run-message').style.display = 'none';
    $('.arc-pause').disabled = false;
    $('.arc-pause').textContent = 'Ⅱ';
    $('.arc-pause').setAttribute('aria-label','暂停配送');
    $('.arc-run').textContent = '重新启程';
    $('[data-toast]').classList.remove('is-visible');
    updateUi(); canvas.focus();
  }
  function circle(x,y,r,color){g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
  function sprite(img,rect,x,y,w,h){
    if(!img.complete || !img.naturalWidth) return false;
    g.drawImage(img,...rect,x,y,w,h);
    return true;
  }
  function drawPassport(o){
    g.save();g.translate(o.x,o.y);g.rotate(Math.sin(time*3+o.x*.01)*.08);
    g.shadowColor='#f4c476';g.shadowBlur=17;g.fillStyle='#26354c';g.fillRect(-18,-24,36,47);
    g.shadowBlur=0;g.strokeStyle='#f6d59f';g.lineWidth=2;g.strokeRect(-18,-24,36,47);
    g.strokeStyle='#f6d59f88';g.strokeRect(-14,-20,28,39);
    circle(0,-7,8,'#f3d6a6');circle(3,-10,7,'#26354c');
    g.fillStyle='#f5dab0';g.font='7px Arial';g.textAlign='center';g.fillText('MOON',0,14);g.restore();
  }
  function drawObject(o){
    if(o.hit && HAZARDS.has(o.type)) return;
    if(o.type==='mooncake'){
      g.save();g.shadowColor='#ffd17a';g.shadowBlur=13;
      const size=47;
      if(!sprite(collectiblesAtlas,MOONCAKES[o.flavor],o.x-size/2,o.y-size/2+Math.sin(time*5+o.x*.02)*3,size,size))circle(o.x,o.y,20,'#f8c475');
      g.restore();return;
    }
    if(o.type==='passport'){drawPassport(o);return;}
    if(PICKUPS[o.type]){
      g.save();g.shadowColor='#ffce78';g.shadowBlur=15;
      if(!sprite(collectiblesAtlas,PICKUPS[o.type],o.x-28,o.y-27+Math.sin(time*4+o.x*.02)*3,56,54))circle(o.x,o.y,20,'#eabd78');
      g.restore();return;
    }
    if(o.type==='gap'){
      g.save();g.fillStyle='#060c14e8';g.fillRect(o.x-53,GROUND-1,106,78);
      if(!sprite(obstaclesAtlas,OBSTACLES.gap,o.x-70,GROUND-40,140,94))circle(o.x,GROUND,36,'#151923');
      g.restore();return;
    }
    const sizes={rock:[67,42],boulder:[75,48],spire:[70,77],pillar:[62,99],crystal:[66,66]};
    const [w,h]=sizes[o.type] || [65,50];
    g.save();g.shadowColor='#dba765';g.shadowBlur=9;
    if(!sprite(obstaclesAtlas,OBSTACLES[o.type],o.x-w/2,GROUND+7-h,w,h))circle(o.x,GROUND-20,20,'#5d5761');
    g.restore();
  }
  function drawRabbit(){
    const inAir=bunnyY<GROUND-3;
    const height=GROUND-bunnyY;

    // The shadow stays on the bridge while the character rises above it.
    g.save();
    g.globalAlpha=Math.max(.12,.37-height/430);
    g.fillStyle='#070d14';g.beginPath();g.ellipse(RABBIT_X,GROUND+8,Math.max(22,52-height*.17),7,0,0,Math.PI*2);g.fill();
    g.restore();

    g.save();g.translate(RABBIT_X,bunnyY);
    if(invincible>0&&Math.floor(time*12)%2===0)g.globalAlpha=.48;
    if(shield||dash>0){g.strokeStyle=dash>0?'#ffd683':'#b8e3ff';g.lineWidth=3;g.beginPath();g.arc(0,-68,67,0,Math.PI*2);g.stroke();}
    if(rabbit3d){
      const character=rabbit3d.render({time,active,inAir,velocityY,landing,
        speed:(285+stage*35)/285*(dash>0?1.5:1),reducedMotion:reducedMotion.matches});
      g.drawImage(character,-84,-179,168,189);
    }else if(runAtlas.complete&&runAtlas.naturalWidth){
      const frame=inAir?(velocityY<0?9:10):active&&!reducedMotion.matches?Math.floor(time*16)%8:0;
      sprite(runAtlas,RUN_FRAMES[frame],-70,-154,140,155);
    }
    g.restore();
  }
  function drawDust(){
    if(reducedMotion.matches)return;
    for(const particle of dust){
      g.save();g.globalAlpha=Math.max(0,1-particle.age/particle.life)*.65;
      circle(particle.x,particle.y,particle.size*(1+particle.age*1.3),'#f9dfad');
      g.restore();
    }
  }
  function render(){
    g.clearRect(0,0,W,HEIGHT);
    const sky=g.createLinearGradient(0,0,0,HEIGHT);sky.addColorStop(0,'#0b1524');sky.addColorStop(1,'#253247');g.fillStyle=sky;g.fillRect(0,0,W,HEIGHT);
    if(scene.complete && scene.naturalWidth){
      const left=Math.min(400,scene.naturalWidth*.24);
      g.drawImage(scene,left,0,scene.naturalWidth-left,scene.naturalHeight,0,0,W,HEIGHT);
    }else circle(W*.75,130,87,'#efcd91');
    const veil=g.createLinearGradient(0,0,0,HEIGHT);veil.addColorStop(0,'#08132322');veil.addColorStop(.7,'#0813230b');veil.addColorStop(1,'#08132344');g.fillStyle=veil;g.fillRect(0,0,W,HEIGHT);
    for(let i=0;i<16;i++){const x=(i*139+59)%W,y=16+(i*83)%150;g.fillStyle=i%5===0?'#ffe4a1':'#dce5ef88';g.fillRect(x,y,i%5===0?2:1,i%5===0?2:1);}
    g.fillStyle='#08111b45';g.fillRect(0,GROUND+9,W,HEIGHT-GROUND-9);
    g.strokeStyle='#e7bb7799';g.lineWidth=2;g.beginPath();g.moveTo(0,GROUND+8);g.lineTo(W,GROUND+8);g.stroke();
    for(const o of objects) drawObject(o);
    drawDust();
    drawRabbit();
  }
  function hitHazard(o){
    if(dash>0 || invincible>0) return;
    if(shield){shield=0;invincible=1;announce('护盾挡住了障碍！');updateUi();return;}
    life--;invincible=1.6;announce('碰到月路障碍！提前起跳，空中还能再跳一次。');
    updateUi();
    if(life<=0) finish(false);
  }
  function collect(o){
    if(o.type==='mooncake'){mooncakes++;if(mooncakes%5===0) announce(`已收集 ${mooncakes} 枚月饼 ✦`);}
    else if(o.type==='passport'){
      passports++;
      if(passports%3===0){shield=1;announce('集齐 3 枚护照贴纸，获得一次护盾！');}
      else announce(`护照贴纸 ${passports%3}/3`);
    }else if(o.type==='heart'){life=Math.min(3,life+1);announce('体力恢复一格 ♥');}
    else if(o.type==='shield'){shield=1;announce('护盾已装备 ◈');}
    else if(o.type==='magnet'){magnet=8;announce('磁铁已启动，月饼会靠近玉兔 ◎');}
    else if(o.type==='dash'){dash=4;announce('冲刺启动，短暂免疫障碍 ↗');}
    updateUi();
  }
  function collision(o){
    if(HAZARDS.has(o.type)){
      if(o.type==='gap') return Math.abs(o.x-RABBIT_X)<45 && bunnyY>GROUND-45;
      const bounds={rock:[25,34],boulder:[29,42],spire:[25,68],pillar:[24,91],crystal:[23,58]};
      const [half,height]=bounds[o.type];
      const horizontal=Math.abs(o.x-RABBIT_X)<half+24;
      const vertical=bunnyY-8>GROUND-height && bunnyY-83<GROUND+7;
      return horizontal && vertical;
    }
    const radius=(magnet>0 && o.type==='mooncake')?175:47;
    return Math.hypot(o.x-RABBIT_X,o.y-(bunnyY-47))<radius;
  }
  function frame(timestamp){
    const dt=last?Math.min((timestamp-last)/1000,.035):0;
    last=timestamp;
    if(active && !paused){
      time+=dt;
      const speed=(285+stage*35)*(dash>0?1.5:1);
      distance=Math.min(3000,distance+dt*speed/7);
      stage=Math.min(2,Math.floor(distance/1000));
      invincible=Math.max(0,invincible-dt);magnet=Math.max(0,magnet-dt);dash=Math.max(0,dash-dt);
      const wasAirborne=bunnyY<GROUND-3;
      velocityY+=1150*dt;bunnyY+=velocityY*dt;
      if(bunnyY>=GROUND){
        bunnyY=GROUND;velocityY=0;jumps=0;
        if(wasAirborne){
          landing=.18;
          for(let i=0;i<6;i++)dust.push({x:RABBIT_X-25+i*8,y:GROUND-3,vx:-65-Math.random()*70,vy:-18-Math.random()*35,size:2+Math.random()*3,age:0,life:.35+Math.random()*.25});
        }
      }
      landing=Math.max(0,landing-dt);
      if(!reducedMotion.matches&&bunnyY>=GROUND-2){
        dustTimer-=dt;
        if(dustTimer<=0){
          dustTimer=.08;
          dust.push({x:RABBIT_X-35,y:GROUND-2,vx:-75-Math.random()*55,vy:-8-Math.random()*22,size:2+Math.random()*2,age:0,life:.35});
        }
      }
      dust=dust.filter(p=>p.age<p.life);
      for(const p of dust){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=70*dt;}
      spawnIn-=dt;
      if(spawnIn<=0) spawnWave();
      for(const o of objects){
        o.x-=speed*dt;
        if(o.hit || !collision(o)) continue;
        o.hit=true;
        if(HAZARDS.has(o.type)) hitHazard(o); else collect(o);
        if(!active) break;
      }
      objects=objects.filter(o=>o.x>-100 && !o.hit);
      uiElapsed+=dt;
      if(uiElapsed>=.1){updateUi();uiElapsed=0;}
      if(distance>=3000 && active) finish(true);
    }
    if(toastUntil && timestamp>toastUntil){$('[data-toast]').classList.remove('is-visible');toastUntil=0;}
    render();
    raf=requestAnimationFrame(frame);
  }
  function togglePause(){
    if(!active) return;
    paused=!paused;
    $('.arc-pause').textContent=paused?'▶':'Ⅱ';
    $('.arc-pause').setAttribute('aria-label',paused?'继续配送':'暂停配送');
    $('.arc-run-message').style.display=paused?'block':'none';
    $('.arc-run-message').innerHTML='月下小憩<br><small>点击「继续」返回旅程</small>';
    $('.arc-run-status').textContent=paused?'旅程已暂停，点击「继续」再出发。':'旅程继续，轻点或按空格跳跃。';
  }
  function onKey(e){
    if(e.code!=='Space' && e.code!=='ArrowUp') return;
    if(e.target instanceof HTMLElement && (['BUTTON','INPUT','TEXTAREA','SELECT','SUMMARY'].includes(e.target.tagName)||e.target.isContentEditable)) return;
    e.preventDefault();if(!e.repeat) jump();
  }
  function onVisibility(){if(document.hidden && active && !paused) togglePause();}
  $('.arc-run').addEventListener('click',start);
  $('.arc-pause').addEventListener('click',togglePause);
  $('.arc-jump').addEventListener('click',jump);
  canvas.addEventListener('pointerdown',jump);
  window.addEventListener('keydown',onKey);
  document.addEventListener('visibilitychange',onVisibility);
  raf=requestAnimationFrame(frame);
  return () => {
    disposed=true;resizeObserver.disconnect();cancelAnimationFrame(raf);rabbit3d?.dispose();
    window.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onVisibility);
    canvas.removeEventListener('pointerdown',jump);
  };
}
