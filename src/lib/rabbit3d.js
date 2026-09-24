import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Jointed, realtime character. All motion is sampled from the game's clock.
export function createRabbit3D() {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(384, 432);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.65, 1.65, 3.55, -.16, .1, 30);
  camera.position.set(0, 0, 8);
  scene.add(new THREE.HemisphereLight(0xe7f1ff, 0x806044, 2.2));
  const key = new THREE.DirectionalLight(0xffe0ab, 3.3); key.position.set(3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb95d, 2.8); rim.position.set(-3, 3, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x9bbdff, 1); fill.position.set(-4, 1, 4); scene.add(fill);
  const geometry = new THREE.SphereGeometry(1, 32, 24);
  const materials = [];
  const extraGeometry=[];
  const mat = (color, roughness=.8, metalness=0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness }); materials.push(m); return m;
  };
  const cream=mat('#fff0df'), belly=mat('#fff8ef'), pink=mat('#edaaa7'), cheek=mat('#f1bbb2');
  const eye=mat('#24130f',.17), white=mat('#ffffff',.25), nose=mat('#cf775f',.55);
  const suit=mat('#edf0f2'), seam=mat('#666b70'), leather=mat('#76411f'), flap=mat('#a26732'), gold=mat('#eab763',.4,.4);
  function ell(parent, material, pos, scale, angle=0) {
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...pos);mesh.scale.set(...scale);mesh.rotation.z=angle;parent.add(mesh);return mesh;
  }
  function ring(parent,material,pos,scale,radius=1,tube=.035){
    const geo=new THREE.TorusGeometry(radius,tube,12,64);extraGeometry.push(geo);
    const mesh=new THREE.Mesh(geo,material);mesh.position.set(...pos);mesh.scale.set(...scale);parent.add(mesh);return mesh;
  }
  function padded(parent, material, pos, size, radius=.08){
    const geo=new RoundedBoxGeometry(...size,3,radius);extraGeometry.push(geo);
    const mesh=new THREE.Mesh(geo,material);mesh.position.set(...pos);parent.add(mesh);return mesh;
  }
  function joint(parent,x,y,z){const j=new THREE.Group();j.position.set(x,y,z);parent.add(j);return j;}
  const root=joint(scene,0,0,0);
  const torso=joint(root,-.15,1.08,0);
  ell(torso,suit,[0,0,0],[.48,.66,.40],-.18);
  ell(torso,suit,[.24,-.04,.22],[.31,.48,.25],-.18);
  ell(torso,seam,[.28,.04,.423],[.17,.22,.023],-.18);
  ell(torso,white,[.28,.07,.446],[.14,.18,.016],-.18);
  ell(torso,gold,[.28,.16,.47],[.06,.06,.02]);
  ell(torso,seam,[.30,-.01,.47],[.075,.04,.02]);
  ell(torso,seam,[.04,-.30,.37],[.39,.045,.06],-.12);
  ell(torso,belly,[-.49,-.28,-.05],[.23,.23,.23]);
  const head=joint(torso,.28,.77,.02);
  head.scale.setScalar(1.08);
  ell(head,suit,[-.04,.08,-.10],[.70,.67,.48]);
  ell(head,cream,[.10,.08,.09],[.55,.54,.40]);
  ring(head,seam,[.18,.07,.425],[.60,.67,1]);
  ring(head,gold,[.18,.07,.447],[.63,.70,1],1,.023);
  ring(head,white,[.18,.07,.46],[.58,.65,1],1,.012);
  ell(head,suit,[-.43,.06,.37],[.22,.235,.15]);
  ell(head,gold,[-.43,.06,.495],[.18,.193,.044]);
  ell(head,seam,[-.43,.06,.535],[.14,.15,.027]);
  ell(head,white,[-.45,.10,.56],[.015,.06,.01]);
  ell(head,belly,[.43,-.12,.12],[.23,.23,.30]);
  ell(head,cheek,[.08,-.15,.425],[.16,.095,.026]);
  ell(head,eye,[.34,.14,.389],[.105,.155,.067],-.12);
  ell(head,white,[.368,.205,.443],[.029,.042,.018]);
  ell(head,white,[.305,.11,.448],[.012,.016,.01]);
  ell(head,nose,[.62,-.054,.32],[.043,.035,.035]);
  ell(head,eye,[.58,-.16,.36],[.01,.037,.012],-.5);
  // Thin curved visor: highlights follow the lighting without hiding the face.
  const visorMaterial=new THREE.MeshPhysicalMaterial({color:0xe4f2ff,transparent:true,opacity:.055,roughness:.08,metalness:.12,clearcoat:1,depthWrite:false});materials.push(visorMaterial);
  ell(head,visorMaterial,[.18,.07,.43],[.57,.63,.13]);
  ell(head,white,[-.10,.40,.50],[.018,.13,.009],-.35);
  ell(head,cheek,[.50,-.16,.365],[.07,.06,.018]);
  const ears=[];
  for(let i=0;i<2;i++){
    const ear=joint(head,-.18-i*.22,.42,i===0?.15:-.21);
    const tip=joint(ear,0,.49,0);
    ell(ear,cream,[0,.30,0],[.16,.45,.115]);
    ell(tip,cream,[0,.17,0],[.14,.29,.10]);
    ell(ear,pink,[.025,.32,.104],[.097,.32,.018]);
    ell(tip,pink,[.02,.12,.091],[.08,.20,.017]);
    ears.push({ear,tip});
  }
  const legs=[];
  for(const z of [-.24,.26]){
    const hip=joint(root,-.20,.87,z);
    const knee=joint(hip,0,-.39,0);
    ell(hip,suit,[0,-.17,0],[.23,.31,.22]);
    ell(knee,suit,[0,-.17,0],[.19,.28,.19]);
    ell(knee,seam,[0,-.28,0],[.19,.045,.19]);
    for(const y of [-.02,-.09])ell(knee,suit,[.015,y,.17],[.13,.025,.028]);
    const foot=joint(knee,0,-.38,.02);
    ell(foot,suit,[.13,.015,.018],[.32,.18,.22]);
    ell(foot,seam,[.13,-.12,.018],[.32,.035,.22]);
    ell(foot,gold,[.20,.06,.224],[.047,.047,.012]);
    legs.push({hip,knee,foot,z});
  }
  const arms=[];
  for(const z of [-.34,.36]){
    const shoulder=joint(torso,.19,.40,z);
    ell(shoulder,suit,[0,-.17,0],[.18,.28,.18]);
    ell(shoulder,seam,[0,-.12,.169],[.10,.11,.02]);
    ell(shoulder,gold,[0,-.12,.193],[.024,.065,.008]);
    ell(shoulder,gold,[0,-.12,.195],[.059,.022,.008]);
    const elbow=joint(shoulder,0,-.35,0);
    ell(elbow,suit,[.04,-.16,0],[.17,.25,.18]);
    ell(elbow,seam,[.04,-.25,0],[.174,.05,.182]);
    ell(elbow,belly,[.04,-.32,.015],[.16,.15,.165]);
    ell(elbow,belly,[.16,-.27,.07],[.085,.11,.08],-.4);
    arms.push({shoulder,elbow});
  }
  // Rounded leather satchel with a flap, strap, clasp and rabbit emblem.
  const bag=joint(torso,-.39,.0,.43);
  padded(bag,leather,[0,0,0],[.64,.65,.28]);
  padded(bag,flap,[0,.17,.13],[.66,.29,.095],.045);
  padded(bag,gold,[.16,-.1,.16],[.035,.12,.025],.01);
  // Small stitched border on the pouch flap.
  for(let i=0;i<8;i++)ell(bag,gold,[-.26+i*.075,.065,.185],[.018,.005,.003]);
  ell(bag,gold,[.01,.04,.205],[.10,.075,.025]);
  const planetRing=ring(bag,gold,[.01,.04,.225],[.16,.045,1],1,.12);planetRing.rotation.z=.3;
  ell(torso,leather,[.02,.29,.398],[.055,.50,.028],-.56);
  ell(torso,seam,[.22,.62,.01],[.44,.10,.42],-.10);
  ell(torso,gold,[.22,.68,.01],[.44,.035,.42],-.10);
  let previousTime=null, phase=0, poseMix=0, flightBlend=0, lastPoseKey;
  function render({time,active,inAir,velocityY,landing,speed=1,reducedMotion=false}){
    const poseKey=[time,active,inAir,velocityY,landing,speed,reducedMotion].join(':');
    if(poseKey===lastPoseKey)return renderer.domElement;
    lastPoseKey=poseKey;
    const dt=previousTime===null?0:Math.min(.05,Math.max(0,time-previousTime));previousTime=time;
    if(time===0){phase=0;poseMix=0;flightBlend=0;}
    const moving=active&&!reducedMotion;
    if(moving)phase+=dt*2*Math.PI*1.85*speed;
    const target=inAir?1:0;
    poseMix += (target-poseMix)*(1-Math.exp(-dt*18));
    const flightTarget=THREE.MathUtils.smoothstep(velocityY,-160,160);
    flightBlend+=(flightTarget-flightBlend)*(1-Math.exp(-dt*12));
    const p=phase, run=moving?1:0, air=poseMix;
    const compress=landing>0?Math.sin(Math.PI*landing/.18)*.10:0;
    const lift=run*(1-air)*(.035+.035*Math.cos(p*2));
    root.position.y=lift;
    root.rotation.y=run*.025*Math.sin(p);
    torso.rotation.z=run*(-.10+.055*Math.sin(p*2))*(1-air)+THREE.MathUtils.lerp(-.20,.10,flightBlend)*air;
    torso.scale.set(1+compress,1-compress,1);
    head.rotation.z=run*.038*Math.sin(p*2-.6)-torso.rotation.z*.35;
    for(let i=0;i<2;i++){
      const q=p+i*Math.PI;
      // Two-link leg IK keeps the stance foot travelling with the ground.
      // A continuous oval foot path removes pose snaps at toe-off and contact.
      const swing=Math.max(0,Math.sin(q));
      const stance=Math.sin(q)<=0;
      const x=-.35*Math.cos(q);
      const y=-.65+.30*swing*swing;
      const tx=run*x*(1-air)+(.27-i*.36)*air;
      const airY=THREE.MathUtils.lerp(-.43,-.62,flightBlend);
      const ty=((run?y:-.68)-lift)*(1-air)+airY*air;
      const l1=.39,l2=.38;
      const d=Math.min(.765,Math.hypot(tx,ty));
      const a=Math.acos(THREE.MathUtils.clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));
      const bend=Math.PI-Math.acos(THREE.MathUtils.clamp((l1*l1+l2*l2-d*d)/(2*l1*l2),-1,1));
      legs[i].hip.rotation.z=Math.atan2(tx,-ty)-a;
      legs[i].knee.rotation.z=bend;
      legs[i].foot.rotation.z=-legs[i].hip.rotation.z-bend+(stance?0:-.3*swing)*(1-air);
      arms[i].shoulder.rotation.z=run*(.20-.55*Math.sin(q))*(1-air)+THREE.MathUtils.lerp(1.15,1.55,flightBlend)*air;
      arms[i].elbow.rotation.z=(.95+run*.18*Math.sin(q-.7))*(1-air)+.35*air;
      arms[i].shoulder.rotation.y=(i===0?-.5:.5)*air;
      ears[i].ear.rotation.z=.40+i*.17+run*(.10*Math.sin(p-.7-i*.5))+.24*air;
      ears[i].tip.rotation.z=.12+run*.16*Math.sin(p-1.3-i*.5);
    }
    bag.rotation.z=run*.09*Math.sin(p*2-1.0)+.12*air;
    bag.position.y=run*.035*Math.sin(p*2-.7);
    renderer.render(scene,camera);
    return renderer.domElement;
  }
  return {render,dispose(){geometry.dispose();extraGeometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();}};
}
