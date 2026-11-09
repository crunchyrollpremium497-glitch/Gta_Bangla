
import * as THREE from 'three';
import './style.css';

const mount = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9bac0');
scene.fog = new THREE.FogExp2('#a9bac0', 0.00155);
const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 1200);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18;
renderer.domElement.className = 'webgl'; renderer.domElement.tabIndex = 0; mount.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight('#d9efff', '#594c45', 2.05); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff0d4', 3.2); sun.position.set(-110, 150, 70); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-230; sun.shadow.camera.right=230; sun.shadow.camera.top=230; sun.shadow.camera.bottom=-230; sun.shadow.bias=-0.00025; sun.shadow.normalBias=.035; sun.shadow.radius=4; scene.add(sun);
const fill = new THREE.DirectionalLight('#91b9e8', .75); fill.position.set(120,50,-100); scene.add(fill);
const mat=(color,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const boxGeo=new THREE.BoxGeometry(1,1,1), sphereGeo=new THREE.SphereGeometry(1,14,10), cylGeo=new THREE.CylinderGeometry(.5,.5,1,12);
function addBox(parent, geo, material, pos, scale, cast=false, receive=true){const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.scale.set(...scale);m.castShadow=cast;m.receiveShadow=receive;parent.add(m);return m;}

function noiseTexture(base, fleck, size=256){const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,size,size);for(let i=0;i<18000;i++){x.globalAlpha=Math.random()*.16;x.fillStyle=fleck;const s=Math.random()*2+0.3;x.fillRect(Math.random()*size,Math.random()*size,s,s)}x.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(28,28);t.colorSpace=THREE.SRGBColorSpace;return t;}
const asphalt=new THREE.MeshStandardMaterial({map:noiseTexture('#343a40','#879096'),roughness:.96});const grassMat=mat('#65755c');
addBox(scene,boxGeo,mat('#253a46'),[0,-1.05,0],[1800,.5,1800],false,false);addBox(scene,boxGeo,grassMat,[0,-.45,0],[540,.8,540],false,true);addBox(scene,boxGeo,asphalt,[0,-.045,0],[510,.12,510],false,true);
const roadCoords=[];for(let n=-3;n<=3;n++)roadCoords.push(n*68);const lineMat=new THREE.MeshStandardMaterial({color:'#e4ddc9',roughness:.75}),yellowMat=new THREE.MeshStandardMaterial({color:'#d8a84b',roughness:.7});
for(const r of roadCoords){addBox(scene,boxGeo,asphalt,[r,.015,0],[15,.08,510],false,true);addBox(scene,boxGeo,asphalt,[0,.016,r],[510,.08,15],false,true);for(let q=-238;q<239;q+=13){addBox(scene,boxGeo,lineMat,[r,.064,q],[.13,.018,5.3]);addBox(scene,boxGeo,lineMat,[q,.064,r],[5.3,.018,.13]);}for(let s of [-9.2,9.2]){addBox(scene,boxGeo,mat('#d4cfc1'),[r,.1,s],[15,.18,.38]);addBox(scene,boxGeo,mat('#d4cfc1'),[s,.1,r],[.38,.18,15]);}}
for(const x of roadCoords)for(const z of roadCoords){for(let i=-4;i<=4;i++)if(Math.abs(i)>1){addBox(scene,boxGeo,lineMat,[x+i*1.35,.07,z-10.4],[.88,.025,3.8]);addBox(scene,boxGeo,lineMat,[x-10.4,.07,z+i*1.35],[3.8,.025,.88]);}for(let a of [-1,1]){addBox(scene,boxGeo,yellowMat,[x+a*4.8,.07,z],[.12,.025,10]);addBox(scene,boxGeo,yellowMat,[x,.07,z+a*4.8],[10,.025,.12]);}}

