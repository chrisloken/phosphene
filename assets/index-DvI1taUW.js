(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function t(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(o){if(o.ep)return;o.ep=!0;const a=t(o);fetch(o.href,a)}})();function Ve(e,n,t){return Math.min(t,Math.max(n,e))}function Ze(e,n){const t=Math.floor(e.sampleRate*n),r=e.createBuffer(1,t,e.sampleRate),o=r.getChannelData(0);let a=0;for(let l=0;l<t;l++){const v=Math.random()*2-1;a=Ve(a+v*.02,-1,1),o[l]=v*.72+a*.28}return r}function et(){let e=null,n=null,t=null,r=null,o=null,a=null,l=null,v=!1,d=!1,c="idle",h=0,E=0,f=0,m=null,g=null;const A={get muted(){return d},get micStatus(){return c},async start(){if(v){await e?.resume();return}const i=new AudioContext;e=i,await i.resume(),n=i.createGain(),n.gain.value=0;const x=i.createDynamicsCompressor();x.threshold.value=-6,x.knee.value=6,x.ratio.value=2.2,x.attack.value=.003,x.release.value=.22,t=i.createGain(),t.gain.value=d?0:1,r=i.createMediaStreamDestination(),n.connect(x),x.connect(t),t.connect(i.destination),x.connect(r);const s=i.createGain();s.gain.value=.78;const u=i.createBiquadFilter();u.type="lowpass",u.frequency.value=1400,u.Q.value=.55,s.connect(u),u.connect(n);const p=i.createOscillator();p.type="sine",p.frequency.value=.037;const y=i.createGain();y.gain.value=420,p.connect(y),y.connect(u.frequency),p.start();const R=i.createOscillator();R.type="sine",R.frequency.value=.08;const P=i.createGain();P.gain.value=.1,R.connect(P),P.connect(s.gain),R.start();const W=[55,82.41,110,164.81,220,329.63],z=["sine","sine","triangle","sine","sine","triangle"];W.forEach((Je,j)=>{const K=i.createOscillator();K.type=z[j]??"sine",K.frequency.value=Je,K.detune.value=(j%2===0?-5:6)+j;const ge=i.createGain();ge.gain.value=j<3?.65:.4;const ue=i.createOscillator();ue.type="sine",ue.frequency.value=.05+j*.011;const Ee=i.createGain();Ee.gain.value=6+j,ue.connect(Ee),Ee.connect(K.detune),K.connect(ge),ge.connect(s),K.start(),ue.start()});const b=i.createBufferSource();b.buffer=Ze(i,3),b.loop=!0;const L=i.createBiquadFilter();L.type="lowpass",L.frequency.value=140;const M=i.createGain();M.gain.value=.26,b.connect(L),L.connect(M),M.connect(n);const S=i.createBiquadFilter();S.type="highpass",S.frequency.value=7200;const U=i.createGain();U.gain.value=.16,b.connect(S),S.connect(U),U.connect(n);const D=i.createBiquadFilter();D.type="bandpass",D.frequency.value=2400,D.Q.value=1.4;const N=i.createGain();N.gain.value=1e-4,b.connect(D),D.connect(N),N.connect(n);const X=i.createBiquadFilter();X.type="bandpass",X.frequency.value=1600,X.Q.value=2.2;const le=i.createGain();le.gain.value=1e-4,b.connect(X),X.connect(le),le.connect(n),b.start(),m=N,g=le;const te=i.currentTime;n.gain.setValueAtTime(0,te),n.gain.linearRampToValueAtTime(d?0:1,te+1.2),v=!0,h=te+3+Math.random()*5,E=te+.2,f=te+4+Math.random()*4},async startMic(){if((!e||!n)&&await A.start(),!e||!n)return c="missing",c;if(c==="live")return c;if(!navigator.mediaDevices?.getUserMedia)return c="missing",c;try{const i=await navigator.mediaDevices.getUserMedia({video:!1,audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1}}),x=e.createMediaStreamSource(i),s=e.createBiquadFilter();s.type="highpass",s.frequency.value=90,a=e.createAnalyser(),a.fftSize=1024,a.smoothingTimeConstant=.6,l=new Float32Array(new ArrayBuffer(a.fftSize*4)),o=e.createGain(),o.gain.value=1;const u=e.createDelay(4);u.delayTime.value=1.72;const p=e.createBiquadFilter();p.type="lowpass",p.frequency.value=1800,p.Q.value=.4;const y=e.createGain();y.gain.value=.62;const R=e.createGain();R.gain.value=1.15;const P=e.createGain();return P.gain.value=1,x.connect(s),s.connect(a),a.connect(o),o.connect(u),o.connect(P),u.connect(p),p.connect(y),y.connect(u),u.connect(R),R.connect(n),P.connect(n),c="live",c}catch(i){const x=i instanceof DOMException?i.name:"";return c=x==="NotAllowedError"||x==="PermissionDeniedError"?"denied":"missing",c}},tick(){if(!e||!n||!v)return 0;const i=e.currentTime;if(m)for(;E<i+.05;){const x=.38+Math.random()*.37,s=.006+Math.random()*.03;m.gain.setValueAtTime(1e-4,E),m.gain.linearRampToValueAtTime(x,E+.001),m.gain.exponentialRampToValueAtTime(1e-4,E+s),E+=.08+Math.random()*.9}if(g&&i>=f){const x=.05+Math.random()*.12;g.gain.cancelScheduledValues(i),g.gain.setValueAtTime(1e-4,i),g.gain.linearRampToValueAtTime(.45+Math.random()*.3,i+.01),g.gain.exponentialRampToValueAtTime(1e-4,i+x),f=i+4+Math.random()*8}return i>=h&&(pe(e,n,i),h=i+3+Math.random()*8),ye()},toggleMuted(){return d=!d,t&&e&&(t.gain.cancelScheduledValues(e.currentTime),t.gain.setTargetAtTime(d?0:1,e.currentTime,.08)),d},captureStream(){return r?.stream??null}};function pe(i,x,s){const u=i.createOscillator();u.type=Math.random()>.5?"square":"sawtooth",u.frequency.value=120+Math.random()*1400;const p=i.createGain();p.gain.setValueAtTime(1e-4,s),p.gain.linearRampToValueAtTime(.4+Math.random()*.3,s+.004),p.gain.exponentialRampToValueAtTime(1e-4,s+.03+Math.random()*.07);const y=i.createWaveShaper();y.curve=tt(),u.connect(y),y.connect(p),p.connect(x),u.start(s),u.stop(s+.16)}function ye(){if(!a||!e||!l)return 0;a.getFloatTimeDomainData(l);let i=0;for(let s=0;s<l.length;s++){const u=l[s];i+=u*u}const x=Math.sqrt(i/l.length);return Ve(x*4,0,1)}return A}function tt(){const n=new Float32Array(new ArrayBuffer(1024)),t=6;for(let r=0;r<256;r++){const o=r/255*2-1;n[r]=Math.round(o*t)/t}return n}const Fe={width:{ideal:1280},height:{ideal:720}};async function nt(){try{return await navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:{exact:"environment"},...Fe}})}catch{return await navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:{ideal:"environment"},...Fe}})}}function rt(){const e=document.createElement("video");e.setAttribute("playsinline","true"),e.setAttribute("webkit-playsinline","true"),e.muted=!0,e.autoplay=!0,e.playsInline=!0;let n=null;const t={video:e,get stream(){return n},status:"idle",error:null,facingMode:null,mirror:!1,async start(){if(t.status==="live")return t.status;if(!navigator.mediaDevices?.getUserMedia)return t.status="missing",t.error="This browser cannot open a camera.",t.status;t.status="requesting",t.error=null;try{n=await nt();const o=n.getVideoTracks()[0]?.getSettings().facingMode??null;return t.facingMode=o,t.mirror=o==="user",e.srcObject=n,await e.play(),t.status="live",t.status}catch(r){const o=r instanceof DOMException?r.name:"";return o==="NotAllowedError"||o==="PermissionDeniedError"?(t.status="denied",t.error="Camera blocked — eyelids stay closed."):o==="NotFoundError"||o==="DevicesNotFoundError"?(t.status="missing",t.error="No camera found. Phosphene keeps running closed-eye."):(t.status="missing",t.error="Camera could not open. Phosphene keeps running closed-eye."),t.status}},stop(){n?.getTracks().forEach(r=>r.stop()),n=null,e.srcObject=null,t.status="idle",t.facingMode=null,t.mirror=!1}};return t}const ot="modulepreload",at=function(e){return"/phosphene/"+e},Ue={},it=function(n,t,r){let o=Promise.resolve();if(t&&t.length>0){let c=function(h){return Promise.all(h.map(E=>Promise.resolve(E).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};var l=c;document.getElementsByTagName("link");const v=document.querySelector("meta[property=csp-nonce]"),d=v?.nonce||v?.getAttribute("nonce");o=c(t.map(h=>{if(h=at(h),h in Ue)return;Ue[h]=!0;const E=h.endsWith(".css"),f=E?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${h}"]${f}`))return;const m=document.createElement("link");if(m.rel=E?"stylesheet":ot,E||(m.as="script"),m.crossOrigin="",m.href=h,d&&m.setAttribute("nonce",d),document.head.appendChild(m),E)return new Promise((g,A)=>{m.addEventListener("load",g),m.addEventListener("error",()=>A(new Error(`Unable to preload CSS for ${h}`)))})}))}function a(v){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=v,window.dispatchEvent(d),!d.defaultPrevented)throw v}return o.then(v=>{for(const d of v||[])d.status==="rejected"&&a(d.reason);return n().catch(a)})};function ce(){return new URLSearchParams(location.search)}function ct(){const e=ce().get("view")??ce().get("mode");return e==="watch"||e==="remote"||location.hash.replace(/^#/,"")==="watch"?"watch":"play"}function st(){return(ce().get("room")??"phosphene").toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,32)||"phosphene"}function lt(){const e=ce();return e.set("view","watch"),`./?${e.toString()}`}function ut(){const e=ce();e.delete("view"),e.delete("mode");const n=e.toString();return n?`./?${n}`:"./"}const ft="phosphene-chrisloken",xe={role:"session"};function mt(e){if(!e||typeof e!="object")return!1;const n=e;return typeof n.time=="number"&&typeof n.mode=="number"}function dt(e){return!!(e&&typeof e=="object"&&(e.role==="session"||e.role==="watch"))}async function ht(e){const n={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun.cloudflare.com:3478"}]},{joinRoom:t}=await it(async()=>{const{joinRoom:r}=await import("./index-C_nUyA1c.js");return{joinRoom:r}},[]);return t({appId:ft,rtcConfig:n},e)}function vt(e,n,t){let r=null,o=null,a=null,l=!1,v=!1;const d=new Map,c={status:"idle",error:null,livePeerId:null,remoteStream:null,remoteFrame:null,async start(){if(l)return;l=!0,c.status="waiting",c.error=null,t();try{r=await ht(n)}catch(f){c.status="error",c.error=f instanceof Error?f.message:"Could not open the remote room.",t();return}const h=r.makeAction("hello"),E=r.makeAction("frame");o=E,h.send({role:e}).catch(()=>{}),h.onMessage=(f,{peerId:m})=>{dt(f)&&(d.set(m,f.role),e==="watch"&&f.role==="session"&&(c.livePeerId=m,c.status="live",t()),e==="session"&&f.role==="watch"&&(c.status="live",t()))},E.onMessage=(f,{peerId:m})=>{if(e!=="watch"||!mt(f))return;const g=c.status!=="live",A=c.remoteFrame?.mode!==f.mode;c.livePeerId=m,c.remoteFrame=f,c.status="live",(g||A)&&t()},r.onPeerJoin=f=>{h.send({role:e},{target:f}).catch(()=>{}),e==="session"&&a&&r?.addStream(a,{target:f,metadata:xe}),e==="session"&&c.remoteFrame&&E.send(c.remoteFrame,{target:f}).catch(()=>{})},r.onPeerLeave=f=>{if(d.delete(f),c.livePeerId===f){c.livePeerId=null,c.remoteStream=null,c.remoteFrame=null;const m=[...d.entries()].find(([,g])=>g==="session");c.status=m?"live":"waiting",m&&(c.livePeerId=m[0]),t()}},r.onPeerStream=(f,m,g)=>{if(e!=="watch")return;const A=g&&typeof g=="object"&&!Array.isArray(g)?g.role:null;A&&A!=="session"||(c.livePeerId=m,c.remoteStream=f,c.status="live",t())},r.onPeerTrack=(f,m,g)=>{e==="watch"&&(c.livePeerId=g,c.remoteStream=m,c.status="live",t())},t()},publish(h){a=h,!(!r||e!=="session"||v)&&(v=!0,r.addStream(h,{metadata:xe}))},addTrack(h,E){a=E,!(!r||e!=="session")&&r.addTrack(h,E,{metadata:xe})},sendFrame(h){e!=="session"||!o||(c.remoteFrame=h,o.send(h))},leave(){r?.leave(),r=null,l=!1,c.status="idle",c.livePeerId=null,c.remoteStream=null,c.remoteFrame=null}};return c}const B=48,$=32;function C(e,n,t){return Math.min(t,Math.max(n,e))}function we(e,n,t){return e+(n-e)*t}function pt(){const e=document.createElement("canvas");e.width=B,e.height=$;const n=e.getContext("2d",{willReadFrequently:!0}),t=new Float32Array(B*$);let r=!1,o=0,a=0,l=0,v=0,d=null,c=null,h=0,E=0,f=0,m=0,g=0,A=0;const pe=s=>{s.gamma==null||s.beta==null||(v=performance.now(),(d==null||c==null)&&(d=s.gamma,c=s.beta),o=C((s.gamma-d)/28,-1,1),a=C((s.beta-c)/32,-1,1))},ye=s=>{const u=s.accelerationIncludingGravity;if(!u)return;const p=Math.hypot(u.x??0,u.y??0,u.z??0);l=C((p-9.6)/8,0,1)},i=s=>{const u=Math.max(window.innerWidth,1),p=Math.max(window.innerHeight,1);h=C(s.clientX/u*2-1,-1,1),E=C(s.clientY/p*2-1,-1,1),f=performance.now()};window.addEventListener("deviceorientation",pe),window.addEventListener("devicemotion",ye),window.addEventListener("pointermove",i,{passive:!0});function x(s,u){if(!n||s.readyState<2)return{x:0,y:0,mag:0};n.drawImage(s,0,0,B,$);const p=n.getImageData(0,0,B,$).data,y=new Float32Array(B*$);for(let M=0,S=0;M<y.length;M++,S+=4)y[M]=(p[S]*.2126+p[S+1]*.7152+p[S+2]*.0722)/255;if(!r)return t.set(y),r=!0,{x:0,y:0,mag:0};let R=0,P=0,W=0,z=0;for(let M=1;M<$-1;M++)for(let S=1;S<B-1;S++){const U=M*B+S,D=(y[U+1]-y[U-1])*.5,N=(y[U+B]-y[U-B])*.5,X=y[U]-t[U];R+=-D*X,P+=D*D,W+=-N*X,z+=N*N}t.set(y);let b=R/(P+1e-4),L=W/(z+1e-4);return u&&(b=-b),b=C(b/2.4,-1,1),L=C(L/2.4,-1,1),{x:b,y:L,mag:C(Math.hypot(b,L),0,1)}}return{async requestAccess(){const s=DeviceOrientationEvent,u=DeviceMotionEvent;try{typeof s.requestPermission=="function"&&await s.requestPermission()}catch{}try{typeof u.requestPermission=="function"&&await u.requestPermission()}catch{}d=null,c=null},sample(s,u){const p=performance.now(),y=s?x(s,u):{x:0,y:0,mag:0},R=p-v<900,P=!R&&p-f<1200,W=C((R?o:0)*.85+y.x*.55+(P?h*.35:0),-1,1),z=C((R?a:0)*.85+y.y*.55+(P?E*.35:0),-1,1);m=we(m,W,.12),g=we(g,z,.12);const b=C(y.mag*.85+l*.7+Math.hypot(m,g)*.2,0,1);return A=we(A,b,.18),l*=.9,{panX:m,panY:g,energy:A}}}}const k=[{id:"armature",name:"Armature",index:"01",note:"Iridescent matter in a black cage — neon halo, dichroic film."},{id:"cubic",name:"Cubic",index:"02",note:"Extruded grid. Wireframe rooms stacking and slipping."},{id:"transmission",name:"Transmission",index:"03",note:"Scanlines, punch cards, dropped signal between stations."},{id:"static",name:"Static",index:"04",note:"Psychedelic dead air. Afterimage as corrupted broadcast."},{id:"undone",name:"Undone",index:"05",note:"Architecture glitch — shatter, neon lightning, collapse/build."}];function _e(e,n,t){const r=e.createShader(n);if(!r)throw new Error("Could not create shader.");if(e.shaderSource(r,t),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){const o=e.getShaderInfoLog(r)??"unknown error";throw e.deleteShader(r),new Error(`Shader compile failed:
${o}`)}return r}function ke(e,n,t){const r=_e(e,e.VERTEX_SHADER,n),o=_e(e,e.FRAGMENT_SHADER,t),a=e.createProgram();if(!a)throw new Error("Could not create program.");if(e.attachShader(a,r),e.attachShader(a,o),e.linkProgram(a),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(a,e.LINK_STATUS)){const l=e.getProgramInfoLog(a)??"unknown error";throw e.deleteProgram(a),new Error(`Program link failed:
${l}`)}return a}function fe(e,n,t){const r=e.createTexture(),o=e.createFramebuffer();if(!r||!o)throw new Error("Could not create framebuffer target.");return e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,n,t,0,e.RGBA,e.HALF_FLOAT,null),e.bindFramebuffer(e.FRAMEBUFFER,o),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE&&(e.bindTexture(e.TEXTURE_2D,r),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,n,t,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,o),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0)),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindTexture(e.TEXTURE_2D,null),{framebuffer:o,texture:r,width:n,height:t}}function Le(e,n){e.deleteFramebuffer(n.framebuffer),e.deleteTexture(n.texture)}function yt(e){const n=e.createTexture();if(!n)throw new Error("Could not create camera texture.");e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const t=new Uint8Array([8,6,10,255]);return e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,t),e.bindTexture(e.TEXTURE_2D,null),n}const De=`#version 300 es

const vec2 POS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2(3.0, -1.0),
  vec2(-1.0, 3.0)
);

out vec2 vUv;

void main() {
  vec2 p = POS[gl_VertexID];
  gl_Position = vec4(p, 0.0, 1.0);
  vUv = p * 0.5 + 0.5;
}
`,gt=`#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uCamera;
uniform sampler2D uPrev;
uniform vec2 uResolution;
uniform vec2 uCameraSize;
uniform float uTime;
uniform float uMode;
uniform float uIntensity;
uniform float uHold;
uniform float uHasCamera;
uniform float uMirror;
uniform vec2 uPan;
uniform float uEnergy;

const vec3 MAG = vec3(1.0, 0.04, 0.72);
const vec3 CYN = vec3(0.0, 0.92, 1.0);
const vec3 ORG = vec3(1.0, 0.34, 0.06);
const vec3 WHT = vec3(0.94, 0.96, 1.0);
const vec3 INK = vec3(0.0);

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.11 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

vec2 coverUv(vec2 uv, vec2 content, vec2 frame) {
  float ca = content.x / max(content.y, 1.0);
  float ra = frame.x / max(frame.y, 1.0);
  vec2 st = uv;
  if (ca > ra) {
    float s = ra / ca;
    st.x = (uv.x - 0.5) / s + 0.5;
  } else {
    float s = ca / ra;
    st.y = (uv.y - 0.5) / s + 0.5;
  }
  st.x = mix(st.x, 1.0 - st.x, uMirror);
  return st;
}

vec3 sampleCamera(vec2 uv) {
  if (uHasCamera < 0.5) {
    return INK;
  }
  vec2 st = coverUv(uv, uCameraSize, uResolution);
  if (st.x < 0.0 || st.x > 1.0 || st.y < 0.0 || st.y > 1.0) {
    return INK;
  }
  return texture(uCamera, st).rgb;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

vec2 shearUv(vec2 uv, float t, float hold) {
  float jitter = hold + uEnergy * 0.85;
  float row = floor(uv.y * (28.0 + 40.0 * jitter));
  float h = hash21(vec2(row, floor(t * 7.0)));
  if (h > 0.86 - jitter * 0.1) {
    uv.x += (h - 0.93) * (0.18 + jitter * 0.22);
  }
  vec2 block = floor(uv * vec2(16.0, 10.0));
  float b = hash21(block + floor(t * 3.0));
  if (b > 0.955 - jitter * 0.04) {
    uv.x = fract(uv.x + 0.12 + 0.2 * hash21(block + 3.2));
  }
  return uv;
}

vec3 iridescent(float n) {
  return mix(MAG, mix(CYN, mix(ORG, WHT, step(0.75, n)), step(0.45, n)), step(0.22, n));
}

vec3 armature(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  p -= uPan * 0.12;
  float L = luma(cam);
  float r = length(p);
  float ring = abs(r - mix(0.18, 0.28, hold));
  float halo = smoothstep(0.028, 0.0, ring);
  float n = fbm(p * 3.2 + t * 0.15);
  vec3 film = iridescent(n + L * 0.35);
  vec3 col = INK;
  col += film * pow(n, 2.2) * (0.45 + L * 0.7);
  col += CYN * halo * (0.85 + 0.4 * sin(t * 2.2));
  col += MAG * halo * 0.25;
  col += cam * vec3(0.55, 0.2, 0.85) * uHasCamera * 0.55;
  float grid = max(
    step(0.97, fract(p.x * 4.0)),
    step(0.97, fract(p.y * 4.0))
  );
  col += WHT * grid * 0.12;
  col *= 0.35 + 0.65 * smoothstep(0.95, 0.2, r);
  return col;
}

vec3 cubic(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  p -= uPan * 0.18;
  float L = luma(cam);
  float scale = mix(3.4, 5.6, hold);
  vec2 q = p * scale;
  q += 0.15 * vec2(sin(t * 0.3), cos(t * 0.27));
  vec2 id = floor(q);
  vec2 f = fract(q) - 0.5;
  float box = max(abs(f.x), abs(f.y));
  float wire = smoothstep(0.04, 0.0, abs(box - 0.42));
  float dash = step(0.45, fract(atan(f.y, f.x) * 3.0 + t));
  float n = hash21(id + floor(t * 0.5));
  vec3 fill = mix(INK, cam * 1.2, uHasCamera);
  fill = mix(fill, iridescent(n), 0.35 * n);
  vec3 col = mix(INK, fill, step(box, 0.42) * (0.18 + L * 0.45 + n * 0.2));
  col += mix(WHT, CYN, n) * wire * (0.7 + dash * 0.5);
  col += MAG * step(0.985, hash21(id + 9.0 + floor(t * 4.0))) * step(box, 0.42);
  return col;
}

vec3 transmission(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float L = luma(cam);
  float y = uv.y + t * (0.04 + hold * 0.04);
  float band = fract(y * mix(18.0, 32.0, hold));
  float scan = smoothstep(0.18, 0.0, abs(band - 0.5));
  float punch = step(0.82, hash21(vec2(floor(uv.x * 42.0), floor(uv.y * 22.0))));
  float pulse = 0.5 + 0.5 * sin(uv.y * 40.0 - t * 8.0);
  vec3 col = INK;
  col += CYN * scan * (0.22 + L * 0.5);
  col += MAG * punch * 0.55;
  col += ORG * step(0.97, hash21(vec2(floor(t * 2.0), floor(uv.y * 40.0)))) * 0.4;
  float r = length(p);
  float funnel = 1.0 / (r * 4.0 + 0.2);
  col += WHT * pulse * 0.04 * funnel;
  col += cam * vec3(0.2, 0.7, 1.0) * uHasCamera * 0.4;
  float drop = step(0.93, hash21(vec2(floor(t * 5.0), 4.0)));
  col *= 1.0 - drop * 0.85 * step(0.4, fract(uv.y * 3.0 + t));
  return col;
}

vec3 staticField(vec2 uv, vec3 cam, vec3 prev, float t, float hold) {
  vec2 suv = shearUv(uv, t, hold);
  float n = hash21(suv * uResolution + floor(t * 24.0));
  float n2 = hash21(suv * 90.0 + t);
  vec3 snow = vec3(n);
  vec3 psy = vec3(n, n2, hash21(suv * 40.0 - t));
  vec3 col = mix(snow, psy, 0.65);
  col = mix(col, vec3(1.0) - cam, uHasCamera * 0.55);
  col *= mix(vec3(1.0), MAG, step(0.7, suv.x) * 0.35);
  col *= mix(vec3(1.0), CYN, step(suv.x, 0.3) * 0.35);
  float persist = mix(0.72, 0.9, hold);
  col = mix(col, prev, persist);
  col += (col - prev) * 0.22;
  return col * (0.85 + 0.3 * luma(cam));
}

vec3 undone(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float ang = atan(p.y, p.x);
  float r = length(p);
  float L = luma(cam);
  float shards = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float a = ang * (3.0 + fi) + t * (0.2 + fi * 0.05);
    float zig = abs(sin(a * 4.0 + sin(a * 2.0)));
    shards += smoothstep(0.04, 0.0, abs(r - (0.12 + fi * 0.12 + hold * 0.05)) - 0.02 * zig);
  }
  float mesh = max(
    step(0.96, fract((p.x + p.y) * 7.0 + t * 0.2)),
    step(0.96, fract((p.x - p.y) * 7.0 - t * 0.15))
  );
  vec3 col = INK;
  col += mix(MAG, ORG, 0.5 + 0.5 * sin(ang * 2.0)) * shards * (0.7 + hold * 0.5);
  col += CYN * mesh * 0.45;
  col += cam * vec3(0.9, 0.3, 1.0) * uHasCamera * (0.2 + 0.5 * shards);
  col += WHT * pow(hash21(floor(p * 40.0 + t * 6.0)), 16.0) * shards * 2.0;
  return col;
}

void main() {
  vec2 uv = shearUv(vUv + uPan * 0.03, uTime, uHold * 0.65);
  vec3 cam = sampleCamera(vUv - uPan * 0.05);
  vec3 prev = texture(uPrev, vUv).rgb;
  float t = uTime;
  float hold = clamp(uHold, 0.0, 1.0);
  float mode = uMode;

  vec3 col;
  if (mode < 0.5) {
    col = armature(uv, cam, t, hold);
  } else if (mode < 1.5) {
    col = cubic(uv, cam, t, hold);
  } else if (mode < 2.5) {
    col = transmission(uv, cam, t, hold);
  } else if (mode < 3.5) {
    col = staticField(uv, cam, prev, t, hold);
  } else {
    col = undone(uv, cam, t, hold);
  }

  bool isStatic = mode > 2.5 && mode < 3.5;
  if (!isStatic) {
    col = mix(col, prev, mix(0.28, 0.55, hold));
  }

  col *= mix(0.9, 1.2, uIntensity);
  fragColor = vec4(max(col, vec3(0.0)), 1.0);
}
`,Et=`#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uImage;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPan;
uniform float uEnergy;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float frameRing(vec2 uv, vec2 center, vec2 halfSize, float thick) {
  vec2 p = uv - center;
  float outer = sdBox(p, halfSize);
  float inner = sdBox(p, max(halfSize - vec2(thick), vec2(0.0)));
  return step(outer, 0.0) * (1.0 - step(inner, 0.0));
}

float insideBox(vec2 uv, vec2 center, vec2 halfSize) {
  vec2 d = abs(uv - center);
  return step(d.x, halfSize.x) * step(d.y, halfSize.y);
}

float pole(vec2 p, vec2 a, vec2 b, float w) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
  return step(length(pa - ba * h), w);
}

vec2 glitchUv(vec2 uv, float t) {
  float kick = 0.9 - uEnergy * 0.12;
  float row = floor((uv.y + t * 0.01) * 36.0);
  float h = hash21(vec2(row, floor(t * 9.0)));
  if (h > kick) {
    uv.x += (h - 0.95) * (0.28 + uEnergy * 0.35);
  }
  vec2 block = floor(uv * vec2(22.0, 14.0));
  float b = hash21(block + floor(t * 2.8));
  if (b > 0.968 - uEnergy * 0.04) {
    uv += (vec2(hash21(block + 1.3), hash21(block + 4.1)) - 0.5) * (0.08 + uEnergy * 0.1);
  }
  if (mod(floor(uv.y * uResolution.y), 3.0) < 0.5 && hash21(vec2(floor(t * 5.0), 8.0)) > 0.55 - uEnergy * 0.2) {
    uv.x += 0.0035 + uEnergy * 0.006;
  }
  return uv;
}

void main() {
  vec2 uv = vUv;
  float t = uTime;
  float aspect = uResolution.x / max(uResolution.y, 1.0);

  vec2 gUv = glitchUv(uv - uPan * 0.04, t);
  float split = 0.0035 + 0.004 * step(0.92, hash21(vec2(floor(t * 6.0), 2.2))) + uEnergy * 0.01;
  vec3 col;
  col.r = texture(uImage, gUv + vec2(split, 0.0)).r;
  col.g = texture(uImage, gUv).g;
  col.b = texture(uImage, gUv - vec2(split, 0.0)).b;

  float scan = 0.78 + 0.22 * sin(uv.y * uResolution.y * 3.14159);
  col *= scan;

  float tear = hash21(vec2(floor(uv.y * 70.0), floor(t * 11.0)));
  if (tear > 0.97 - uEnergy * 0.06) {
    col = vec3(col.g, col.b, col.r) * vec3(1.0, 0.2, 0.85);
  }

  vec2 cA = vec2(0.5, 0.5) + uPan * 0.018;
  vec2 cB = vec2(0.528, 0.462) + uPan * 0.055;
  vec2 cC = vec2(0.38, 0.58) + uPan * 0.09;
  vec2 halfA = vec2(0.448, 0.418);
  vec2 halfB = vec2(0.372, 0.328);
  float thick = 0.02;

  float windowA = insideBox(uv, cA, halfA - vec2(thick));
  float windowB = insideBox(uv, cB, halfB - vec2(thick * 0.75));

  vec2 gUvB = glitchUv(uv + vec2(0.03, -0.04) - uPan * 0.08, t + 2.4);
  vec3 colB;
  colB.r = texture(uImage, gUvB + vec2(split * 1.6, 0.0)).r;
  colB.g = texture(uImage, gUvB).g;
  colB.b = texture(uImage, gUvB - vec2(split * 1.6, 0.0)).b;

  vec3 framed = mix(colB * vec3(1.15, 0.32, 0.92), col, windowA);
  float window = max(windowA, windowB);
  framed *= window;

  float ringA = frameRing(uv, cA, halfA, thick);
  float ringB = frameRing(uv, cB, halfB, thick * 0.85);
  float ringC = frameRing(uv, cC, vec2(0.16, 0.14), 0.011);

  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 panP = uPan * vec2(aspect, 1.0);
  float poles = 0.0;
  poles += pole(p, vec2(-0.95, -0.72) + panP * 0.16, vec2(0.82, 0.88) + panP * 0.05, 0.007);
  poles += pole(p, vec2(-0.6, 0.9) + panP * 0.22, vec2(0.92, -0.55) + panP * 0.08, 0.0055);
  poles += pole(p, vec2(0.05, -0.92) + panP * 0.12, vec2(-0.2, 0.95) + panP * 0.28, 0.0045);

  vec3 outCol = mix(vec3(0.0), framed, window);
  outCol = mix(outCol, vec3(0.0), clamp(ringA + ringB + ringC, 0.0, 1.0));
  outCol = mix(outCol, vec3(0.0), clamp(poles, 0.0, 1.0));

  float edgeLite = ringA * step(0.96, hash21(uv * 80.0 + t));
  outCol += vec3(0.0, 0.85, 1.0) * edgeLite * 0.35;

  float grain = hash21(uv * uResolution + fract(t) * 180.0) - 0.5;
  outCol += grain * 0.045;

  outCol = max(outCol, vec3(0.0));
  outCol = pow(outCol, vec3(0.88));

  fragColor = vec4(outCol, 1.0);
}
`;function Be(e,n,t){const r=new Map;for(const o of t)r.set(o,e.getUniformLocation(n,o));return{program:n,uniforms:r}}function I(e,n,t,r){const o=n.uniforms.get(t);o&&e.uniform1f(o,r)}function ne(e,n,t,r,o){const a=n.uniforms.get(t);a&&e.uniform2f(a,r,o)}class xt{canvas;gl;vao;cameraTex;phosphene;present;ping;pong;width=1;height=1;constructor(n){const t=n.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!t)throw new Error("WebGL2 is not available.");this.canvas=n,this.gl=t,t.getExtension("EXT_color_buffer_float"),t.getExtension("EXT_color_buffer_half_float"),t.getExtension("OES_texture_half_float"),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!0);const r=t.createVertexArray();if(!r)throw new Error("Could not create VAO.");this.vao=r,this.phosphene=Be(t,ke(t,De,gt),["uCamera","uPrev","uResolution","uCameraSize","uTime","uMode","uIntensity","uHold","uHasCamera","uMirror","uPan","uEnergy"]),this.present=Be(t,ke(t,De,Et),["uImage","uResolution","uTime","uPan","uEnergy"]),this.cameraTex=yt(t),this.ping=fe(t,1,1),this.pong=fe(t,1,1),this.resize()}resize(){const n=Math.min(window.devicePixelRatio||1,2),t=Math.max(1,Math.floor(this.canvas.clientWidth*n)),r=Math.max(1,Math.floor(this.canvas.clientHeight*n));if(t===this.width&&r===this.height&&this.canvas.width===t)return;this.canvas.width=t,this.canvas.height=r,this.width=t,this.height=r;const o=this.gl;Le(o,this.ping),Le(o,this.pong),this.ping=fe(o,t,r),this.pong=fe(o,t,r)}frame(n){this.resize();const t=this.gl,{width:r,height:o}=this;n.hasCamera&&n.video&&n.video.readyState>=2&&(t.bindTexture(t.TEXTURE_2D,this.cameraTex),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,n.video)),t.bindVertexArray(this.vao),t.bindFramebuffer(t.FRAMEBUFFER,this.ping.framebuffer),t.viewport(0,0,r,o),t.useProgram(this.phosphene.program),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.cameraTex),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.pong.texture);const a=n.video?.videoWidth||1,l=n.video?.videoHeight||1;t.uniform1i(this.phosphene.uniforms.get("uCamera")??null,0),t.uniform1i(this.phosphene.uniforms.get("uPrev")??null,1),ne(t,this.phosphene,"uResolution",r,o),ne(t,this.phosphene,"uCameraSize",a,l),I(t,this.phosphene,"uTime",n.time),I(t,this.phosphene,"uMode",n.mode),I(t,this.phosphene,"uIntensity",n.intensity),I(t,this.phosphene,"uHold",n.hold),I(t,this.phosphene,"uHasCamera",n.hasCamera?1:0),I(t,this.phosphene,"uMirror",n.mirror?1:0),ne(t,this.phosphene,"uPan",n.panX,n.panY),I(t,this.phosphene,"uEnergy",n.energy),t.drawArrays(t.TRIANGLES,0,3),t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,r,o),t.useProgram(this.present.program),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.ping.texture),t.uniform1i(this.present.uniforms.get("uImage")??null,0),ne(t,this.present,"uResolution",r,o),I(t,this.present,"uTime",n.time),ne(t,this.present,"uPan",n.panX,n.panY),I(t,this.present,"uEnergy",n.energy),t.drawArrays(t.TRIANGLES,0,3);const v=this.ping;this.ping=this.pong,this.pong=v}}const Y=document.querySelector("#stage"),de=document.querySelector("#mast"),he=document.querySelector("#mast-watch"),Z=document.querySelector("#hud"),Re=document.querySelector("#fatal"),ae=document.querySelector("#banner"),We=document.querySelector("#open-eye"),ze=document.querySelector("#enter"),je=document.querySelector("#hold-watch"),Ie=document.querySelector("#watch-link"),qe=document.querySelector("#play-link"),Ge=document.querySelector("#mode-index"),Ne=document.querySelector("#mode-name"),Xe=document.querySelector("#mode-note"),Q=document.querySelector("#cam-status"),re=document.querySelector("#link-note"),F=document.querySelector("#remote-eye");if(!Y||!de||!Z||!Re||!ae||!We||!ze||!he||!je||!F)throw new Error("Phosphene markup is missing.");const w=ct()==="watch",wt=st();document.body.classList.toggle("is-watch",w);de.hidden=w;he.hidden=!w;Ie&&(Ie.href=lt());qe&&(qe.href=ut());let Ae;try{Ae=new xt(Y)}catch(e){Re.hidden=!1,de.hidden=!0,he.hidden=!0,Y.style.display="none";const n=Re.querySelector("p:last-of-type");throw n&&e instanceof Error&&(n.textContent=e.message),e}const _=rt(),Ke=pt(),se=et(),J=document.querySelector("#armature");let G=0,oe=0,V=0,ee=!1,ie=!0,Te=null,q=null,be=!1,Oe=!1,He=0,Ye=!1;function O(e){ae.hidden=!1,ae.textContent=e,window.setTimeout(()=>{ae.textContent===e&&(ae.hidden=!0)},4200)}function Me(){const e=k[G];!e||!Ge||!Ne||!Xe||(Ge.textContent=e.index,Ne.textContent=e.name,Xe.textContent=e.note)}function $e(){if(re){if(!w){re.textContent=T.status==="live"?"remote view live":"remote view waiting";return}T.status==="live"?re.textContent="mirroring a live session":T.status==="error"?re.textContent="remote link failed":re.textContent="waiting for a session"}}function Tt(e){F.srcObject!==e&&(F.srcObject=e,e&&F.play().catch(()=>{O("Tap to hear the mirrored session.")}))}const T=vt(w?"watch":"session",wt,()=>{$e(),Tt(T.remoteStream),w&&T.status==="live"&&(ve(),T.remoteFrame&&(G=(T.remoteFrame.mode%k.length+k.length)%k.length,Me())),!w&&T.status==="live"&&ee&&!Ye&&(Ye=!0,O("A remote view is mirroring this session."))});function ve(){!w||Oe||(Oe=!0,he.classList.add("is-gone"),Z.hidden=!1,Z.classList.toggle("is-dim",!ie),F.play().catch(()=>{}))}function Pe(){if(w||!ee)return;q||(q=new MediaStream);const e=[];if(se.captureStream()?.getAudioTracks().forEach(t=>{q?.getTracks().some(r=>r.id===t.id)||(q?.addTrack(t),e.push(t))}),_.stream?.getVideoTracks().forEach(t=>{q?.getTracks().some(r=>r.id===t.id)||(q?.addTrack(t),e.push(t))}),!be&&q.getTracks().length>0){T.publish(q),be=!0;return}be&&e.forEach(t=>T.addTrack(t,q))}async function bt(){await T.start(),await se.start(),Pe();const e=await se.startMic();Pe(),e==="live"?O("Pad open. Microphone is live in the delay mix."):e==="denied"&&O("Microphone blocked — pad still runs.")}function H(){w||ee||(ee=!0,de.classList.add("is-gone"),Z.hidden=!1,Z.classList.toggle("is-dim",!ie),Ke.requestAccess(),bt())}function me(e){w||(G=(e+k.length)%k.length,Me())}function Rt(){w||(V=1)}function Ce(){V=0}We.addEventListener("click",async()=>{H(),Q&&(Q.textContent="Asking for the camera…");const e=await _.start();Pe(),e==="live"?(Q&&(Q.textContent="Camera open. Nothing is recorded."),O("Channel open. The world shears into the frame.")):(O(_.error??"Camera stayed closed."),Q&&(Q.textContent=_.error??"Camera stayed closed."))});ze.addEventListener("click",()=>{H()});je.addEventListener("click",()=>{ve(),F.play().catch(()=>{})});Y.addEventListener("click",()=>{if(w){ve();return}if(!ee){H();return}me(G+1)});window.addEventListener("keydown",e=>{if(e.code==="Space"){if(e.preventDefault(),w){ve();return}V=1,H();return}if(e.key==="m"||e.key==="M"){if(w){F.muted=!F.muted,O(F.muted?"Audio muted.":"Audio on.");return}const t=se.toggleMuted();O(t?"Audio muted.":"Audio on.");return}if(e.key==="h"||e.key==="H"){ie=!ie,Z.classList.toggle("is-dim",!ie);return}if(e.key==="f"||e.key==="F"){document.fullscreenElement?document.exitFullscreen().catch(()=>{}):document.documentElement.requestFullscreen().catch(()=>{});return}if(w)return;const n=Number(e.key);if(n>=1&&n<=k.length){H(),me(n-1);return}(e.key==="ArrowRight"||e.key==="ArrowDown")&&(H(),me(G+1)),(e.key==="ArrowLeft"||e.key==="ArrowUp")&&(H(),me(G-1))});window.addEventListener("keyup",e=>{e.code==="Space"&&(V=0)});Y.addEventListener("pointerdown",Rt);window.addEventListener("pointerup",Ce);window.addEventListener("pointercancel",Ce);window.addEventListener("blur",Ce);let Qe=0;Y.addEventListener("touchstart",()=>{w||(Qe=window.setTimeout(()=>{V=1},280))},{passive:!0});Y.addEventListener("touchend",()=>{window.clearTimeout(Qe),V=0});Me();$e();w&&T.start();window.addEventListener("pagehide",()=>{T.leave()});function Se(e){if(Te===null&&(Te=e),w&&T.status==="live"&&T.remoteFrame){const l=T.remoteFrame;G=(l.mode%k.length+k.length)%k.length,oe=l.hold,J&&(J.style.setProperty("--pan-x",l.panX.toFixed(4)),J.style.setProperty("--pan-y",l.panY.toFixed(4)));const v=F.srcObject?F:null,d=!!(v&&v.readyState>=2&&v.videoWidth>0);Ae.frame({time:l.time,mode:l.mode,intensity:l.intensity,hold:l.hold,hasCamera:l.hasCamera&&d,mirror:l.mirror,panX:l.panX,panY:l.panY,energy:l.energy,video:d?v:null}),requestAnimationFrame(Se);return}const n=(e-Te)/1e3;oe+=(V-oe)*.08;const t=!w&&_.status==="live",r=Ke.sample(t?_.video:null,_.mirror),o=w?0:se.tick();J&&(J.style.setProperty("--pan-x",r.panX.toFixed(4)),J.style.setProperty("--pan-y",r.panY.toFixed(4)));const a=Math.min(1,r.energy+o*.4);Ae.frame({time:n,mode:G,intensity:1,hold:oe,hasCamera:t,mirror:_.mirror,panX:r.panX,panY:r.panY,energy:a,video:t?_.video:null}),!w&&ee&&e-He>40&&(He=e,T.sendFrame({time:n,mode:G,intensity:1,hold:oe,hasCamera:t,mirror:_.mirror,panX:r.panX,panY:r.panY,energy:a})),requestAnimationFrame(Se)}requestAnimationFrame(Se);
