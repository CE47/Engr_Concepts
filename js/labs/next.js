import { clamp, setRangeProgress, setupCanvas } from "./util.js";

// A guided second pass: each mission adds one useful idea to the first eight.
const lessons = [
  { id:"momentum", title:"Momentum Mixer", icon:"🛹", accent:"#ff8fab", section:"Motion & energy", tags:["Momentum","Mass"], mission:"Tune mass and push to stop at the 4.5 m marker.", hint:"The same push accelerates a lighter cart more. Try changing one control at a time.", a:"Cart mass", b:"Push", kind:"cart", ideal:58 },
  { id:"gravity", title:"Gravity Drop", icon:"🍎", accent:"#ffd166", section:"Motion & energy", tags:["Gravity","Falling"], mission:"Drop the capsule into the landing pad.", hint:"Gravity pulls the capsule down. Air drag slows it, so try more gravity or less drag.", a:"Gravity", b:"Air drag", kind:"drop", ideal:64 },
  { id:"gear-ratio", title:"Gear Train", icon:"⚙️", accent:"#5ee7ff", section:"Motion & energy", tags:["Gears","Speed"], mission:"Choose gears that spin the fan fast enough.", hint:"A small driving gear turns a large gear slowly, with more turning force.", a:"Driver gear", b:"Driven gear", kind:"gears", ideal:43 },
  { id:"sound-waves", title:"Sound Wave Studio", icon:"🔊", accent:"#c4a1ff", section:"Motion & energy", tags:["Waves","Vibration"], mission:"Tune the wave until it matches the listener.", hint:"Faster vibrations make a higher pitch; bigger vibrations make a louder sound.", a:"Pitch", b:"Vibration", kind:"sound", ideal:72 },
  { id:"arches", title:"Arch Builder", icon:"🏛️", accent:"#ffd166", section:"Structures & materials", tags:["Arches","Compression"], mission:"Shape a low arch with wide supports to hold the golden block.", hint:"An arch sends a load outward along its curve. Wider supports help catch that push.", a:"Arch height", b:"Support width", kind:"arch", ideal:59 },
  { id:"tower-wind", title:"Windproof Tower", icon:"🏙️", accent:"#5ee7ff", section:"Structures & materials", tags:["Stability","Wind"], mission:"Keep the tower upright when the wind blows.", hint:"A wider base and a lower center of mass help resist tipping. Try a shorter tower or a wider base.", a:"Tower height", b:"Base width", kind:"tower", ideal:48 },
  { id:"thermal", title:"Heat & Expand", icon:"🌡️", accent:"#ff9f6e", section:"Structures & materials", tags:["Heat","Expansion"], mission:"Set an expansion gap so the heated bridge does not buckle.", hint:"Steel expands as it warms. The expansion joint needs enough room for the bridge to grow.", a:"Temperature", b:"Gap size", kind:"bridge", ideal:55 },
  { id:"material-match", title:"Material Match", icon:"🧰", accent:"#7bf1a8", section:"Structures & materials", tags:["Properties","Design"], mission:"Choose a light beam strong enough to carry the blocks.", hint:"Strong materials bend less, while heavier beams add more load to the structure.", a:"Strength", b:"Weight", kind:"beam", ideal:66 },
  { id:"density", title:"Density Diver", icon:"🫧", accent:"#5ee7ff", section:"Fluids & water", tags:["Density","Floating"], mission:"Tune the object to hover midway in the water.", hint:"If an object is less dense than water it rises; if more dense it sinks. Matching densities creates neutral buoyancy.", a:"Object density", b:"Water density", kind:"float", ideal:52 },
  { id:"water-pressure", title:"Deep Sea Pressure", icon:"🐠", accent:"#8ee7ff", section:"Fluids & water", tags:["Pressure","Depth"], mission:"Choose a depth your submarine hull can withstand.", hint:"Water pressure rises by about 1 atmosphere for every 10 m of depth. A stronger hull can dive deeper.", a:"Dive depth", b:"Hull strength", kind:"sub", ideal:61 },
  { id:"water-wheel", title:"Water Wheel Power", icon:"🌊", accent:"#7bf1a8", section:"Fluids & water", tags:["Energy","Flow"], mission:"Aim a fast stream to spin the wheel and light the lamp.", hint:"Faster water carries more energy. Aim the stream at the paddles so the wheel can catch it.", a:"Flow speed", b:"Aim", kind:"wheel", ideal:57 },
  { id:"series-parallel", title:"Series or Parallel?", icon:"💡", accent:"#ffd166", section:"Electricity & signals", tags:["Circuits","Parallel"], mission:"Compare 1 path and 2 paths. After A is removed, keep B lit.", hint:"Try 1 · Series, then 2 · Parallel. Press REMOVE BULB A and watch whether bulb B stays lit.", a:"Branches", b:"Battery", kind:"bulbs", ideal:68 },
  { id:"electromagnet", title:"Electromagnet Lift", icon:"🧲", accent:"#ff8fab", section:"Electricity & signals", tags:["Magnetism","Coils"], mission:"Use the coil to lift all three iron clips.", hint:"More turns of wire and more current make a stronger magnetic field. Watch how many iron clips it can lift.", a:"Coil turns", b:"Current", kind:"magnet", ideal:63 },
  { id:"solar", title:"Solar Tracker", icon:"☀️", accent:"#ffd166", section:"Electricity & signals", tags:["Solar","Light"], mission:"Aim the panel at the sun and charge the rover above 65%.", hint:"Set panel tilt near 45° and reduce clouds. Panels make the most power when sunlight hits them directly.", a:"Panel tilt", b:"Cloud cover", kind:"solar", ideal:46 },
  { id:"signals", title:"Signal Relay", icon:"📡", accent:"#c4a1ff", section:"Electricity & signals", tags:["Signals","Networks"], mission:"Raise the relay above the hill and deliver the message.", hint:"Raise Relay height to at least 6.8 m, then set Signal power to at least 65%. The relay needs a clear view of both stations.", a:"Signal power", b:"Relay height", kind:"relay", ideal:54 },
  { id:"sensor", title:"Smart Greenhouse", icon:"🌱", accent:"#7bf1a8", section:"Systems & design", tags:["Sensors","Automation"], mission:"Set the sensor to water dry soil enough to revive the plant.", hint:"The soil is 70% dry. Trigger watering at 70% or lower, then apply at least 56% water.", a:"Dryness trigger", b:"Water amount", kind:"plant", ideal:60 },
  { id:"feedback", title:"Steady Robot", icon:"🤖", accent:"#5ee7ff", section:"Systems & design", tags:["Feedback","Control"], mission:"Use strong, fast corrections to keep the robot balanced.", hint:"The robot measures its tilt and corrects it. Strong corrections help; delays can make it wobble.", a:"Correction strength", b:"Delay", kind:"robot", ideal:51 },
];

function makeArt(lesson) {
  return `<svg viewBox="0 0 320 160" aria-hidden="true"><defs><linearGradient id="g-${lesson.id}" x2="0" y2="1"><stop stop-color="#18385c"/><stop offset="1" stop-color="#091a30"/></linearGradient></defs><rect width="320" height="160" rx="18" fill="url(#g-${lesson.id})"/><circle cx="257" cy="36" r="22" fill="${lesson.accent}" opacity=".23"/><path d="M0 127h320v33H0z" fill="#0b2639"/><path d="M0 127h320" stroke="${lesson.accent}" opacity=".45"/><circle cx="160" cy="82" r="38" fill="${lesson.accent}" opacity=".1"/><text x="160" y="99" text-anchor="middle" font-size="56">${lesson.icon}</text><path d="M28 44h40M252 105h40" stroke="${lesson.accent}" stroke-width="2" stroke-dasharray="5 7" opacity=".65"/><g fill="#ffd166"><circle cx="42" cy="92" r="2"/><circle cx="85" cy="30" r="2"/><circle cx="225" cy="64" r="2"/></g></svg>`;
}