const glassMaterials=[new THREE.MeshStandardMaterial({color:'#86a9b5',roughness:.24,metalness:.25,emissive:'#31596b',emissiveIntensity:.23}),new THREE.MeshStandardMaterial({color:'#b8a98d',roughness:.34,metalness:.18,emissive:'#ffbc6e',emissiveIntensity:.16}),new THREE.MeshStandardMaterial({color:'#334657',roughness:.24,metalness:.32,emissive:'#223b55',emissiveIntensity:.23})];
const facades=['#d9b895','#c9cec7','#738896','#d6d2c4','#ac9081','#526878','#e0c99d','#a9b0ac','#b7c4c0'];const windowEntries=[[],[],[]],collisionBoxes=[];
const signage=['PALM CLUB','MOTEL','SUNSET','CAFÉ','MARKET','HOTEL','NOODLES','24 / 7','MARINA','MOTORS','SALON'];const signColors=['#f5b858','#e27c6d','#75cfc6','#f3e5b3','#e9a2c2'];
function makeSign(text,color){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle='#182a39';x.fillRect(0,0,512,128);x.fillStyle=color;x.fillRect(0,0,10,128);x.font='800 52px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,265,68,470);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide});}
function addBuilding(x,z,w,d,h,style){
 const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);const wall=mat(facades[style%facades.length],.83);addBox(group,boxGeo,wall,[0,h/2,0],[w,h,d],true,true);addBox(group,boxGeo,mat('#5a6162'),[0,.65,0],[w+.35,1.3,d+.35]);addBox(group,boxGeo,mat(style%2?'#e4d7bf':'#334956'),[0,h+.25,0],[w+.6,.5,d+.6],true,true);
 if(h>30){addBox(group,boxGeo,mat('#687478'),[w*.27,h+.85,-d*.13],[w*.32,1.15,d*.28],true,true);addBox(group,boxGeo,mat('#c5a974'),[-w*.22,h+.78,d*.18],[w*.22,.95,d*.25]);}
 const floors=Math.max(2,Math.floor((h-2.2)/3.3)),cols=Math.max(3,Math.floor(w/2.35));
 for(let f=0;f<floors;f++){const y=2.15+f*3.3;if(y>h-1.6)continue;for(let c=0;c<cols;c++){const xx=-w/2+(c+.5)*w/cols;if(Math.random()<.09)continue;const wi=Math.min(1.15,w/cols*.62);windowEntries[Math.random()<.25?1:style%3].push({x:x+xx,y,z:z-d/2-.055,rot:Math.PI,scale:[wi,1.5,.1],color:Math.random()<.18?'#f7bd78':null});windowEntries[style%3].push({x:x+xx,y,z:z+d/2+.055,rot:0,scale:[wi,1.5,.1],color:null});}const sideCols=Math.max(2,Math.floor(d/2.7));for(let c=0;c<sideCols;c++){const zz=-d/2+(c+.5)*d/sideCols,wi=Math.min(1.1,d/sideCols*.62);windowEntries[style%3].push({x:x-w/2-.055,y,z:z+zz,rot:-Math.PI/2,scale:[wi,1.45,.1],color:null});windowEntries[(style+1)%3].push({x:x+w/2+.055,y,z:z+zz,rot:Math.PI/2,scale:[wi,1.45,.1],color:null});}addBox(group,boxGeo,mat(style%2?'#d8c8ad':'#d3d9d4'),[0,y+1.5,-d/2-.09],[w,.1,.12]);}
 addBox(group,boxGeo,mat('#183341',.23,.25),[0,2.1,-d/2-.07],[w*.76,2.5,.13]);const count=Math.max(3,Math.floor(w/3));for(let c=0;c<count;c++){const xx=-w*.36+(c+.5)*(w*.72/count);addBox(group,boxGeo,mat(c%2?'#43606a':'#779297',.24,.15),[xx,2.08,-d/2-.15],[.06,2.26,.035]);}addBox(group,boxGeo,mat('#263944'),[0,3.65,-d/2-.16],[w*.9,.17,.48]);const sign=new THREE.Mesh(new THREE.PlaneGeometry(w*.84,.55),makeSign(signage[Math.floor(Math.random()*signage.length)],signColors[Math.floor(Math.random()*signColors.length)]));sign.position.set(0,3.68,-d/2-.42);sign.rotation.y=Math.PI;group.add(sign);if(h<27)for(let side of [-1,1])addBox(group,boxGeo,mat('#6a6b63'),[side*(w/2-.18),h+.75,0],[.12,.62,d]);if(Math.random()<.65)for(let i=0;i<2;i++)addBox(group,boxGeo,mat('#70766f'),[(Math.random()-.5)*w,h+.78,(Math.random()-.5)*d],[1.3,.9,1.2]);collisionBoxes.push({x,z,w:w+.8,d:d+.8});}