function drawScene(ctx, w, h, lesson, value, motion, controlA = value * 100, controlB = value * 100) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#14385a"); bg.addColorStop(1, "#07182b");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // Blueprint dots and a softly animated halo keep the scene lively without hiding the experiment.
  ctx.strokeStyle = "rgba(142,231,255,.07)"; ctx.lineWidth = 1;
  for (let x=0; x<w; x+=32) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for (let y=0; y<h; y+=32) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  const ground = h*.76;
  ctx.fillStyle = "rgba(94,231,255,.12)"; ctx.fillRect(0,ground,w,h-ground);
  ctx.strokeStyle = "rgba(94,231,255,.45)"; ctx.beginPath(); ctx.moveTo(0,ground); ctx.lineTo(w,ground); ctx.stroke();
  if (lesson.kind === "arch") {
    drawArchScene(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.kind === "tower") {
    drawTowerScene(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.kind === "bridge") {
    drawThermalBridge(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.id === "density") {
    drawDensityTank(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.id === "water-pressure") {
    drawPressureTank(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.id === "water-wheel") {
    drawWaterWheel(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.id === "series-parallel") {
    drawCircuitTest(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.id === "electromagnet") {
    drawElectromagnet(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.id === "solar") {
    drawSolarScene(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.id === "signals") {
    drawSignalRelay(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.id === "sensor") {
    drawGreenhouse(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.id === "feedback") {
    drawSteadyRobot(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  if (lesson.id === "material-match") {
    drawMaterialBeam(ctx,w,h,lesson,controlA,controlB,motion);
    return;
  }
  // A light schematic behind the moving test object ties each scene to its topic.
  ctx.save(); ctx.globalAlpha=.38; ctx.strokeStyle=lesson.accent; ctx.lineWidth=Math.max(3,w*.008); ctx.lineCap="round";
  const cx=w*.5, cy=h*.48, r=Math.min(w,h)*.12;
  if (["gears","wheel"].includes(lesson.kind)) {
    [r*.72,r*.48].forEach((size,i)=>{const gx=cx+(i?size*1.4:-size*.45);ctx.beginPath();ctx.arc(gx,cy,size,performance.now()/1400,Math.PI*2+performance.now()/1400);ctx.stroke();ctx.beginPath();ctx.arc(gx,cy,size*.18,0,Math.PI*2);ctx.stroke();});
  } else if (lesson.kind==="sound") {
    ctx.beginPath();for(let px=0;px<70;px++){const py=cy+Math.sin(px/70*Math.PI*8+performance.now()/260)*r*.55;px?ctx.lineTo(cx-35+px,py):ctx.moveTo(cx-35+px,py);}ctx.stroke();
  } else if (lesson.kind==="arch") {
    ctx.beginPath();ctx.moveTo(cx-r,ground);ctx.quadraticCurveTo(cx,cy-r,cx+r,ground);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-r*1.15,ground);ctx.lineTo(cx+r*1.15,ground);ctx.stroke();
  } else if (["tower","bridge","beam"].includes(lesson.kind)) {
    ctx.strokeRect(cx-r*.6,cy-r*.7,r*1.2,r*1.7);ctx.beginPath();ctx.moveTo(cx-r*.6,cy+r*.15);ctx.lineTo(cx+r*.6,cy-r*.35);ctx.moveTo(cx+r*.6,cy+r*.15);ctx.lineTo(cx-r*.6,cy-r*.35);ctx.stroke();
  } else if (["bulbs","magnet","solar","relay","plant"].includes(lesson.kind)) {
    ctx.beginPath();ctx.moveTo(cx-r*1.5,cy+r*.55);ctx.lineTo(cx-r*1.5,cy-r*.45);ctx.lineTo(cx+r*1.5,cy-r*.45);ctx.lineTo(cx+r*1.5,cy+r*.55);ctx.stroke();
    ctx.beginPath();ctx.arc(cx-r*.75,cy-r*.45,r*.24,Math.PI,Math.PI*2);ctx.arc(cx+r*.75,cy-r*.45,r*.24,Math.PI,Math.PI*2);ctx.stroke();
  } else if (["float","sub","drop"].includes(lesson.kind)) {
    ctx.beginPath();ctx.moveTo(cx-r,cy);ctx.bezierCurveTo(cx-r*.5,cy-r*.12,cx+r*.2,cy+r*.12,cx+r,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx-r,cy+r*.3);ctx.bezierCurveTo(cx-r*.4,cy+r*.17,cx+r*.4,cy+r*.43,cx+r,cy+r*.3);ctx.stroke();
  } else if (["cart","robot"].includes(lesson.kind)) {
    ctx.beginPath();ctx.moveTo(cx-r*1.4,cy+r*.6);ctx.lineTo(cx+r*1.4,cy+r*.6);ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,r*.65,performance.now()/1200,Math.PI*1.7+performance.now()/1200);ctx.stroke();
  }
  ctx.restore();
  const idealX = lesson.kind === "drop" ? w*.5 : w*.82;
  ctx.setLineDash([7,7]); ctx.strokeStyle = "rgba(255,209,102,.6)"; ctx.beginPath(); ctx.moveTo(idealX,ground-32); ctx.lineTo(idealX,ground+12); ctx.stroke(); ctx.setLineDash([]);
  if (lesson.kind === "drop") {
    ctx.fillStyle="rgba(255,209,102,.24)"; ctx.fillRect(idealX-w*.085,ground-8,w*.17,12);
    ctx.strokeStyle="#ffd166"; ctx.lineWidth=3; ctx.strokeRect(idealX-w*.085,ground-8,w*.17,12);
    ctx.fillStyle="#ffe8a5"; ctx.font=`bold ${Math.max(11,w*.025)}px sans-serif`; ctx.textAlign="center"; ctx.fillText("LANDING PAD",idealX,ground+25);
  } else {
    ctx.fillStyle = "#ffd166"; ctx.font = `bold ${Math.max(14,w*.035)}px sans-serif`; ctx.textAlign="center"; ctx.fillText("★",idealX,ground-43);
  }
  if (lesson.id === "momentum") {
    ctx.font=`bold ${Math.max(11,w*.025)}px sans-serif`; ctx.fillStyle="#ffe8a5"; ctx.fillText("4.5 m",idealX,ground-22);
  }
  const size=Math.max(18,w*.045);
  const x = lesson.kind === "drop" ? w*.5 : motion ? w*.18 + (w*.64)*motion : w*(.2 + .53*value/100);
  const y = lesson.kind === "drop"
    ? h*.2 + (ground-size-2-h*.2)*motion
    : lesson.kind === "float" ? h*(.3 + .36*(motion || value/100)) : ground-27;
  const bob = Math.sin(performance.now()/500)*4;
  ctx.shadowColor=lesson.accent; ctx.shadowBlur=22; ctx.fillStyle=lesson.accent;
  ctx.beginPath(); ctx.arc(x,y+bob,size,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
  ctx.font=`${Math.max(23,w*.055)}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(lesson.icon,x,y+bob+1);
  // Small animated sparks communicate energy and motion.
  for(let i=0;i<5;i++) { const a=performance.now()/900+i*1.25; ctx.fillStyle=i%2?"#8ee7ff":"#ffd166"; ctx.globalAlpha=.35+.35*Math.sin(a); ctx.beginPath(); ctx.arc(w*(.12+.76*((i*.21+performance.now()/12000)%1)),h*(.12+.4*(i%3)/3),2.5,0,Math.PI*2);ctx.fill(); }
  ctx.globalAlpha=1; ctx.textBaseline="alphabetic";
}

function drawArchScene(ctx,w,h,lesson,heightSetting,supportSetting,motion) {
  const ground=h*.76, baseY=ground-9, cx=w*.5;
  const span=w*(.30+.25*supportSetting/100), left=cx-span/2, right=cx+span/2;
  const rise=h*(.08+.21*heightSetting/100), crownY=baseY-rise;
  const thickness=Math.max(7,w*.022);
  // Stone foundations and broad feet make the support-width control visible.
  const foot=w*(.07+.10*supportSetting/100);
  ctx.fillStyle="#344e67"; ctx.fillRect(left-foot/2,baseY,foot,ground-baseY); ctx.fillRect(right-foot/2,baseY,foot,ground-baseY);
  ctx.fillStyle="#607e96"; ctx.fillRect(left-foot/2,baseY,foot,7); ctx.fillRect(right-foot/2,baseY,foot,7);
  // Draw a segmented stone arch; its rise follows the height slider.
  ctx.save();
  const wobble=motion>0 && motion<1 ? Math.sin(performance.now()/34)*(1-motion)*4 : 0;
  ctx.translate(0,wobble);
  ctx.beginPath();
  for(let i=0;i<=48;i++) {
    const t=i/48, x=left+(right-left)*t;
    const y=baseY-4*rise*t*(1-t);
    if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.strokeStyle="#8da7bd";ctx.lineWidth=thickness+5;ctx.lineCap="round";ctx.stroke();
  ctx.strokeStyle=lesson.accent;ctx.lineWidth=thickness;ctx.stroke();
  // Mortar joints reveal that the curved structure is made from blocks.
  ctx.strokeStyle="rgba(7,24,43,.75)";ctx.lineWidth=2;
  for(let i=1;i<9;i++) {
    const t=i/9, x=left+(right-left)*t, y=baseY-4*rise*t*(1-t);
    ctx.beginPath();ctx.moveTo(x,y-thickness*.44);ctx.lineTo(x,y+thickness*.44);ctx.stroke();
  }
  ctx.restore();
  // A load block sits on the crown; red arrows show the outward push at the feet.
  const block=Math.max(20,w*.055), loadY=crownY-block-3;
  ctx.fillStyle="#ff8fab";ctx.shadowColor="#ff8fab";ctx.shadowBlur=motion>=.92?18:5;
  ctx.fillRect(cx-block/2,loadY,block,block);ctx.shadowBlur=0;
  ctx.fillStyle="#fff0f4";ctx.font=`${Math.max(15,w*.035)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("★",cx,loadY+block/2);
  ctx.strokeStyle="#ff8fab";ctx.lineWidth=3;ctx.lineCap="round";
  [[left,1],[right,-1]].forEach(([x,direction])=>{
    const start=x+direction*5, end=x+direction*(foot*.75+12);
    ctx.beginPath();ctx.moveTo(start,baseY-3);ctx.lineTo(end,baseY-3);ctx.stroke();
    ctx.beginPath();ctx.moveTo(end,baseY-3);ctx.lineTo(end-direction*7,baseY-8);ctx.moveTo(end,baseY-3);ctx.lineTo(end-direction*7,baseY+2);ctx.stroke();
  });
  // Dimension callouts update in step with the controls.
  ctx.setLineDash([4,5]);ctx.strokeStyle="rgba(255,255,255,.5)";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(left,baseY+13);ctx.lineTo(right,baseY+13);ctx.stroke();
  ctx.beginPath();ctx.moveTo(right+12,baseY);ctx.lineTo(right+12,crownY);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle="#e8f5ff";ctx.font=`bold ${Math.max(11,w*.023)}px sans-serif`;
  ctx.textAlign="center";ctx.textBaseline="top";ctx.fillText(`SPAN ${Math.round(span/w*10)} m`,cx,baseY+17);
  ctx.save();ctx.translate(right+19,(baseY+crownY)/2);ctx.rotate(-Math.PI/2);ctx.textAlign="center";ctx.textBaseline="bottom";ctx.fillText(`RISE ${Math.round(rise/h*10)} m`,0,0);ctx.restore();
  ctx.fillStyle="#ffb5c5";ctx.textAlign="center";ctx.textBaseline="alphabetic";ctx.fillText(motion>=.92?"LOAD HELD":"LOAD TEST",cx,h*.13);
}

function drawTowerScene(ctx,w,h,lesson,heightSetting,baseSetting,motion) {
  const ground=h*.76, center=w*.54, height=h*(.22+.28*heightSetting/100);
  const baseWidth=w*(.15+.23*baseSetting/100), topWidth=baseWidth*.48;
  const stability=baseSetting*(1-.45*heightSetting/100);
  const held=stability>=72;
  // Gust lines animate across the scene while the tower's shape follows both sliders.
  ctx.save();ctx.strokeStyle="rgba(142,231,255,.65)";ctx.lineWidth=2;ctx.lineCap="round";
  for(let i=0;i<5;i++) {
    const y=h*(.2+i*.085), x=(performance.now()*.12+i*79)%(w*.53);
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+30+i*4,y-5);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+30+i*4,y-5);ctx.lineTo(x+22+i*4,y-10);ctx.moveTo(x+30+i*4,y-5);ctx.lineTo(x+23+i*4,y);ctx.stroke();
  }
  ctx.restore();
  const sway=motion>0 ? Math.sin(performance.now()/70)*.025*(motion) : 0;
  const failureLean=held?0:Math.min(.48,(1-stability/100)*.65)*Math.min(1,motion*2);
  const lean=failureLean+sway;
  ctx.save();ctx.translate(center,ground);ctx.rotate(lean);
  const halfBase=baseWidth/2, halfTop=topWidth/2;
  ctx.beginPath();ctx.moveTo(-halfBase,0);ctx.lineTo(-halfTop,-height);ctx.lineTo(halfTop,-height);ctx.lineTo(halfBase,0);ctx.closePath();
  ctx.fillStyle="#1c5270";ctx.fill();ctx.strokeStyle=lesson.accent;ctx.lineWidth=4;ctx.stroke();
  // Floor bands and bright windows make the changing height easy to compare.
  const floors=Math.max(2,Math.round(heightSetting/12)+2);
  for(let i=1;i<floors;i++) {
    const t=i/floors, y=-height+height*t, half=halfTop+(halfBase-halfTop)*t;
    ctx.strokeStyle="rgba(142,231,255,.45)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-half,y);ctx.lineTo(half,y);ctx.stroke();
    const winW=Math.max(5,Math.min(13,half*.24));
    [-1,1].forEach(side=>{ctx.fillStyle=i%2?"#9be8ff":"#ffd166";ctx.globalAlpha=.55;ctx.fillRect(side*half*.48-winW/2,y-height/floors*.68,winW,height/floors*.35);});
  }
  ctx.globalAlpha=1;
  ctx.fillStyle="#5c7890";ctx.fillRect(-halfBase-10,-5,baseWidth+20,9);
  ctx.restore();
  ctx.fillStyle=held?"#9fffc6":"#ffb5c5";ctx.font=`bold ${Math.max(12,w*.027)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText(motion<=0?"WIND TEST READY":motion>=.9?"TOWER HELD":"GUST TEST",center,h*.13);
  ctx.fillStyle="#d8efff";ctx.font=`bold ${Math.max(10,w*.021)}px sans-serif`;ctx.fillText(`BASE ${Math.round(baseWidth/w*10)} m`,center,ground+23);
}

function drawThermalBridge(ctx,w,h,lesson,temp,gapSetting,motion) {
  const ground=h*.76, supportLeft=w*.19, supportRight=w*.81, center=w*.5;
  const span=supportRight-supportLeft;
  const gapMM=gapSetting*.18;
  const expansionMM=temp*.144; // Steel: about 12 μm per metre per °C over a 12 m span.
  const remainingMM=gapMM-expansionMM;
  const pxPerMM=w*.006;
  const endGap=Math.max(0,remainingMM)*pxPerMM/2;
  const beamLeft=supportLeft+endGap, beamRight=supportRight-endGap;
  const deckY=ground-h*.17, buckle=Math.max(0,-remainingMM)*pxPerMM*.42;
  // Water and concrete abutments anchor the bridge in the scene.
  ctx.fillStyle="rgba(94,231,255,.13)";ctx.fillRect(0,ground,w,h-ground);
  for(let i=0;i<4;i++) {
    const yy=ground+12+i*12;ctx.strokeStyle="rgba(142,231,255,.28)";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,yy);ctx.quadraticCurveTo(w*.25,yy-4,w*.5,yy);ctx.quadraticCurveTo(w*.75,yy+4,w,yy);ctx.stroke();
  }
  [supportLeft,supportRight].forEach((x)=>{
    ctx.fillStyle="#526e84";ctx.fillRect(x-14,deckY+5,28,ground-deckY-5);
    ctx.fillStyle="#91a9bb";ctx.fillRect(x-25,ground-8,50,10);
    ctx.fillStyle="#91a9bb";ctx.fillRect(x-19,deckY,38,8);
  });
  // The deck lengthens as temperature rises. If the joint is too small it bows under compression.
  ctx.beginPath();ctx.moveTo(beamLeft,deckY);
  ctx.quadraticCurveTo(center,deckY-buckle*2,beamRight,deckY);
  ctx.lineTo(beamRight,deckY-15);ctx.quadraticCurveTo(center,deckY-15-buckle*2,beamLeft,deckY-15);ctx.closePath();
  const stressed=remainingMM<0;
  ctx.fillStyle=stressed?"#d87962":"#39889c";ctx.fill();
  ctx.strokeStyle=stressed?"#ff8d72":lesson.accent;ctx.lineWidth=3;ctx.stroke();
  // Short deck seams make the expansion movement easier to see.
  ctx.strokeStyle="rgba(7,24,43,.65)";ctx.lineWidth=2;
  for(let i=1;i<13;i++) {
    const t=i/13,x=beamLeft+(beamRight-beamLeft)*t;
    const y=deckY-buckle*2*4*t*(1-t);
    ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x,y);ctx.stroke();
  }
  // Warmth glow intensifies during the run; the thermometer mirrors the selected temperature.
  ctx.fillStyle=`rgba(255,145,93,${Math.min(.25,temp/360+motion*.12)})`;
  ctx.fillRect(beamLeft,deckY-20,Math.max(1,beamRight-beamLeft),22);
  const tubeX=w*.09,tubeY=h*.2,tubeH=h*.28;
  ctx.strokeStyle="rgba(255,255,255,.72)";ctx.lineWidth=5;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(tubeX,tubeY);ctx.lineTo(tubeX,tubeY+tubeH);ctx.stroke();
  ctx.fillStyle="#ff8d72";ctx.beginPath();ctx.arc(tubeX,tubeY+tubeH,8,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(tubeX,tubeY+tubeH);ctx.lineTo(tubeX,tubeY+tubeH*(1-temp/100));ctx.strokeStyle="#ff8d72";ctx.lineWidth=4;ctx.stroke();
  const jointX=supportRight+5;
  ctx.fillStyle=stressed?"#ff8d72":"#ffe08a";ctx.font=`bold ${Math.max(11,w*.024)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText(stressed?`JOINT TOO SMALL · +${Math.abs(remainingMM).toFixed(1)} mm`:`JOINT · ${Math.max(0,remainingMM).toFixed(1)} mm LEFT`,center,h*.13);
  ctx.font=`bold ${Math.max(10,w*.021)}px sans-serif`;ctx.fillText(`TEMP ${Math.round(temp)}°C`,tubeX+34,tubeY+4);
  // Highlight the visible joint at the right abutment.
  ctx.strokeStyle=stressed?"#ff8d72":"#ffd166";ctx.lineWidth=3;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(supportRight,deckY-22);ctx.lineTo(supportRight,deckY+5);ctx.stroke();ctx.setLineDash([]);
  ctx.textAlign="center";ctx.fillStyle="#d9f6ff";ctx.fillText("EXPANSION JOINT",jointX-6,ground+23);
}

function drawMaterialBeam(ctx,w,h,lesson,strength,weight,motion) {
  const ground=h*.76, left=w*.2, right=w*.8, center=(left+right)/2;
  const baseY=ground-h*.22;
  const thickness=7+strength*.2;
  const capacity=strength*(1-.55*weight/100);
  const held=capacity>=65;
  const sag=h*(.02+(100-strength)*.0007+weight*.00045)+(motion>0?(1-capacity/100)*h*.04*motion:0);
  // Two test stands support the beam while the load is placed at its midpoint.
  [left,right].forEach((x)=>{
    ctx.fillStyle="#617a90";ctx.fillRect(x-16,baseY+5,32,ground-baseY-5);
    ctx.fillStyle="#a8bfce";ctx.fillRect(x-27,ground-8,54,10);
    ctx.fillStyle="#a8bfce";ctx.fillRect(x-22,baseY,44,8);
  });
  // A light color represents low mass; the beam visibly bends more when it is weak or heavy.
  const hue=190-145*weight/100;
  const materialColor=`hsl(${hue} 67% 55%)`;
  ctx.save();ctx.beginPath();ctx.moveTo(left,baseY);
  ctx.quadraticCurveTo(center,baseY+sag*2,right,baseY);
  ctx.strokeStyle=materialColor;ctx.lineWidth=thickness;ctx.lineCap="round";
  ctx.shadowColor=materialColor;ctx.shadowBlur=held?12:3;ctx.stroke();ctx.shadowBlur=0;
  // Material grain lines follow the beam curve.
  ctx.strokeStyle="rgba(5,24,39,.48)";ctx.lineWidth=1.5;
  for(let i=1;i<12;i++) {
    const t=i/12,x=left+(right-left)*t,y=baseY+sag*4*t*(1-t);
    ctx.beginPath();ctx.moveTo(x,y-thickness*.35);ctx.lineTo(x,y+thickness*.35);ctx.stroke();
  }
  ctx.restore();
  // Three blocks create the same repeatable load in each material test.
  const block=Math.max(20,w*.055), blockHeight=Math.max(17,h*.06), stack=3;
  const blockBase=baseY+sag-thickness/2-motion*4;
  for(let i=0;i<stack;i++) {
    ctx.fillStyle=i===2?"#ffd166":"#ff9f6e";ctx.fillRect(center-block/2,blockBase-blockHeight*(i+1),block,blockHeight-3);
    ctx.strokeStyle="rgba(83,48,12,.55)";ctx.lineWidth=2;ctx.strokeRect(center-block/2,blockBase-blockHeight*(i+1),block,blockHeight-3);
  }
  ctx.fillStyle=held?"#9fffc6":"#ffb5c5";ctx.font=`bold ${Math.max(12,w*.027)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText(motion<=0?"3 BLOCK LOAD READY":motion>=.9?(held?"LOAD HELD":"BEAM BENDS"):"LOAD TEST",center,h*.13);
  ctx.fillStyle="#d9f6ff";ctx.font=`bold ${Math.max(10,w*.021)}px sans-serif`;
  ctx.fillText(`BEAM SAG · ${(sag/h*100).toFixed(0)}%`,center,ground+23);
}

function drawDensityTank(ctx,w,h,lesson,objectSetting,waterSetting,motion) {
  const surface=h*.29, bottom=h*.82, centerX=w*.5, targetY=(surface+bottom)*.52;
  const objectDensity=600+objectSetting*15, waterDensity=800+waterSetting*4;
  const densityDifference=objectDensity-waterDensity;
  const objectSize=Math.max(22,w*.055);
  const equilibriumY=clamp(targetY+clamp(densityDifference/600,-.52,.52)*h*.48,surface+objectSize*1.3,bottom-objectSize*1.3);
  const y=motion>0 ? surface+h*.06+(equilibriumY-(surface+h*.06))*(1-Math.pow(1-motion,1.7)) : equilibriumY;
  const water=ctx.createLinearGradient(0,surface,0,bottom);
  water.addColorStop(0,"rgba(55,190,223,.77)");water.addColorStop(1,"rgba(15,82,132,.92)");
  ctx.fillStyle=water;ctx.fillRect(0,surface,w,bottom-surface);
  ctx.fillStyle="rgba(94,231,255,.16)";ctx.fillRect(0,bottom,w,h-bottom);
  // Surface ripples and depth ticks give the object a clear place in the tank.
  ctx.strokeStyle="#8ee7ff";ctx.lineWidth=3;ctx.beginPath();
  for(let x=0;x<=w;x+=8) { const yy=surface+Math.sin(x/23+performance.now()/500)*3; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy); }
  ctx.stroke();
  ctx.strokeStyle="rgba(223,248,255,.25)";ctx.lineWidth=1.5;
  for(let i=0;i<6;i++){const tickY=surface+28+i*(bottom-surface-48)/5;ctx.beginPath();ctx.moveTo(w*.06,tickY);ctx.lineTo(w*.11,tickY);ctx.stroke();}
  // A dashed depth target marks neutral buoyancy.
  ctx.setLineDash([8,7]);ctx.strokeStyle="rgba(255,209,102,.8)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.19,targetY);ctx.lineTo(w*.81,targetY);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle="#ffe08a";ctx.font=`bold ${Math.max(11,w*.024)}px sans-serif`;ctx.textAlign="left";ctx.textBaseline="bottom";ctx.fillText("HOVER ZONE",w*.2,targetY-7);
  // The bright test object rises or sinks until buoyancy and its weight balance.
  const size=objectSize;
  ctx.save();ctx.translate(centerX,y);
  ctx.shadowColor=lesson.accent;ctx.shadowBlur=18;
  ctx.fillStyle="#d9f8ff";ctx.beginPath();ctx.moveTo(-size*.68,-size*.5);ctx.lineTo(size*.55,-size*.5);ctx.lineTo(size*.68,-size*.27);ctx.lineTo(size*.68,size*.5);ctx.lineTo(-size*.68,size*.5);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle="#16799b";ctx.beginPath();ctx.arc(-size*.27,-size*.05,size*.16,0,Math.PI*2);ctx.arc(size*.2,-size*.05,size*.16,0,Math.PI*2);ctx.fill();
  ctx.restore();
  // Opposing arrows represent buoyancy and weight; balanced arrows indicate neutral buoyancy.
  const buoyancyLength=clamp(24-densityDifference*.07,12,48);
  const weightLength=clamp(24+densityDifference*.07,12,48);
  const forceX=centerX+size*.92;
  const drawArrow=(x,y1,y2,color)=>{ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y1);ctx.lineTo(x,y2);ctx.stroke();const dir=Math.sign(y2-y1);ctx.beginPath();ctx.moveTo(x,y2);ctx.lineTo(x-6,y2-dir*9);ctx.lineTo(x+6,y2-dir*9);ctx.closePath();ctx.fill();};
  drawArrow(forceX,y+buoyancyLength/2,y-buoyancyLength/2,"#7bf1a8");
  drawArrow(forceX+14,y-weightLength/2,y+weightLength/2,"#ffb27c");
  ctx.fillStyle="#dff8ff";ctx.font=`bold ${Math.max(10,w*.02)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText(`OBJECT ${Math.round(objectDensity)} kg/m³`,centerX,h*.14);
  ctx.fillStyle="#9feaff";ctx.fillText(`WATER ${Math.round(waterDensity)} kg/m³`,centerX,h*.19);
  for(let i=0;i<7;i++) {
    const bx=w*(.15+((i*.17+performance.now()/14000)% .7)), by=surface+25+((i*43+performance.now()*.025)%(bottom-surface-35));
    ctx.strokeStyle="rgba(223,248,255,.58)";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(bx,by,2+(i%3),0,Math.PI*2);ctx.stroke();
  }
}

function drawPressureTank(ctx,w,h,lesson,depthSetting,hullSetting,motion) {
  const surface=h*.2, bottom=h*.84, centerX=w*.52;
  const depth=depthSetting, pressure=1+depth/10, hullRating=2+hullSetting*.1;
  const safe=hullRating>=pressure;
  const targetY=surface+h*.08+(bottom-surface-h*.15)*depth/100;
  const y=motion>0?surface+h*.07+(targetY-(surface+h*.07))*(1-Math.pow(1-motion,1.5)):targetY;
  const sea=ctx.createLinearGradient(0,surface,0,bottom);
  sea.addColorStop(0,"#1683a7");sea.addColorStop(.55,"#0b4a76");sea.addColorStop(1,"#082441");
  ctx.fillStyle=sea;ctx.fillRect(0,surface,w,bottom-surface);
  ctx.fillStyle="rgba(94,231,255,.13)";ctx.fillRect(0,bottom,w,h-bottom);
  // Sunlit surface and depth marks keep the increasing pressure tied to the dive.
  ctx.fillStyle="rgba(255,209,102,.18)";ctx.fillRect(0,0,w,surface);
  ctx.strokeStyle="#8ee7ff";ctx.lineWidth=2;ctx.beginPath();
  for(let x=0;x<=w;x+=8){const yy=surface+Math.sin(x/22+performance.now()/480)*3;x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);}ctx.stroke();
  ctx.strokeStyle="rgba(223,248,255,.35)";ctx.fillStyle="#dff8ff";ctx.font=`bold ${Math.max(10,w*.02)}px sans-serif`;ctx.textAlign="left";ctx.textBaseline="middle";
  for(let i=0;i<=5;i++){
    const markY=surface+(bottom-surface)*i/5;ctx.beginPath();ctx.moveTo(w*.07,markY);ctx.lineTo(w*.12,markY);ctx.stroke();
    ctx.fillText(`${i*20} m`,w*.135,markY);
  }
  const pressureY=surface+(bottom-surface)*depth/100;
  ctx.setLineDash([6,7]);ctx.strokeStyle=safe?"rgba(123,241,168,.55)":"rgba(255,139,114,.68)";ctx.beginPath();ctx.moveTo(w*.2,pressureY);ctx.lineTo(w*.84,pressureY);ctx.stroke();ctx.setLineDash([]);
  // Hull frame, round portholes, and a pressure gauge form a clear submersible.
  const subW=Math.min(w*.3,160), subH=Math.max(42,h*.15), subX=centerX-subW/2, subY=y-subH/2;
  ctx.save();ctx.translate(centerX,y);
  if(!safe&&motion>0)ctx.rotate(Math.sin(performance.now()/34)*.025*motion);
  ctx.shadowColor=safe?"#5ee7ff":"#ff8d72";ctx.shadowBlur=safe?14:24;
  ctx.fillStyle=safe?"#ccecf3":"#9cbbc2";ctx.beginPath();ctx.ellipse(0,0,subW*.43,subH*.42,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle="#163f5b";ctx.beginPath();ctx.ellipse(0,0,subW*.31,subH*.27,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#8ee7ff";[-.16,0,.16].forEach(offset=>{ctx.beginPath();ctx.arc(subW*offset,0,Math.max(4,subH*.09),0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#ffd166";ctx.fillRect(-subW*.12,-subH*.5,subW*.24,5);ctx.fillRect(-subW*.025,-subH*.62,subW*.05,subH*.15);
  ctx.fillStyle="#d6eaf0";ctx.beginPath();ctx.moveTo(-subW*.38,subH*.25);ctx.lineTo(-subW*.54,subH*.45);ctx.lineTo(-subW*.3,subH*.42);ctx.closePath();ctx.fill();
  ctx.restore();
  // Compression marks brighten when the selected depth exceeds the hull rating.
  const strain=clamp((pressure-hullRating)/pressure,0,1);
  ctx.strokeStyle=safe?"rgba(123,241,168,.45)":"#ff8d72";ctx.lineWidth=2+strain*3;
  for(let i=0;i<3;i++){
    const x=subX+subW*(.36+i*.14), crackY=subY+subH*.12;
    ctx.beginPath();ctx.moveTo(x,crackY);ctx.lineTo(x-4,crackY+8);ctx.lineTo(x+2,crackY+14);ctx.lineTo(x-3,crackY+21);ctx.stroke();
  }
  if(!safe&&motion>0){
    for(let i=0;i<5;i++){
      const bx=subX+subW*.25+(i*19+performance.now()*.025)% (subW*.55);
      const by=subY+subH*.55-(performance.now()*.04+i*16)%40;
      ctx.strokeStyle="rgba(255,220,200,.8)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by,3+(i%2),0,Math.PI*2);ctx.stroke();
    }
  }
  // Pressure and hull gauges make the pass condition legible without equations.
  ctx.fillStyle="rgba(4,20,37,.76)";ctx.strokeStyle="rgba(142,231,255,.32)";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(w*.66,h*.07,w*.28,h*.19,12);ctx.fill();ctx.stroke();
  ctx.fillStyle="#dff8ff";ctx.font=`bold ${Math.max(11,w*.024)}px sans-serif`;ctx.textAlign="left";ctx.textBaseline="top";
  ctx.fillText(`DEPTH  ${depth} m`,w*.69,h*.095);ctx.fillText(`PRESSURE  ${pressure.toFixed(1)} atm`,w*.69,h*.135);
  ctx.fillStyle=safe?"#9fffc6":"#ffb5a5";ctx.fillText(`HULL  ${hullRating.toFixed(1)} atm`,w*.69,h*.175);
  ctx.fillStyle=safe?"#9fffc6":"#ffb5a5";ctx.font=`bold ${Math.max(12,w*.027)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText(motion<=0?"PRESSURE TEST READY":motion>=.9?(safe?"HULL HOLDING":"HULL LEAKING"):"DIVING",centerX,h*.13);
}

function drawWaterWheel(ctx,w,h,lesson,flowSetting,aimSetting,motion) {
  const ground=h*.78, cx=w*.63, cy=h*.55, radius=Math.min(w*.145,h*.235);
  const flow=flowSetting/100, offset=(aimSetting-50)/50;
  const aimEfficiency=clamp(1-Math.abs(offset),0,1), power=flow*flow*aimEfficiency*100;
  const lit=power>=65 && motion>=.85;
  const impactY=cy+offset*radius*1.35;
  // Channel and ripples show the source and direction of the moving water.
  ctx.fillStyle="rgba(42,150,190,.62)";ctx.fillRect(0,ground,w,h-ground);
  ctx.strokeStyle="rgba(142,231,255,.35)";ctx.lineWidth=2;
  for(let i=0;i<4;i++){const yy=ground+10+i*13;ctx.beginPath();ctx.moveTo(0,yy);ctx.quadraticCurveTo(w*.35,yy-4,w*.7,yy);ctx.quadraticCurveTo(w*.85,yy+4,w,yy);ctx.stroke();}
  // Water jet height follows the aim slider; a poor aim visibly misses the paddles.
  const jetWidth=2+flow*5, dashShift=performance.now()*.035*(.25+flow);
  ctx.save();ctx.lineCap="round";
  for(let i=-1;i<=1;i++){
    ctx.beginPath();ctx.moveTo(w*.07,cy+offset*radius*.72+i*jetWidth*1.6);
    ctx.quadraticCurveTo(cx-radius*2,cy+offset*radius*1.12+i*jetWidth, cx-radius*.88,impactY+i*jetWidth*.35);
    ctx.strokeStyle=i===0?"rgba(94,231,255,.95)":"rgba(142,231,255,.55)";
    ctx.lineWidth=i===0?jetWidth:jetWidth*.65;ctx.setLineDash(i===0?[13,9]:[]);ctx.lineDashOffset=-dashShift;ctx.stroke();
  }
  ctx.setLineDash([]);ctx.restore();
  // Timber paddles rotate faster as more of the stream's energy reaches the wheel.
  const rotation=motion>0?performance.now()*.001*(.4+power/100*4.2)*motion:0;
  ctx.save();ctx.translate(cx,cy);ctx.rotate(rotation);
  ctx.strokeStyle="#9ec1d0";ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,0,radius*.78,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<10;i++){
    const angle=i*Math.PI/5;
    ctx.save();ctx.rotate(angle);
    ctx.fillStyle=i%2?"#b9804d":"#d99b5c";ctx.strokeStyle="#603f2d";ctx.lineWidth=2;
    ctx.fillRect(radius*.47,-radius*.13,radius*.56,radius*.26);ctx.strokeRect(radius*.47,-radius*.13,radius*.56,radius*.26);
    ctx.strokeStyle="#b9e9f4";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(radius*.83,0);ctx.stroke();ctx.restore();
  }
  ctx.fillStyle="#ffd166";ctx.beginPath();ctx.arc(0,0,radius*.2,0,Math.PI*2);ctx.fill();
  ctx.restore();
  // A shaft links the wheel to a lamp so transferred energy has a visible result.
  ctx.strokeStyle="#d6e8ef";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(cx+radius*.95,cy);ctx.lineTo(w*.86,cy);ctx.stroke();
  ctx.strokeStyle="#ffd166";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.86,cy);ctx.lineTo(w*.86,cy-h*.12);ctx.stroke();
  ctx.save();ctx.translate(w*.86,cy-h*.17);
  ctx.fillStyle=lit?"#fff2a6":"#44586a";ctx.shadowColor="#ffd166";ctx.shadowBlur=lit?35:0;
  ctx.beginPath();ctx.arc(0,0,Math.max(15,w*.035),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle="#d6e8ef";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-8,17);ctx.lineTo(8,17);ctx.stroke();ctx.restore();
  ctx.fillStyle=lit?"#fff2a6":"#c3d4df";ctx.font=`bold ${Math.max(11,w*.024)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText(lit?"LAMP ON":"LAMP OFF",w*.86,cy-h*.17-25);
  ctx.fillStyle="#dff8ff";ctx.fillText(`POWER ${Math.round(power)}%`,w*.5,h*.13);
  if(Math.abs(offset)>.12){ctx.fillStyle="#ffe08a";ctx.font=`bold ${Math.max(10,w*.021)}px sans-serif`;ctx.fillText(offset<0?"AIMING HIGH":"AIMING LOW",w*.31,h*.22);}
}

function drawCircuitTest(ctx,w,h,lesson,branchSetting,batterySetting,motion) {
  const parallel=branchSetting>=50, voltage=1.5+batterySetting*.09;
  const batteryReady=voltage>=3.5, removing=motion>=.58;
  const current=batteryReady&&(!removing||parallel);
  const yTop=h*.31, yBottom=h*.75, xBattery=w*.18, xRight=w*.83;
  const wireColor=current?"#5ee7ff":"#60798b", lw=Math.max(3,w*.006);
  ctx.strokeStyle=wireColor;ctx.lineWidth=lw;ctx.lineCap="round";
  if(parallel) {
    const x1=w*.43,x2=w*.66;
    ctx.beginPath();ctx.moveTo(xBattery,yTop);ctx.lineTo(xRight,yTop);ctx.moveTo(xRight,yBottom);ctx.lineTo(xBattery,yBottom);ctx.stroke();
    [[x1,0],[x2,1]].forEach(([x,index])=>{
      const bulbY=(yTop+yBottom)/2, removed=removing&&index===0;
      ctx.beginPath();ctx.moveTo(x,yTop);ctx.lineTo(x,bulbY-.11*h);ctx.moveTo(x,bulbY+.11*h);ctx.lineTo(x,yBottom);ctx.stroke();
      drawCircuitBulb(ctx,x,bulbY,w*.04,batteryReady&&(!removing||index===1),removed);
    });
    ctx.fillStyle="#dff8ff";ctx.font=`bold ${Math.max(10,w*.021)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
    ctx.fillText("BULB A",x1,yBottom+20);ctx.fillText("BULB B",x2,yBottom+20);
  } else {
    const x1=w*.43,x2=w*.65,bulbY=yTop;
    ctx.beginPath();ctx.moveTo(xBattery,yTop);ctx.lineTo(x1-w*.045,yTop);ctx.moveTo(x1+w*.045,yTop);ctx.lineTo(x2-w*.045,yTop);ctx.moveTo(x2+w*.045,yTop);ctx.lineTo(xRight,yTop);ctx.moveTo(xRight,yTop);ctx.lineTo(xRight,yBottom);ctx.lineTo(xBattery,yBottom);ctx.stroke();
    drawCircuitBulb(ctx,x1,bulbY,w*.04,batteryReady&&!removing,removing);
    drawCircuitBulb(ctx,x2,bulbY,w*.04,batteryReady&&!removing,false);
    ctx.fillStyle="#dff8ff";ctx.font=`bold ${Math.max(10,w*.021)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="top";
    ctx.fillText("BULB A",x1,yTop+12);ctx.fillText("BULB B",x2,yTop+12);
  }
  // A visible battery with long and short plates marks the source and return path.
  const batteryY=(yTop+yBottom)/2;
  ctx.strokeStyle=wireColor;ctx.lineWidth=lw;ctx.beginPath();
  ctx.moveTo(xBattery,yTop);ctx.lineTo(xBattery,batteryY-h*.12);
  ctx.moveTo(xBattery,batteryY+h*.12);ctx.lineTo(xBattery,yBottom);ctx.stroke();
  ctx.fillStyle="#183c58";ctx.strokeStyle="#9be8ff";ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(xBattery-w*.065,batteryY-h*.12,w*.13,h*.24,10);ctx.fill();ctx.stroke();
  ctx.strokeStyle="#ffd166";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(xBattery-w*.025,batteryY-h*.055);ctx.lineTo(xBattery+w*.025,batteryY-h*.055);ctx.moveTo(xBattery,batteryY-h*.08);ctx.lineTo(xBattery,batteryY-h*.03);ctx.moveTo(xBattery-w*.016,batteryY+h*.055);ctx.lineTo(xBattery+w*.016,batteryY+h*.055);ctx.stroke();
  ctx.fillStyle="#e3f6ff";ctx.font=`bold ${Math.max(11,w*.023)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText(`${voltage.toFixed(1)} V`,xBattery,h*.15);
  ctx.fillStyle=parallel?"#9fffc6":"#ffd166";ctx.fillText(parallel?"PARALLEL · 2 PATHS":"SERIES · 1 PATH",w*.55,h*.15);
  ctx.fillStyle=removing?(parallel?"#9fffc6":"#ffb5a5"):"#d9f6ff";ctx.font=`bold ${Math.max(10,w*.02)}px sans-serif`;
  ctx.fillText(!removing?"A & B CONNECTED · REMOVE A TO TEST":parallel?"A REMOVED · B STILL LIT":"A REMOVED · PATH OPEN · BOTH OUT",w*.55,h*.2);
  // Animated charge dots travel around the active path.
  if(current&&motion>0){
    for(let i=0;i<5;i++){
      const t=(performance.now()*.00022+i/5)%1;
      let x,y;
      if(parallel){x=xBattery+(xRight-xBattery)*t;y=t<.5?yTop:yBottom;}
      else if(t<.56){x=xBattery+(xRight-xBattery)*t/.56;y=yTop;}
      else {x=xRight-(xRight-xBattery)*(t-.56)/.44;y=yBottom;}
      ctx.fillStyle="#e6fcff";ctx.shadowColor="#5ee7ff";ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    }
  }
}

function drawCircuitBulb(ctx,x,y,r,lit,removed) {
  if(removed){
    ctx.strokeStyle="#ff8d72";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-r*.75,y-r*.75);ctx.lineTo(x+r*.75,y+r*.75);ctx.moveTo(x+r*.75,y-r*.75);ctx.lineTo(x-r*.75,y+r*.75);ctx.stroke();
    return;
  }
  ctx.save();ctx.shadowColor=lit?"#ffd166":"transparent";ctx.shadowBlur=lit?28:0;
  ctx.fillStyle=lit?"#fff0a6":"#344d63";ctx.strokeStyle=lit?"#ffd166":"#8ca5b8";ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  ctx.strokeStyle=lit?"#9a6b00":"#72889a";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-r*.38,y+r*.5);ctx.lineTo(x-r*.25,y+r*.9);ctx.lineTo(x+r*.25,y+r*.9);ctx.lineTo(x+r*.38,y+r*.5);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-r*.2,y-r*.25);ctx.lineTo(x+r*.2,y+r*.25);ctx.moveTo(x+r*.2,y-r*.25);ctx.lineTo(x-r*.2,y+r*.25);ctx.stroke();ctx.restore();
}

function drawElectromagnet(ctx,w,h,lesson,turnSetting,currentSetting,motion) {
  const center=w*.52, top=h*.3, bottom=h*.65, mid=(top+bottom)/2;
  const turns=Math.round(2+turnSetting/11), current=currentSetting*.04;
  const strength=(.15+.85*turnSetting/100)*currentSetting;
  const active=motion>0, tableY=h*.78, coilRX=Math.min(w*.085,55), coilRY=Math.max(5,h*.018);
  // Circuit wires connect the battery to a coil wrapped around an iron core.
  ctx.strokeStyle=current>0?"#5ee7ff":"#60798b";ctx.lineWidth=4;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(w*.2,h*.48);ctx.lineTo(w*.34,h*.48);ctx.lineTo(w*.34,top);ctx.lineTo(center-coilRX,top);ctx.stroke();
  ctx.beginPath();ctx.moveTo(center+coilRX,bottom);ctx.lineTo(w*.34,bottom);ctx.lineTo(w*.34,h*.58);ctx.lineTo(w*.2,h*.58);ctx.stroke();
  // Battery symbol and current marks.
  ctx.fillStyle="#183c58";ctx.strokeStyle="#9be8ff";ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(w*.1,h*.43,w*.12,h*.2,10);ctx.fill();ctx.stroke();
  ctx.strokeStyle="#ffd166";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*.13,h*.49);ctx.lineTo(w*.19,h*.49);ctx.moveTo(w*.16,h*.46);ctx.lineTo(w*.16,h*.52);ctx.moveTo(w*.14,h*.57);ctx.lineTo(w*.18,h*.57);ctx.stroke();
  // Iron core.
  const core=ctx.createLinearGradient(center-coilRX/2,0,center+coilRX/2,0);
  core.addColorStop(0,"#70899a");core.addColorStop(.5,"#d8e5ec");core.addColorStop(1,"#60798b");
  ctx.fillStyle=core;ctx.fillRect(center-13,top-10,26,bottom-top+20);
  ctx.fillStyle="#38566c";ctx.beginPath();ctx.moveTo(center-13,bottom+10);ctx.lineTo(center+13,bottom+10);ctx.lineTo(center,bottom+31);ctx.closePath();ctx.fill();
  // Copper loops scale with turns; current brightens the coil and magnetic field.
  ctx.strokeStyle=`hsl(${Math.max(8,32-currentSetting*.16)} 88% ${42+current*.9}%)`;ctx.lineWidth=5+current*1.3;
  ctx.shadowColor="#ff9f45";ctx.shadowBlur=active?current*4:current*1.5;
  for(let i=0;i<turns;i++){
    const y=top+10+(bottom-top-20)*(i/Math.max(1,turns-1));
    ctx.beginPath();ctx.ellipse(center,y,coilRX,coilRY,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.shadowBlur=0;
  // Field loops grow brighter as the amp-turn setting increases.
  const fieldLines=Math.max(1,Math.round(strength/13));
  for(let i=0;i<fieldLines;i++){
    const spread=coilRX+18+i*15;
    ctx.strokeStyle=`rgba(142,231,255,${Math.max(.12,Math.min(.65,strength/150))})`;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(center,top-5);ctx.quadraticCurveTo(center+spread,mid,center,bottom+5);ctx.quadraticCurveTo(center-spread,mid,center,top-5);ctx.stroke();
  }
  // Three iron clips rise by different amounts as the field gets stronger.
  ctx.fillStyle="rgba(255,209,102,.12)";ctx.fillRect(0,tableY,w,h-tableY);
  ctx.strokeStyle="rgba(255,209,102,.55)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,tableY);ctx.lineTo(w,tableY);ctx.stroke();
  const clipXs=[center-75,center,center+75], needs=[25,45,65];
  clipXs.forEach((x,i)=>{
    const pickup=clamp(strength/needs[i],0,1), rise=active?pickup*h*.24*motion:0;
    const clipY=tableY-13-rise;
    ctx.strokeStyle="#dce8ee";ctx.lineWidth=4;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(x-9,clipY-8);ctx.lineTo(x-9,clipY+7);ctx.quadraticCurveTo(x,clipY+17,x+9,clipY+7);ctx.lineTo(x+9,clipY-8);ctx.stroke();
    ctx.fillStyle="#dce8ee";ctx.beginPath();ctx.arc(x-9,clipY-9,3,0,Math.PI*2);ctx.arc(x+9,clipY-9,3,0,Math.PI*2);ctx.fill();
  });
  ctx.fillStyle="#dff8ff";ctx.font=`bold ${Math.max(11,w*.024)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText(`${turns} COIL TURNS · ${current.toFixed(1)} A`,center,h*.14);
  ctx.fillStyle=strength>=65&&motion>=.9?"#9fffc6":"#ffe08a";
  const lifted=active&&motion>=.35?needs.filter(need=>strength>=need).length:0;
  ctx.fillText(active?`${lifted} / 3 CLIPS LIFTED`:`FIELD STRENGTH ${Math.round(strength)}%`,center,h*.2);
}

function drawSolarScene(ctx,w,h,lesson,tiltSetting,cloudSetting,motion) {
  const sky=ctx.createLinearGradient(0,0,0,h*.78);
  sky.addColorStop(0,"#153c68");sky.addColorStop(1,"#40a2bd");
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  const ground=h*.78, tilt=tiltSetting*.9, clouds=cloudSetting/100;
  const alignment=Math.max(0,Math.cos((tilt-45)*Math.PI/180));
  const cloudFactor=1-.9*clouds, power=alignment*cloudFactor*100;
  // Hills and a moving sunray path show how light reaches the panel.
  ctx.fillStyle="#214e56";ctx.beginPath();ctx.moveTo(0,ground);ctx.quadraticCurveTo(w*.22,h*.64,w*.48,ground);ctx.quadraticCurveTo(w*.74,h*.66,w,ground);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();
  ctx.fillStyle="#ffd166";ctx.shadowColor="#ffd166";ctx.shadowBlur=24;ctx.beginPath();ctx.arc(w*.19,h*.22,Math.max(25,w*.055),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  const panelX=w*.52,panelY=ground-h*.2,panelW=w*.24,panelH=h*.11;
  ctx.strokeStyle=`rgba(255,226,133,${.2+.68*alignment*cloudFactor})`;ctx.lineWidth=3;
  for(let i=0;i<4;i++){
    ctx.beginPath();ctx.moveTo(w*(.22+i*.055),h*.26+i*5);ctx.lineTo(panelX-panelW*.25+i*10,panelY-panelH*.4);ctx.stroke();
  }
  // Clouds increase in cover and shade the sunbeam as the control moves right.
  const cloudX=w*(.35+clouds*.18), cloudY=h*.28;
  for(let i=0;i<3;i++){
    const cx=cloudX+i*w*.1, cy=cloudY+(i%2)*h*.055;
    ctx.fillStyle=`rgba(183,211,225,${.18+clouds*.68})`;
    ctx.beginPath();ctx.arc(cx,cy,Math.max(18,w*.035),0,Math.PI*2);ctx.arc(cx+w*.032,cy-8,Math.max(20,w*.04),0,Math.PI*2);ctx.arc(cx+w*.068,cy,Math.max(17,w*.032),0,Math.PI*2);ctx.fill();
  }
  // Tilting changes the panel's angle; the cell grid makes the adjustment obvious.
  ctx.save();ctx.translate(panelX,panelY);ctx.rotate(-tilt*Math.PI/180);
  ctx.fillStyle="#123c62";ctx.strokeStyle="#8ee7ff";ctx.lineWidth=3;
  ctx.fillRect(-panelW/2,-panelH/2,panelW,panelH);ctx.strokeRect(-panelW/2,-panelH/2,panelW,panelH);
  ctx.strokeStyle="rgba(142,231,255,.75)";ctx.lineWidth=1.5;
  for(let i=1;i<5;i++){const x=-panelW/2+panelW*i/5;ctx.beginPath();ctx.moveTo(x,-panelH/2);ctx.lineTo(x,panelH/2);ctx.stroke();}
  for(let i=1;i<3;i++){const y=-panelH/2+panelH*i/3;ctx.beginPath();ctx.moveTo(-panelW/2,y);ctx.lineTo(panelW/2,y);ctx.stroke();}
  ctx.restore();
  // A-frame stand and cable connect the panel to the rover.
  ctx.strokeStyle="#d7e7ea";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(panelX-panelW*.24,panelY+panelH*.5);ctx.lineTo(panelX-panelW*.3,ground-6);ctx.moveTo(panelX+panelW*.22,panelY+panelH*.5);ctx.lineTo(panelX+panelW*.28,ground-6);ctx.stroke();
  ctx.strokeStyle="#ffd166";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(panelX+panelW*.28,ground-6);ctx.lineTo(w*.82,ground-6);ctx.stroke();
  // Rover battery fills in proportion to delivered solar power.
  const roverX=w*.81, roverY=ground-h*.09, charge=motion*power/100;
  ctx.fillStyle="#263d54";ctx.fillRect(roverX-w*.09,roverY-h*.07,w*.18,h*.07);
  ctx.fillStyle="#8ee7ff";ctx.fillRect(roverX-w*.05,roverY-h*.12,w*.1,h*.05);
  ctx.fillStyle="#0b2135";ctx.fillRect(roverX-w*.045,roverY-h*.058,w*.09,h*.035);
  ctx.fillStyle="#7bf1a8";ctx.fillRect(roverX-w*.043,roverY-h*.056,w*.086*charge,h*.031);
  ctx.fillStyle="#0b1b2c";[roverX-w*.055,roverX+w*.055].forEach(x=>{ctx.beginPath();ctx.arc(x,ground-2,Math.max(8,w*.018),0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#dff8ff";ctx.font=`bold ${Math.max(11,w*.024)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText(`PANEL ${Math.round(tilt)}° · CLOUDS ${Math.round(clouds*100)}%`,panelX,h*.14);
  ctx.fillStyle=power>=65?"#9fffc6":"#ffe08a";ctx.fillText(`SOLAR OUTPUT ${Math.round(power)}%`,w*.5,h*.2);
  ctx.fillStyle=charge>=.65?"#9fffc6":"#dff8ff";ctx.fillText(`ROVER BATTERY ${Math.round(charge*100)}%`,roverX,ground+23);
}

function drawSignalRelay(ctx,w,h,lesson,powerSetting,heightSetting,motion) {
  const ground=h*.78, hillPeak=h*.47, sourceX=w*.14, sourceY=h*.4, relayX=w*.52;
  const relayBase=ground-h*.08, relayHeight=h*(.1+.22*heightSetting/100), relayY=relayBase-relayHeight;
  const receiverX=w*.88, receiverY=ground-h*.25, power=powerSetting;
  const clear=relayY<hillPeak, received=clear?Math.max(0,power-20):0;
  const delivered=clear&&received>=45;
  const linkOne=clear&&power>=45, linkTwo=delivered;
  const linkColor=(ok)=>ok?"#7bf1a8":"#ff8d72";
  // Draw signal paths first so the hill can block a relay that is too low.
  ctx.save();ctx.setLineDash([10,8]);ctx.lineWidth=4;ctx.lineDashOffset=-performance.now()*.025;
  ctx.strokeStyle=linkColor(linkOne);ctx.beginPath();ctx.moveTo(sourceX,sourceY);ctx.lineTo(relayX,relayY);ctx.stroke();
  ctx.strokeStyle=linkColor(linkTwo);ctx.beginPath();ctx.moveTo(relayX,relayY);ctx.lineTo(receiverX,receiverY);ctx.stroke();ctx.restore();
  // Landscape obstacle breaks direct line of sight between the stations.
  ctx.fillStyle="#263d55";ctx.beginPath();ctx.moveTo(w*.31,ground);ctx.lineTo(w*.38,h*.64);ctx.lineTo(w*.45,h*.59);ctx.lineTo(w*.52,hillPeak);ctx.lineTo(w*.59,h*.56);ctx.lineTo(w*.67,h*.66);ctx.lineTo(w*.73,ground);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#71849a";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.38,h*.64);ctx.lineTo(w*.45,h*.59);ctx.lineTo(w*.52,hillPeak);ctx.lineTo(w*.59,h*.56);ctx.stroke();
  // Source mast and relay mast.
  [[sourceX,ground-h*.08,sourceY],[relayX,relayBase,relayY]].forEach(([x,base,top])=>{
    ctx.strokeStyle="#c4d5e1";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-12,base);ctx.lineTo(x,top);ctx.lineTo(x+12,base);ctx.moveTo(x-8,(base+top)/2);ctx.lineTo(x+8,(base+top)/2);ctx.stroke();
    ctx.fillStyle="#c4a1ff";ctx.fillRect(x-13,top-8,26,16);
    ctx.strokeStyle="#c4a1ff";ctx.lineWidth=2;
    for(let i=1;i<=2;i++){ctx.beginPath();ctx.arc(x,top-11,9+i*7,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}
  });
  // Sender and receiver stations.
  ctx.fillStyle="#ffcf73";ctx.fillRect(sourceX-25,ground-h*.08,50,h*.08);
  ctx.fillStyle="#213d57";ctx.fillRect(sourceX-13,ground-h*.06,26,h*.035);
  ctx.fillStyle="#8ee7ff";ctx.fillRect(receiverX-36,receiverY+12,72,ground-receiverY-12);
  ctx.fillStyle=delivered?"#9fffc6":"#ffb5a5";ctx.beginPath();ctx.arc(receiverX,receiverY,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#dff8ff";ctx.font=`bold ${Math.max(10,w*.021)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText("SENDER",sourceX,ground+20);ctx.fillText("RELAY",relayX,relayBase+20);ctx.fillText("ROVER",receiverX,ground+20);
  // A glowing data packet crosses the first link, then the second if it is clear and strong enough.
  if(motion>0){
    const packetCount=3;
    for(let i=0;i<packetCount;i++){
      const t=(motion*2+i*.22)%1;
      let x,y,visible=true;
      if(t<.5){const p=t*2;const reach=clear?power/45:.43;if(!linkOne&&p>reach)visible=false;x=sourceX+(relayX-sourceX)*p;y=sourceY+(relayY-sourceY)*p;}
      else {const p=(t-.5)*2;if(!linkTwo)visible=false;x=relayX+(receiverX-relayX)*p;y=relayY+(receiverY-relayY)*p;}
      if(visible){ctx.fillStyle="#f3e8ff";ctx.shadowColor="#c4a1ff";ctx.shadowBlur=15;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    }
  }
  ctx.fillStyle=delivered?"#9fffc6":"#ffe08a";ctx.font=`bold ${Math.max(11,w*.024)}px sans-serif`;
  ctx.fillText(delivered?"MESSAGE DELIVERED":clear?`SIGNAL ${Math.round(received)}% AT ROVER`:"RELAY BELOW THE RIDGE",w*.53,h*.14);
  ctx.fillStyle="#dff8ff";ctx.font=`bold ${Math.max(10,w*.02)}px sans-serif`;ctx.fillText(`POWER ${Math.round(power)}% · RELAY ${ (2+heightSetting*.08).toFixed(1)} m`,w*.53,h*.2);
}

function drawGreenhouse(ctx,w,h,lesson,triggerSetting,waterSetting,motion) {
  const dryness=70, triggered=dryness>=triggerSetting;
  const tested=motion>=.9, watering=motion>0&&triggered;
  const soilDryness=tested&&triggered?Math.max(0,dryness-waterSetting*.8):dryness;
  const healthy=tested&&triggered&&waterSetting>=56;
  const ground=h*.76, bedX=w*.17, bedW=w*.66, bedY=h*.62;
  const sky=ctx.createLinearGradient(0,0,0,ground);sky.addColorStop(0,"#173f69");sky.addColorStop(1,"#67ad9f");ctx.fillStyle=sky;ctx.fillRect(0,0,w,ground);
  // Glass roof and greenhouse supports.
  ctx.strokeStyle="rgba(205,247,255,.42)";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*.12,ground);ctx.lineTo(w*.2,h*.19);ctx.lineTo(w*.8,h*.19);ctx.lineTo(w*.88,ground);ctx.stroke();
  ctx.beginPath();ctx.moveTo(w*.2,h*.19);ctx.lineTo(w*.5,ground);ctx.moveTo(w*.8,h*.19);ctx.lineTo(w*.5,ground);ctx.moveTo(w*.5,h*.19);ctx.lineTo(w*.5,ground);ctx.stroke();
  ctx.fillStyle="#263f4b";ctx.fillRect(bedX,bedY,bedW,h*.16);ctx.fillStyle=soilDryness>30?"#855a3f":"#4b7953";ctx.fillRect(bedX+7,bedY+7,bedW-14,h*.13);
  // Probe in the soil links to the automatic pump controller.
  const sensorX=w*.68,sensorY=bedY+h*.04;
  ctx.strokeStyle=triggered?"#7bf1a8":"#ff8d72";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(sensorX,bedY-28);ctx.lineTo(sensorX,sensorY);ctx.stroke();
  ctx.fillStyle=triggered?"#9fffc6":"#ffb5a5";ctx.beginPath();ctx.arc(sensorX,bedY-31,7,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#8ee7ff";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sensorX,bedY-28);ctx.quadraticCurveTo(w*.78,h*.52,w*.83,h*.43);ctx.stroke();
  ctx.fillStyle="#183c58";ctx.strokeStyle="#8ee7ff";ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(w*.76,h*.35,w*.13,h*.12,8);ctx.fill();ctx.stroke();
  ctx.fillStyle=triggered?"#9fffc6":"#ffb5a5";ctx.font=`bold ${Math.max(10,w*.02)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(motion<=0?(triggered?"PUMP ARMED":"PUMP OFF"):(triggered?"PUMP ON":"PUMP OFF"),w*.825,h*.41);
  // Plant posture and color show whether automatic watering restored it.
  const plantX=w*.43,rootY=bedY+8,plantHeight=h*.26;
  const droop=healthy?0:tested&&triggered?0.18:0.1;
  const topX=plantX+droop*plantHeight,topY=rootY-plantHeight;
  ctx.strokeStyle=healthy?"#7bf1a8":"#a6ca75";ctx.lineWidth=7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(plantX,rootY);ctx.quadraticCurveTo(plantX-droop*plantHeight,rootY-plantHeight*.56,topX,topY);ctx.stroke();
  [[-.13,.45],[.14,.62],[-.11,.8],[.12,.95]].forEach(([side,pos],i)=>{
    const leafX=plantX+droop*plantHeight*pos,leafY=rootY-plantHeight*pos;
    ctx.fillStyle=healthy?"#7bf1a8":i%2?"#a3c875":"#82ad62";ctx.beginPath();ctx.ellipse(leafX+side*25,leafY,22,9,side*.65,0,Math.PI*2);ctx.fill();
  });
  if(healthy){ctx.fillStyle="#ffd166";ctx.beginPath();ctx.arc(topX,topY-8,8,0,Math.PI*2);ctx.fill();}
  // Water flows only when the sensor says the soil is dry enough.
  if(watering){
    ctx.strokeStyle="#5ee7ff";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*.78,h*.51);ctx.quadraticCurveTo(w*.64,h*.49,plantX,bedY+10);ctx.stroke();
    const droplets=Math.max(2,Math.round(waterSetting/12));
    for(let i=0;i<droplets;i++){
      const t=(motion*2+i/droplets)%1,dx=w*.78+(plantX-w*.78)*t,dy=h*.51+(bedY+10-h*.51)*t;
      ctx.fillStyle="#8ee7ff";ctx.beginPath();ctx.arc(dx,dy,3+(i%2),0,Math.PI*2);ctx.fill();
    }
  }
  // Moisture gauge reports the soil condition before and after the watering cycle.
  const gaugeX=w*.2,gaugeY=h*.25,gaugeW=w*.21;
  ctx.fillStyle="rgba(4,20,37,.72)";ctx.beginPath();ctx.roundRect(gaugeX,gaugeY,gaugeW,18,9);ctx.fill();
  ctx.fillStyle=soilDryness>30?"#ffb27c":"#7bf1a8";ctx.beginPath();ctx.roundRect(gaugeX+2,gaugeY+2,gaugeW*(1-soilDryness/100)-4,14,7);ctx.fill();
  ctx.fillStyle="#e8f8ff";ctx.font=`bold ${Math.max(10,w*.021)}px sans-serif`;ctx.textAlign="left";ctx.textBaseline="alphabetic";
  ctx.fillText(`SOIL MOISTURE ${100-Math.round(soilDryness)}%`,gaugeX,gaugeY-8);
  ctx.fillStyle=healthy?"#9fffc6":triggered?"#ffe08a":"#ffb5a5";ctx.textAlign="center";
  ctx.fillText(!tested?"SENSOR MONITORING":healthy?"PLANT WATERED":"PLANT NEEDS WATER",w*.52,h*.14);
  ctx.fillStyle="#dff8ff";ctx.fillText(`DRYNESS ${dryness}% · TRIGGER ${Math.round(triggerSetting)}%`,w*.52,h*.2);
}

function drawSteadyRobot(ctx,w,h,lesson,correctionSetting,delaySetting,motion) {
  const ground=h*.78,cx=w*.5,platformY=h*.65;
  const response=correctionSetting/100*(1-.8*delaySetting/100),stable=response>=.65;
  const instability=clamp(1-response,0,1);
  const wave=motion>0?Math.sin(performance.now()/(90+delaySetting*2))*instability*.16:0;
  const tilt=stable?instability*.24*(1-motion)+wave:instability*.42+wave;
  const delaySeconds=.1+delaySetting*.03;
  // Workshop floor and moving support show the disturbance the controller must correct.
  ctx.fillStyle="#263c52";ctx.fillRect(0,ground,w,h-ground);
  ctx.strokeStyle="rgba(142,231,255,.2)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,ground);ctx.lineTo(w,ground);ctx.stroke();
  ctx.fillStyle="#546f86";ctx.beginPath();ctx.moveTo(cx,platformY+32);ctx.lineTo(cx-34,ground);ctx.lineTo(cx+34,ground);ctx.closePath();ctx.fill();
  ctx.fillStyle="#ffd166";ctx.beginPath();ctx.arc(cx,platformY+38,5,0,Math.PI*2);ctx.fill();
  // Platform rocks; the robot applies an opposing lean based on its correction setting.
  ctx.save();ctx.translate(cx,platformY);ctx.rotate(tilt);
  const platformW=w*.72,platformH=15;
  ctx.fillStyle="#47738d";ctx.strokeStyle="#8ee7ff";ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-platformW/2,-platformH/2,platformW,platformH,8);ctx.fill();ctx.stroke();
  ctx.save();ctx.rotate(-tilt*correctionSetting/100*(1-delaySetting/125));
  const robotY=-platformH/2;
  ctx.strokeStyle="#9be8ff";ctx.lineWidth=10;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-12,robotY);ctx.lineTo(-18,robotY-32);ctx.moveTo(12,robotY);ctx.lineTo(18,robotY-32);ctx.stroke();
  ctx.fillStyle="#ffd166";ctx.beginPath();ctx.ellipse(-20,robotY+1,13,6,0,0,Math.PI*2);ctx.ellipse(20,robotY+1,13,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#80d8ee";ctx.strokeStyle="#0c2e48";ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-24,robotY-68,48,38,12);ctx.fill();ctx.stroke();
  ctx.strokeStyle="#9be8ff";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-22,robotY-58);ctx.lineTo(-38,robotY-42);ctx.moveTo(22,robotY-58);ctx.lineTo(38,robotY-42);ctx.stroke();
  ctx.fillStyle="#d8f6ff";ctx.strokeStyle="#0c2e48";ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-27,robotY-105,54,39,14);ctx.fill();ctx.stroke();
  ctx.fillStyle="#153c5b";ctx.beginPath();ctx.roundRect(-18,robotY-96,36,19,8);ctx.fill();
  ctx.fillStyle=stable?"#7bf1a8":"#ffd166";ctx.beginPath();ctx.arc(-8,robotY-87,3,0,Math.PI*2);ctx.arc(8,robotY-87,3,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#0c2e48";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,robotY-105);ctx.lineTo(0,robotY-115);ctx.stroke();
  ctx.fillStyle="#ff8fab";ctx.beginPath();ctx.arc(0,robotY-118,4,0,Math.PI*2);ctx.fill();
  ctx.restore();ctx.restore();
  // A tilt gauge makes the feedback signal and correction visible.
  const gx=w*.83,gy=h*.34,gr=Math.min(w*.075,35);
  ctx.strokeStyle="rgba(223,248,255,.55)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(gx,gy,gr,Math.PI,Math.PI*2);ctx.stroke();
  ctx.strokeStyle=stable?"#7bf1a8":"#ffb27c";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+Math.sin(tilt)*gr,gy-Math.cos(tilt)*gr);ctx.stroke();
  ctx.fillStyle="#dff8ff";ctx.font=`bold ${Math.max(10,w*.021)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillText(`TILT ${(tilt*180/Math.PI).toFixed(0)}°`,gx,gy+gr+20);
  ctx.fillStyle=stable&&motion>=.9?"#9fffc6":stable?"#ffe08a":"#ffb5a5";
  ctx.fillText(motion<=0?"BALANCE TEST READY":motion>=.9?(stable?"BALANCED":"STILL WOBBLING"):"CORRECTING…",cx,h*.14);
  ctx.fillStyle="#dff8ff";ctx.fillText(`RESPONSE ${Math.round(response*100)}% · DELAY ${delaySeconds.toFixed(1)} s`,cx,h*.2);
}

export const extensionLabs = lessons.map((lesson, index) => ({
  ...lesson,
  num: String(index + 9).padStart(2,"0"),
  art: makeArt(lesson),
  mount(root, api) {
    const initialA=["water-pressure","sensor"].includes(lesson.id) ? 65 : 35;
    const initialB=["water-pressure","sensor"].includes(lesson.id) ? 35 : 65;
    root.innerHTML = `<div class="lab-layout extension-layout"><div class="lab-canvas-wrap"><div class="scene extension-scene" style="--lesson-accent:${lesson.accent}"><canvas aria-label="${lesson.title} animated experiment"></canvas><div class="scene-pill">${lesson.icon} EXPERIMENT</div><div class="extension-caption">${lesson.tags.join(" · ")}</div><div class="extension-flash" aria-hidden="true">✦</div></div></div><aside class="control-panel"><div class="panel-head"><span class="panel-title"><span>⚙</span> Tune the test</span><button class="mini-btn" type="button" aria-label="Reset test">↺</button></div><div class="control-group"><label class="control-label">${lesson.a}<span class="control-value val-a">${initialA}</span></label><input class="range-a" type="range" min="0" max="100" value="${initialA}" aria-label="${lesson.a}"></div><div class="control-group"><label class="control-label">${lesson.b}<span class="control-value val-b">${initialB}</span></label><input class="range-b" type="range" min="0" max="100" value="${initialB}" aria-label="${lesson.b}"></div><div class="stat-row"><div class="stat"><span class="stat-label">Test runs</span><span class="stat-value runs">0</span></div><div class="stat"><span class="stat-label">Match</span><span class="stat-value match">50%</span></div></div><button class="action-btn warm run-btn" type="button">${lesson.id === "series-parallel" ? "REMOVE BULB A" : lesson.id === "electromagnet" ? "ENERGIZE & LIFT" : lesson.id === "solar" ? "CHARGE ROVER" : lesson.id === "signals" ? "SEND MESSAGE" : lesson.id === "feedback" ? "BALANCE ROBOT" : "RUN TEST"} <span aria-hidden="true">▶</span></button><div class="hint-chip"><span>💡</span><span>${lesson.hint}</span></div><div class="extension-feedback" aria-live="polite">${lesson.id === "series-parallel" ? "Set Branches to 2 · Parallel, then press REMOVE BULB A." : lesson.id === "electromagnet" ? "Tune the coil and current, then energize it to lift the clips." : lesson.id === "solar" ? "Aim the panel toward the sun and charge the battery above 65%." : lesson.id === "signals" ? "Raise the relay above the hill, then send a strong enough signal." : lesson.id === "feedback" ? "Increase correction strength and reduce delay, then test the balance." : "Change a control, then run your test."}</div></aside></div>`;
    const canvas=root.querySelector("canvas"), a=root.querySelector(".range-a"), b=root.querySelector(".range-b");
    const values=[a,b], readouts=[root.querySelector(".val-a"),root.querySelector(".val-b")];
    if(["arches","tower-wind"].includes(lesson.id)) root.querySelector(".match").previousElementSibling.textContent="Stability";
    if(lesson.id === "thermal") root.querySelector(".match").previousElementSibling.textContent="Gap check";
    if(lesson.id === "material-match") root.querySelector(".match").previousElementSibling.textContent="Capacity";
    if(lesson.id === "density") root.querySelector(".match").previousElementSibling.textContent="Density match";
    if(lesson.id === "water-pressure") root.querySelector(".match").previousElementSibling.textContent="Hull margin";
    if(lesson.id === "water-wheel") root.querySelector(".match").previousElementSibling.textContent="Power";
    if(lesson.id === "series-parallel") root.querySelector(".match").previousElementSibling.textContent="Bulbs lit";
    if(lesson.id === "electromagnet") root.querySelector(".match").previousElementSibling.textContent="Field strength";
    if(lesson.id === "solar") root.querySelector(".match").previousElementSibling.textContent="Solar output";
    if(lesson.id === "signals") root.querySelector(".match").previousElementSibling.textContent="Signal at rover";
    if(lesson.id === "sensor") root.querySelector(".match").previousElementSibling.textContent="Soil moisture";
    if(lesson.id === "feedback") root.querySelector(".match").previousElementSibling.textContent="Balance";
    let runs=0, motion=0, raf=0, active=false;
    const showControlValue=(input,index)=>{
      if(lesson.id === "momentum") {
        readouts[index].textContent = index === 0
          ? `${(1 + Number(input.value)/20).toFixed(1)} kg`
          : `${(Number(input.value)/10).toFixed(1)} N`;
      } else if(lesson.id === "thermal") {
        readouts[index].textContent = index === 0
          ? `${input.value}°C`
          : `${(Number(input.value)*.18).toFixed(1)} mm`;
      } else if(lesson.id === "density") {
        readouts[index].textContent = index === 0
          ? `${600+Number(input.value)*15} kg/m³`
          : `${800+Number(input.value)*4} kg/m³`;
      } else if(lesson.id === "water-pressure") {
        readouts[index].textContent = index === 0
          ? `${input.value} m`
          : `${(2+Number(input.value)*.1).toFixed(1)} atm`;
      } else if(lesson.id === "water-wheel") {
        readouts[index].textContent = index === 0
          ? `${(.5+Number(input.value)*.04).toFixed(1)} m/s`
          : `${Math.round((Number(input.value)-50)*.6)}°`;
      } else if(lesson.id === "series-parallel") {
        readouts[index].textContent = index === 0
          ? Number(input.value)>=50?"2 · Parallel":"1 · Series"
          : `${(1.5+Number(input.value)*.09).toFixed(1)} V`;
      } else if(lesson.id === "electromagnet") {
        readouts[index].textContent = index === 0
          ? `${Math.round(2+Number(input.value)/11)} turns`
          : `${(Number(input.value)*.04).toFixed(1)} A`;
      } else if(lesson.id === "solar") {
        readouts[index].textContent = index === 0
          ? `${Math.round(Number(input.value)*.9)}°`
          : `${input.value}%`;
      } else if(lesson.id === "signals") {
        readouts[index].textContent = index === 0
          ? `${input.value}%`
          : `${(2+Number(input.value)*.08).toFixed(1)} m`;
      } else if(lesson.id === "sensor") {
        readouts[index].textContent = `${input.value}%`;
      } else if(lesson.id === "feedback") {
        readouts[index].textContent = index === 0
          ? `${input.value}%`
          : `${(.1+Number(input.value)*.03).toFixed(1)} s`;
      } else readouts[index].textContent=input.value;
    };
    const renderer=setupCanvas(canvas,(ctx,w,h)=>drawScene(ctx,w,h,lesson,(Number(a.value)+Number(b.value))/200,motion,Number(a.value),Number(b.value)));
    const redraw=()=>renderer.redraw();
    values.forEach((input,i)=>input.addEventListener("input",()=>{
      showControlValue(input,i);setRangeProgress(input);
      if(lesson.id === "series-parallel") {
        stop();motion=0;
        root.querySelector(".match").textContent=Number(b.value)>=23?"2 / 2":"0 / 2";
      }
      if(lesson.id === "electromagnet") { stop();motion=0; }
      if(lesson.id === "solar") { stop();motion=0; }
      if(lesson.id === "signals") { stop();motion=0; }
      if(lesson.id === "sensor") { stop();motion=0;root.querySelector(".match").textContent="30%"; }
      if(lesson.id === "feedback") { stop();motion=0; }
      if(lesson.id === "feedback") root.querySelector(".match").textContent=`${Math.round(Number(a.value)*(1-.8*Number(b.value)/100))}%`;
      redraw();
    }));
    values.forEach(showControlValue);
    values.forEach(setRangeProgress);
    if(lesson.id === "series-parallel") root.querySelector(".match").textContent=Number(initialB)>=23?"2 / 2":"0 / 2";
    if(lesson.id === "feedback") root.querySelector(".match").textContent=`${Math.round(Number(a.value)*(1-.8*Number(b.value)/100))}%`;
    const run=root.querySelector(".run-btn"), feedback=root.querySelector(".extension-feedback");
    if(lesson.id === "sensor") { run.innerHTML="WATER PLANT <span aria-hidden=\"true\">▶</span>";feedback.textContent="Set the dryness trigger to 70% or lower, then add at least 56% water.";root.querySelector(".match").textContent="30%"; }
    if(lesson.id === "feedback") { run.innerHTML="BALANCE ROBOT <span aria-hidden=\"true\">▶</span>";feedback.textContent="Increase correction strength and reduce delay, then test the balance."; }
    const stop=()=>{active=false;cancelAnimationFrame(raf);};
    run.addEventListener("click",()=>{
      stop(); runs++; root.querySelector(".runs").textContent=runs;
      const gravityFall = Number(a.value) / 100 * (1 - 0.8 * Number(b.value) / 100);
      const mass = 1 + Number(a.value) / 20;
      const push = Number(b.value) / 10;
      // A 1.5 second push: distance = 1/2 × (force / mass) × time².
      const momentumDistance = 0.5 * (push / mass) * 1.5 * 1.5;
      const momentumMatch = Math.max(0, 100 - Math.abs(momentumDistance - 4.5) * 40);
      const archStability = Number(b.value) * (1 - 0.35 * Number(a.value) / 100);
      const towerStability = Number(b.value) * (1 - 0.45 * Number(a.value) / 100);
      const beamCapacity = Number(a.value) * (1 - 0.55 * Number(b.value) / 100);
      const thermalExpansion = Number(a.value)*.144;
      const thermalGap = Number(b.value)*.18;
      const gapError = thermalGap-thermalExpansion;
      const thermalScore = clamp(100-Math.max(0,-gapError)*18-Math.max(0,gapError-5)*10,0,100);
      const objectDensity = 600 + Number(a.value)*15;
      const waterDensity = 800 + Number(b.value)*4;
      const densityDifference = Math.abs(objectDensity-waterDensity);
      const densityScore = clamp(100-densityDifference*.45,0,100);
      const diveDepth = Number(a.value);
      const waterPressure = 1 + diveDepth/10;
      const hullRating = 2 + Number(b.value)*.1;
      const pressureMargin = hullRating-waterPressure;
      const pressureScore = clamp(100+pressureMargin*15,0,100);
      const wheelFlow = Number(a.value)/100;
      const wheelAim = Math.abs(Number(b.value)-50)/50;
      const wheelPower = wheelFlow*wheelFlow*(1-wheelAim)*100;
      const circuitParallel = Number(a.value)>=50;
      const batteryVoltage = 1.5+Number(b.value)*.09;
      const bulbsLit = batteryVoltage>=3.5 ? (circuitParallel?1:0) : 0;
      const magneticStrength = (.15+.85*Number(a.value)/100)*Number(b.value);
      const solarTilt = Number(a.value)*.9;
      const solarCloud = Number(b.value)/100;
      const solarAlignment = Math.max(0,Math.cos((solarTilt-45)*Math.PI/180));
      const solarOutput = solarAlignment*(1-.9*solarCloud)*100;
      const relayPower = Number(a.value);
      const relayHeight = 2+Number(b.value)*.08;
      const relayClear = Number(b.value)>=60;
      const signalAtRover = relayClear?Math.max(0,relayPower-20):0;
      const soilDryness=70, sensorTriggered=soilDryness>=Number(a.value);
      const soilMoisture=sensorTriggered?Math.min(100,100-Math.max(0,soilDryness-Number(b.value)*.8)):30;
      const balanceResponse=Number(a.value)*(1-.8*Number(b.value)/100);
      const score=lesson.id === "gravity"
        ? Math.round(gravityFall * 100)
        : lesson.id === "momentum" ? Math.round(momentumMatch)
        : lesson.id === "arches" ? Math.round(archStability)
        : lesson.id === "tower-wind" ? Math.round(towerStability)
        : lesson.id === "thermal" ? Math.round(thermalScore)
        : lesson.id === "material-match" ? Math.round(beamCapacity)
        : lesson.id === "density" ? Math.round(densityScore)
        : lesson.id === "water-pressure" ? Math.round(pressureScore)
        : lesson.id === "water-wheel" ? Math.round(wheelPower)
        : lesson.id === "series-parallel" ? bulbsLit*100
        : lesson.id === "electromagnet" ? Math.round(magneticStrength)
        : lesson.id === "solar" ? Math.round(solarOutput)
        : lesson.id === "signals" ? Math.round(signalAtRover)
        : lesson.id === "sensor" ? Math.round(soilMoisture)
        : lesson.id === "feedback" ? Math.round(balanceResponse)
        : Math.round(100-Math.min(100,(Math.abs(Number(a.value)-lesson.ideal)+Math.abs(Number(b.value)-(100-lesson.ideal)))*.9));
      root.querySelector(".match").textContent = lesson.id === "water-pressure"
        ? `${pressureMargin>=0?"+":""}${pressureMargin.toFixed(1)} atm`
        : lesson.id === "series-parallel" ? `${bulbsLit} / 2`
        : lesson.id === "sensor" ? `${Math.round(soilMoisture)}%`
        : `${score}%`;
      if (lesson.id === "gravity") {
        feedback.textContent = gravityFall >= .92
          ? `Landed in the pad! Gravity carried the capsule ${Math.round(gravityFall*100)}% of the way down.`
          : `The capsule fell ${Math.round(gravityFall*100)}% of the way. Increase gravity or reduce air drag.`;
      } else if (lesson.id === "arches") {
        feedback.textContent = archStability >= 74
          ? `Strong arch! The wide supports hold the load (${Math.round(archStability)} support points).`
          : Number(b.value) < 74
            ? "The arch pushes outward at its feet. Widen the supports to catch that force."
            : "This arch is too tall for its supports. Lower the arch to steady the load.";
      } else if (lesson.id === "tower-wind") {
        feedback.textContent = towerStability >= 72
          ? `The tower stayed upright in the gust. Stability: ${Math.round(towerStability)}%.`
          : Number(b.value) < 72
            ? "The tower is tipping. Widen the base to resist the wind."
            : "The tall tower wobbles in the gust. Lower its height to steady it.";
      } else if (lesson.id === "thermal") {
        feedback.textContent = gapError < 0
          ? `The bridge needs ${Math.abs(gapError).toFixed(1)} mm more room and buckles as it warms.`
          : gapError > 5
            ? `The joint has ${gapError.toFixed(1)} mm left over. Reduce the gap to fit the expansion.`
            : `Good fit! The bridge expands ${thermalExpansion.toFixed(1)} mm and the joint leaves ${gapError.toFixed(1)} mm.`;
      } else if (lesson.id === "material-match") {
        feedback.textContent = beamCapacity >= 65
          ? `Good choice! The ${Number(b.value)<35?"light":"strong"} beam held all 3 blocks.`
          : Number(a.value) < 65
            ? "The beam bends under the blocks. Choose a stronger material."
            : "The heavy beam sags under its own load. Try a lighter material.";
      } else if (lesson.id === "density") {
        feedback.textContent = densityDifference <= 40
          ? `Neutral buoyancy! The object hovers because the densities are within ${Math.round(densityDifference)} kg/m³.`
          : objectDensity < waterDensity
            ? `The object rises because it is ${Math.round(densityDifference)} kg/m³ less dense than the water.`
            : `The object sinks because it is ${Math.round(densityDifference)} kg/m³ more dense than the water.`;
      } else if (lesson.id === "water-pressure") {
        feedback.textContent = pressureMargin >= 0
          ? `Safe dive! The hull is rated for ${hullRating.toFixed(1)} atm; pressure at ${diveDepth} m is ${waterPressure.toFixed(1)} atm.`
          : `At ${diveDepth} m, pressure reaches ${waterPressure.toFixed(1)} atm. The hull holds ${hullRating.toFixed(1)} atm; reduce depth or strengthen it.`;
      } else if (lesson.id === "water-wheel") {
        feedback.textContent = wheelPower >= 65
          ? `Great aim! The stream spins the wheel and lights the lamp (${Math.round(wheelPower)}% power).`
          : wheelAim > .45
            ? `${Number(b.value)<50?"The stream aims too high":"The stream aims too low"}. Adjust Aim toward the wheel's center.`
            : "The stream hits the wheel, but needs more speed to light the lamp.";
      } else if (lesson.id === "series-parallel") {
        feedback.textContent = batteryVoltage<3.5
          ? "The battery is too weak to light the bulbs. Increase its voltage."
          : circuitParallel
            ? "The first bulb is removed, but its parallel branch leaves the other bulb lit."
            : "Removing either bulb opens the series path, so both bulbs go out. Add a second branch.";
      } else if (lesson.id === "electromagnet") {
        feedback.textContent = magneticStrength >= 65
          ? "Strong field! The energized coil lifted all three iron clips."
          : Number(b.value) < 55
            ? "The magnetic field is weak. Increase the current through the coil."
            : "Add more turns of wire around the iron core to strengthen the field.";
      } else if (lesson.id === "solar") {
        feedback.textContent = solarOutput >= 65
          ? `Great tracking! Direct sunlight charged the rover to ${Math.round(solarOutput)}%.`
          : solarAlignment < .72
            ? "The panel is angled away from the sun. Tilt it closer to 45°."
            : "Clouds are blocking the sunlight. Reduce cloud cover to charge faster.";
      } else if (lesson.id === "signals") {
        feedback.textContent = !relayClear
          ? `The relay is below the ridge at ${relayHeight.toFixed(1)} m. Raise it to at least 6.8 m for a clear view.`
          : signalAtRover<45
            ? `The message reaches the relay, but signal at the rover is only ${Math.round(signalAtRover)}%. Increase Signal power to at least 65%.`
            : `Message delivered! The relay cleared the ridge and the rover received ${Math.round(signalAtRover)}% signal.`;
      } else if (lesson.id === "sensor") {
        feedback.textContent = !sensorTriggered
          ? "The soil is dry, but the trigger is set too high. Set it to 70% or lower so the pump starts."
          : Number(b.value)<56
            ? `The pump turned on, but soil moisture reached only ${Math.round(soilMoisture)}%. Increase Water amount to at least 56%.`
            : `The sensor triggered the pump and soil moisture reached ${Math.round(soilMoisture)}%. The plant is watered.`;
      } else if (lesson.id === "feedback") {
        feedback.textContent = balanceResponse >= 65
          ? `The robot settled upright with ${Math.round(balanceResponse)}% response.`
          : Number(b.value)>50
            ? "The robot reacts too late and keeps wobbling. Reduce the delay."
            : "The robot cannot correct its tilt strongly enough. Increase correction strength.";
      } else if (lesson.id === "momentum") {
        feedback.textContent = momentumDistance < 4.05
          ? `Short run: ${momentumDistance.toFixed(1)} m. Add push or reduce the cart mass.`
          : momentumDistance > 4.95
            ? `Long run: ${momentumDistance.toFixed(1)} m. Ease the push or add mass.`
            : `On target: ${momentumDistance.toFixed(1)} m. The cart stopped in the goal zone!`;
      } else {
        feedback.textContent=score>=82?"Great design! Your test reached the target.":score>=58?"Close! Notice what changed, then tune one control.":"The result missed the target. Try a different balance.";
      }
      const passed=lesson.id === "gravity" ? gravityFall >= .92
        : lesson.id === "arches" ? archStability >= 74
        : lesson.id === "tower-wind" ? towerStability >= 72
        : lesson.id === "thermal" ? gapError >= 0 && gapError <= 5
        : lesson.id === "material-match" ? beamCapacity >= 65
        : lesson.id === "density" ? densityDifference <= 40
        : lesson.id === "water-pressure" ? pressureMargin >= 0
        : lesson.id === "water-wheel" ? wheelPower >= 65
        : lesson.id === "series-parallel" ? circuitParallel && batteryVoltage>=3.5
        : lesson.id === "electromagnet" ? magneticStrength>=65
        : lesson.id === "solar" ? solarOutput>=65
        : lesson.id === "signals" ? relayClear&&signalAtRover>=45
        : lesson.id === "sensor" ? sensorTriggered&&Number(b.value)>=56
        : lesson.id === "feedback" ? balanceResponse>=65
        : score >= 82;
      feedback.classList.toggle("good",passed);
      root.querySelector(".extension-scene").classList.remove("testing"); void root.offsetWidth; root.querySelector(".extension-scene").classList.add("testing");
      active=true; const start=performance.now();
      const travel = ["density","water-pressure","water-wheel","series-parallel","electromagnet","solar","signals","sensor","feedback"].includes(lesson.id) ? 1
        : lesson.id === "gravity"
        ? gravityFall
        : lesson.id === "momentum"
        ? clamp(momentumDistance / 4.5, 0.18, 1.22)
        : passed ? 1 : Math.max(0.25, score / 100 * 0.82);
      const animate=(now)=>{
        if(!active)return;
        const progress=Math.min(1,(now-start)/1250);
        motion=travel*(1-Math.pow(1-progress,3));
        redraw();
        if(progress<1) raf=requestAnimationFrame(animate);
        else if(passed) api.complete(lesson.id === "gravity"
          ? "The capsule landed safely in the pad!"
          : lesson.id === "arches" ? "Your arch spread the load into its supports!"
          : lesson.id === "tower-wind" ? "Your tower stayed upright in the wind!"
          : lesson.id === "thermal" ? "Your expansion joint gave the warm bridge room to grow!"
          : lesson.id === "material-match" ? "You chose a light, strong beam that carried the load!"
          : lesson.id === "density" ? "Your object reached neutral buoyancy and hovered!"
          : lesson.id === "water-pressure" ? "Your submarine reached the chosen depth safely!"
          : lesson.id === "water-wheel" ? "You sent enough water energy through the wheel to light the lamp!"
          : lesson.id === "series-parallel" ? "The parallel circuit kept one bulb lit after the other was removed!"
          : lesson.id === "electromagnet" ? "Your electromagnet lifted all three iron clips!"
          : lesson.id === "solar" ? "Your panel charged the rover with sunlight!"
          : lesson.id === "signals" ? "The relay delivered your message to the rover!"
          : lesson.id === "sensor" ? "The sensor activated the pump and restored the plant!"
          : lesson.id === "feedback" ? "Your feedback settings kept the robot balanced!"
          : "You tuned the experiment and reached the target!");
      };
      raf=requestAnimationFrame(animate); api.sfx.play("launch");
    });
    root.querySelector(".mini-btn").addEventListener("click",()=>{stop();motion=0;runs=0;a.value=initialA;b.value=initialB;values.forEach((el,i)=>{showControlValue(el,i);setRangeProgress(el)});root.querySelector(".runs").textContent="0";root.querySelector(".match").textContent=lesson.id === "series-parallel"?(Number(initialB)>=23?"2 / 2":"0 / 2"):lesson.id === "sensor"?"30%":lesson.id === "feedback"?`${Math.round(Number(initialA)*(1-.8*Number(initialB)/100))}%`:"50%";feedback.textContent=lesson.id === "sensor"?"Set the dryness trigger to 70% or lower, then add at least 56% water.":lesson.id === "series-parallel"?"Set Branches to 2 · Parallel, then press REMOVE BULB A.":lesson.id === "feedback"?"Increase correction strength and reduce delay, then test the balance.":"Change a control, then run your test.";feedback.classList.remove("good");redraw();});
    return { destroy(){stop();renderer.destroy();} };
  },
}));

export default extensionLabs;