for(let ix=0;ix<6;ix++)for(let iz=0;iz<6;iz++){const bx=-170+ix*68,bz=-170+iz*68,count=(ix>=2&&ix<=3&&iz>=2&&iz<=3)?2:1+(Math.random()<.48?1:0);for(let j=0;j<count;j++){const w=count===1?25+Math.random()*13:14+Math.random()*10,d=count===1?23+Math.random()*13:15+Math.random()*11,x=bx+(count===1?0:(j===0?-14:14)),z=bz+(count===1?0:(j===0?8:-8)),urban=Math.abs(bx)<105&&Math.abs(bz)<105;let h=urban?26+Math.random()*56:11+Math.random()*26;if(bx===-34&&bz===-34&&j===0)h=76;addBuilding(x,z,w,d,h,Math.floor(Math.random()*facades.length));}}
for(let k=0;k<3;k++){const list=windowEntries[k],inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),glassMaterials[k],list.length),dummy=new THREE.Object3D();list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(0,v.rot,0);dummy.scale.set(...v.scale);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);if(v.color)inst.setColorAt(i,new THREE.Color(v.color));});inst.instanceMatrix.needsUpdate=true;inst.receiveShadow=true;scene.add(inst);}

// Sunset atmosphere: a hand-shaded sky dome and distant sea soften the skyline.
scene.background=null;
const sky=new THREE.Mesh(new THREE.SphereGeometry(850,32,20),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{sunDir:{value:new THREE.Vector3(-.72,.38,-.58).normalize()}},vertexShader:`varying vec3 vDir; void main(){vec4 w=modelMatrix*vec4(position,1.0);vDir=normalize(w.xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`varying vec3 vDir;uniform vec3 sunDir;void main(){float h=clamp(vDir.y*.5+.5,0.0,1.0);vec3 horizon=vec3(.94,.63,.49);vec3 middle=vec3(.63,.76,.82);vec3 zenith=vec3(.22,.37,.52);vec3 col=mix(horizon,middle,smoothstep(.02,.48,h));col=mix(col,zenith,smoothstep(.48,.96,h));float sun=pow(max(dot(normalize(vDir),sunDir),0.0),350.0);float halo=pow(max(dot(normalize(vDir),sunDir),0.0),10.0);col+=vec3(1.0,.62,.34)*(sun*.85+halo*.15);gl_FragColor=vec4(col,1.0);}` }));sky.renderOrder=-1000;scene.add(sky);

const palmTrunk=mat('#75614b'), palmLeaf=mat('#426b5a'), palmLight=mat('#668260'), lampMetal=mat('#293944',.38,.65), lampGlow=new THREE.MeshBasicMaterial({color:'#ffe5ae'});
function addPalm(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.17,.34,7.3,9),palmTrunk);trunk.position.y=3.65;trunk.castShadow=true;g.add(trunk);
 for(let f=0;f<8;f++){const a=f*Math.PI/4;const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,9,7),f%2?palmLeaf:palmLight);leaf.position.set(Math.sin(a)*2.1,7.1-Math.random()*.35,Math.cos(a)*2.1);leaf.scale.set(.55,.18,2.4);leaf.rotation.y=a;leaf.rotation.z=Math.cos(a)*-.28;leaf.castShadow=true;g.add(leaf);}
 const crown=new THREE.Mesh(sphereGeo,palmLight);crown.position.y=7.15;crown.scale.set(.48,.35,.48);g.add(crown);return g;}
function addLamp(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.14,6.4,8),lampMetal);pole.position.y=3.2;pole.castShadow=true;g.add(pole);
 const arm=addBox(g,boxGeo,lampMetal,[.65,6.23,0],[1.35,.1,.12],true,false);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.23,10,8),lampGlow);bulb.position.set(1.25,6.08,0);g.add(bulb);
 const glow=new THREE.PointLight('#ffd29a',1.3,13,2);glow.position.set(1.25,5.9,0);g.add(glow);
}
for(let r of roadCoords){for(let q=-204;q<=204;q+=34){if(Math.abs(r)<1&&Math.abs(q)<1)continue;addPalm(r+10.5,q, .8+Math.random()*.3);if(Math.random()<.22)addLamp(r-10,q,Math.PI/2);addPalm(q,r-10.5,.75+Math.random()*.25);if(Math.random()<.2)addLamp(q,r+10,0);}}
// Pocket parks inside the quieter blocks, with tiled paths and miniature shade trees.
for(const [x,z] of [[-170,-102],[102,-170],[-102,170],[170,102]]){
 addBox(scene,boxGeo,mat('#647965'),[x,.1,z],[28,.18,26]);
 for(let a=-1;a<=1;a+=2)for(let b=-1;b<=1;b+=2)addPalm(x+a*8,z+b*7,.7);
 for(let j=-1;j<=1;j++){addBox(scene,boxGeo,mat('#c6bda8'),[x+j*5,.205,z],[.45,.04,21]);}
}

const tireMat=mat('#171d22',.85), rimMat=mat('#9aa3a3',.35,.65), bodyColors=['#ce5547','#e8bd72','#2e8290','#d9d4c6','#4e6378','#b7d1ca','#a85761','#263849'];
function makeCar(color='#cf624d',name='COUPE'){
 const car=new THREE.Group();car.userData={speed:0,turn:0,active:false};
 const paint=new THREE.MeshStandardMaterial({color,roughness:.27,metalness:.55});
 addBox(car,boxGeo,paint,[0,.78,0],[1.88,.62,4.35],true,true);
 addBox(car,boxGeo,paint,[0,1.19,-.08],[1.58,.65,2.35],true,true);
 const windowMat=new THREE.MeshStandardMaterial({color:'#294755',roughness:.19,metalness:.4,transparent:true,opacity:.88});
 addBox(car,boxGeo,windowMat,[0,1.51,-.08],[1.48,.46,2.12],false,true);
 addBox(car,boxGeo,mat(color,.28,.5),[0,1.23,-1.2],[1.66,.08,.08]);
 addBox(car,boxGeo,mat(color,.28,.5),[0,1.23,1.02],[1.66,.08,.08]);
 addBox(car,boxGeo,mat('#e9e3ce',.23,.2),[0,.62,-2.16],[1.35,.16,.08]);
 addBox(car,boxGeo,mat('#962f35',.3,.12),[0,.84,2.19],[1.4,.2,.08]);
 const head=new THREE.MeshStandardMaterial({color:'#fff1c8',emissive:'#ffe4a3',emissiveIntensity:1.6});
 for(const x of [-.65,.65]){addBox(car,boxGeo,head,[x,.94,-2.2],[.35,.2,.08]);addBox(car,boxGeo,mat('#cb3335'),[x,.93,2.2],[.3,.15,.08]);}
 const wheels=[];for(const x of [-.98,.98])for(const z of [-1.4,1.4]){
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.24,16),tireMat);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.43,z);wheel.castShadow=true;car.add(wheel);wheels.push(wheel);
  const rim=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.255,12),rimMat);rim.rotation.z=Math.PI/2;rim.position.set(x*1.01,.43,z);car.add(rim);
 }
 car.userData.wheels=wheels;car.userData.name=name;return car;
}
const mainCar=makeCar('#cb574a','COUPE');mainCar.position.set(3.2,0,11.8);mainCar.rotation.y=0;scene.add(mainCar);
const parkedCars=[];
for(let i=0;i<11;i++){
 const c=makeCar(bodyColors[i%bodyColors.length]);const axis=i%2;const street=roadCoords[(i*3+1)%roadCoords.length],q=-178+(i*37)%360;
 if(axis===0){c.position.set(street+(i%3===0?4:-4),0,q);c.rotation.y=0;}else{c.position.set(q,0,street+(i%3===0?-4:4));c.rotation.y=Math.PI/2;}
 c.userData.parked=true;scene.add(c);parkedCars.push(c);
}
// Soft ambient city traffic, looping slowly along the avenues.
const traffic=[];
for(let i=0;i<7;i++){
 const c=makeCar(bodyColors[(i+3)%bodyColors.length]);c.userData.traffic=true;c.userData.axis=i%2;c.userData.lane=i%2?3.7:-3.7;c.userData.road=roadCoords[(i*2+2)%roadCoords.length];c.userData.offset=-190+i*59;
 if(c.userData.axis===0){c.position.set(c.userData.road+c.userData.lane,0,c.userData.offset);c.rotation.y=0;}else{c.position.set(c.userData.offset,0,c.userData.road+c.userData.lane);c.rotation.y=Math.PI/2;}
 scene.add(c);traffic.push(c);
}

// A compact anime-inspired courier avatar made from shaded, shadow-casting geometry.
const player=new THREE.Group();player.position.set(1.2,0,8.5);scene.add(player);
const skin=mat('#e7aa85'), jacket=mat('#c84945'), darkCloth=mat('#243547'), pants=mat('#283d50'), shoe=mat('#efe0bf'), hair=mat('#202633');
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.37,.68,5,10),jacket);torso.position.y=1.28;torso.castShadow=true;player.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.29,16,14),skin);head.position.set(0,2.05,0);head.castShadow=true;player.add(head);
const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.3,14,10,0,Math.PI*2,0,Math.PI*.52),hair);hairCap.position.set(0,2.13,-.035);hairCap.castShadow=true;player.add(hairCap);
const fringe=addBox(player,boxGeo,hair,[0,2.1,-.245],[.44,.19,.14],true,false);
const armGeo=new THREE.CapsuleGeometry(.12,.57,4,8), legGeo=new THREE.CapsuleGeometry(.14,.66,4,8);
const arms=[],legs=[];
for(let s of [-1,1]){
 const arm=new THREE.Mesh(armGeo,jacket);arm.position.set(s*.48,1.35,0);arm.rotation.z=s*-.16;arm.castShadow=true;player.add(arm);arms.push(arm);
 const leg=new THREE.Mesh(legGeo,pants);leg.position.set(s*.19,.52,0);leg.castShadow=true;player.add(leg);legs.push(leg);
 const foot=addBox(player,boxGeo,shoe,[s*.19,.12,-.1],[.3,.17,.48],true,false);
}
const satchel=addBox(player,boxGeo,mat('#d6a64e'),[.39,1.25,.18],[.2,.38,.38],true,false);satchel.rotation.z=-.12;

// Mission marker: rotating gold rings, animated beams and a gentle ground pulse.
const targets=[new THREE.Vector3(136,0,-136),new THREE.Vector3(-136,0,68),new THREE.Vector3(0,0,204)];let targetIndex=0,completed=0,cash=2450;
const marker=new THREE.Group();scene.add(marker);
const goldMat=new THREE.MeshBasicMaterial({color:'#ffc46c',transparent:true,opacity:.8,side:THREE.DoubleSide});
const ring=new THREE.Mesh(new THREE.TorusGeometry(2.6,.12,8,48),goldMat);ring.position.y=1.2;marker.add(ring);
const ring2=new THREE.Mesh(new THREE.TorusGeometry(1.8,.07,8,40),new THREE.MeshBasicMaterial({color:'#fff0c8',transparent:true,opacity:.66}));ring2.rotation.x=Math.PI/2;ring2.position.y=.12;marker.add(ring2);
const beamMat=new THREE.MeshBasicMaterial({color:'#ffbd62',transparent:true,opacity:.14,depthWrite:false});const beam=new THREE.Mesh(new THREE.CylinderGeometry(.08,1.35,24,20,1,true),beamMat);beam.position.y=12;marker.add(beam);
const beacon=new THREE.PointLight('#ffc16a',8,22,2);beacon.position.y=4;marker.add(beacon);
function setTarget(){marker.position.set(targets[targetIndex].x,0,targets[targetIndex].z);}
setTarget();

let inCar=false, cameraYaw=0, cameraPitch=.12, cameraDistance=10.5, speedValue=0, walkPhase=0;
const keys={};
window.addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='KeyE'&&!e.repeat)interact();});
window.addEventListener('keyup',e=>keys[e.code]=false);
let dragging=false,lastX=0,lastY=0;
renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;cameraYaw-=(e.clientX-lastX)*.0042;cameraPitch=THREE.MathUtils.clamp(cameraPitch+(e.clientY-lastY)*.0024,-.14,.42);lastX=e.clientX;lastY=e.clientY;});
renderer.domElement.addEventListener('pointerup',()=>dragging=false);renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
window.addEventListener('wheel',e=>{cameraDistance=THREE.MathUtils.clamp(cameraDistance+e.deltaY*.008,5,17);},{passive:true});
function interact(){
 if(inCar){inCar=false;player.visible=true;player.position.set(mainCar.position.x+2.4,0,mainCar.position.z+1);mainCar.userData.speed=0;return;}
 if(player.position.distanceTo(mainCar.position)<5.4){inCar=true;player.visible=false;mainCar.userData.speed=0;return;}
}
function blocked(x,z,r=.75){for(const b of collisionBoxes)if(Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r)return true;return false;}
const minimap=document.querySelector('#minimap'),mapCtx=minimap.getContext('2d');
function updateMap(){const w=minimap.width,h=minimap.height,px=inCar?mainCar.position.x:player.position.x,pz=inCar?mainCar.position.z:player.position.z,range=115,scale=w/(range*2);mapCtx.clearRect(0,0,w,h);mapCtx.fillStyle='#192d39';mapCtx.fillRect(0,0,w,h);
 mapCtx.fillStyle='#263943';for(let r of roadCoords){let x=w/2+(r-px)*scale,z=h/2+(r-pz)*scale;mapCtx.fillRect(x-7*scale,z-range*scale,14*scale,h);mapCtx.fillRect(x-range*scale,z-7*scale,w,14*scale);}
 mapCtx.strokeStyle='rgba(225,206,171,.6)';mapCtx.lineWidth=1;for(let r of roadCoords){let x=w/2+(r-px)*scale,z=h/2+(r-pz)*scale;mapCtx.beginPath();mapCtx.moveTo(x,0);mapCtx.lineTo(x,h);mapCtx.stroke();mapCtx.beginPath();mapCtx.moveTo(0,z);mapCtx.lineTo(w,z);mapCtx.stroke();}
 mapCtx.fillStyle='#b9a17c';for(const b of collisionBoxes){const x=w/2+(b.x-px)*scale,z=h/2+(b.z-pz)*scale,bw=b.w*scale,bh=b.d*scale;if(x>-10&&x<w+10&&z>-10&&z<h+10)mapCtx.fillRect(x-bw/2,z-bh/2,bw,bh);}
 const tx=w/2+(marker.position.x-px)*scale,tz=h/2+(marker.position.z-pz)*scale;mapCtx.fillStyle='#ffc36c';mapCtx.shadowColor='#ffc36c';mapCtx.shadowBlur=8;mapCtx.beginPath();mapCtx.arc(tx,tz,3.8,0,Math.PI*2);mapCtx.fill();mapCtx.shadowBlur=0;
 mapCtx.save();mapCtx.translate(w/2,h/2);mapCtx.rotate(inCar?mainCar.rotation.y:player.rotation.y);mapCtx.fillStyle='#f7f3e7';mapCtx.beginPath();mapCtx.moveTo(0,-7);mapCtx.lineTo(5,5);mapCtx.lineTo(0,3);mapCtx.lineTo(-5,5);mapCtx.closePath();mapCtx.fill();mapCtx.restore();
}
const prompt=document.querySelector('#prompt');const clockEl=document.querySelector('#clock');let elapsed=0,frame=0;
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.04,(now-(animate.last||now))/1000);animate.last=now;elapsed+=dt;frame++;
 const forward=keys.KeyW||keys.ArrowUp,back=keys.KeyS||keys.ArrowDown,left=keys.KeyA||keys.ArrowLeft,right=keys.KeyD||keys.ArrowRight,sprint=keys.ShiftLeft||keys.ShiftRight;
 if(inCar){const car=mainCar;let v=car.userData.speed;if(forward)v=Math.min(34,v+24*dt);else if(back)v=Math.max(-11,v-20*dt);else v*=Math.pow(.965,dt*60);
  const steer=(right?1:0)-(left?1:0);if(Math.abs(v)>.2)car.rotation.y+=steer*dt*(.68+Math.min(Math.abs(v)/16,.9))*Math.sign(v);
  const nx=car.position.x-Math.sin(car.rotation.y)*v*dt,nz=car.position.z-Math.cos(car.rotation.y)*v*dt;
  if(!blocked(nx,nz,1.3)){car.position.x=nx;car.position.z=nz;}else v*=.15;car.userData.speed=v;
  for(const wheel of car.userData.wheels)wheel.rotation.x+=v*dt*1.8;
  speedValue=Math.abs(v)*2.1;document.querySelector('#speed').textContent=String(Math.round(speedValue)).padStart(2,'0');
 }else{
  let dx=(right?1:0)-(left?1:0),dz=(back?1:0)-(forward?1:0);const len=Math.hypot(dx,dz);
  if(len){dx/=len;dz/=len;const wx=dx*Math.cos(cameraYaw)+dz*Math.sin(cameraYaw),wz=-dx*Math.sin(cameraYaw)+dz*Math.cos(cameraYaw);const amount=(sprint?8.7:5.25)*dt;
   const nx=player.position.x+wx*amount,nz=player.position.z+wz*amount;if(!blocked(nx,nz)){player.position.x=nx;player.position.z=nz;}
   player.rotation.y=Math.atan2(-wx,-wz);walkPhase+=dt*(sprint?13:9);legs.forEach((l,i)=>l.rotation.x=Math.sin(walkPhase+i*Math.PI)*.52);arms.forEach((a,i)=>a.rotation.x=Math.sin(walkPhase+i*Math.PI+Math.PI)*.34);
  }else{legs.forEach(l=>l.rotation.x*=.8);arms.forEach(a=>a.rotation.x*=.8);}
  speedValue=0;document.querySelector('#speed').textContent='00';
 }
 // Loop traffic along clean, predictable avenue lanes.
 for(const c of traffic){c.userData.offset+=dt*6.2;if(c.userData.offset>210)c.userData.offset=-210;if(c.userData.axis===0)c.position.z=c.userData.offset;else c.position.x=c.userData.offset;}
 const focus=inCar?mainCar.position:player.position;const desired=new THREE.Vector3(focus.x+Math.sin(cameraYaw)*cameraDistance,focus.y+4.4+cameraPitch*8,focus.z+Math.cos(cameraYaw)*cameraDistance);
 camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(focus.x,focus.y+(inCar?1.05:1.25),focus.z);
 ring.rotation.y=elapsed*.55;ring2.rotation.z=-elapsed*.8;beam.material.opacity=.1+.045*Math.sin(elapsed*2.7);marker.scale.setScalar(1+Math.sin(elapsed*2)*.035);
 const near=!inCar&&player.position.distanceTo(mainCar.position)<5.4;prompt.classList.toggle('visible',near);if(inCar)prompt.classList.remove('visible');
 if(focus.distanceTo(marker.position)<6){targetIndex=(targetIndex+1)%targets.length;completed++;cash+=500;document.querySelector('#cash').textContent=cash.toLocaleString();document.querySelector('#objective').textContent=completed%3===0?'Reach the next gold marker':'Reach the gold marker';document.querySelector('#mission-copy').innerHTML=completed%3===0?'Another night, another run.<br>Keep moving through <strong>Vice Harbor</strong>.':'Cut through the afterglow.<br>Find the <strong>gold marker</strong> downtown.';setTarget();const toast=document.querySelector('#toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2300);}
 if(frame%5===0)updateMap();
 const minute=Math.floor(elapsed*1.5);const timeMinutes=(18*60+42+minute)%1440;clockEl.textContent=`${String(Math.floor(timeMinutes/60)).padStart(2,'0')}:${String(timeMinutes%60).padStart(2,'0')}`;
 document.querySelector('#street').textContent=Math.abs(focus.x)<32?'PALM AVENUE':Math.abs(focus.z)<32?'OCEAN DRIVE':focus.z<0?'SUNSET BOULEVARD':'MARINA DISTRICT';document.querySelector('#district').textContent=focus.x>80?'MARINA DISTRICT':focus.x< -80?'OLD TOWN':focus.z< -80?'SUNSET HEIGHTS':'PALM AVENUE';
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));});
