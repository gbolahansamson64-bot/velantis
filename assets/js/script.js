/* PRODUCT PICTURES: the watches in "Iconic Timepieces" are written in index.html (look for YOUR WATCHES). Change a photo by changing its src there.
   Later the admin dashboard will supply these watches instead. */
const track=document.getElementById('track');
/* ADD TO CART LOADING (all screens): after a click the button shows a spinner for ADD_DELAY ms, then the watch is added and the button says "Added".
   While it is loading, every Add to cart button ignores clicks, so fast repeated clicks can never fire many requests.
   Change ADD_DELAY (milliseconds) to make the loading shorter or longer. */
const ADD_DELAY=900;
let adding=false;
const CHECK='<svg class="i" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
track.addEventListener('click',e=>{
 const f=e.target.closest('.fav');if(f)f.setAttribute('aria-pressed',f.getAttribute('aria-pressed')!=='true');
 const a=e.target.closest('.add');
 if(a){
  if(adding||a.disabled)return;
  const card=a.closest('.card'),pic=card.querySelector('.watch');
  adding=true;const html=a.innerHTML;
  a.style.minWidth=a.offsetWidth+'px'; /* the button keeps its width while the label changes */
  a.style.setProperty('--ld',ADD_DELAY+'ms');
  a.disabled=true;a.setAttribute('aria-busy','true');a.classList.add('loading');
  a.innerHTML='<i class="spin" aria-hidden="true"></i><span>Adding…</span>';
  setTimeout(()=>{
   Cart.add(card,pic); /* the real add happens here, once, after the loading time. If you connect a database, send the request here. */
   adding=false;
   a.classList.remove('loading');a.classList.add('done');a.innerHTML=CHECK+'<span>Added</span>';
   setTimeout(()=>{a.classList.remove('done');a.innerHTML=html;a.disabled=false;a.removeAttribute('aria-busy');a.style.minWidth=''},900);
  },ADD_DELAY);
 }
});
const step=()=>track.querySelector('.card').offsetWidth+14;
tl.onclick=()=>track.scrollBy({left:-step(),behavior:'smooth'});
tr.onclick=()=>track.scrollBy({left:step(),behavior:'smooth'});

/* Featured collection: clicking a card's picture opens the shop page (heart button still works on its own) */
track.querySelectorAll('.card .img').forEach(img=>{
  img.setAttribute('role','link');
  img.setAttribute('tabindex','0');
  img.setAttribute('aria-label','View in shop');
});
track.addEventListener('click',e=>{
  if(e.target.closest('.fav'))return;      /* heart button: don't navigate */
  if(e.target.closest('.img'))location.href='shop.html';
});
track.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('.card .img')){
    e.preventDefault();location.href='shop.html';
  }
});

const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const FALLBACK="/assets/images/millie-hero.png"; /* shown if a slide's image file is missing */
const DELAY=7000; /* autoplay interval in ms (6000-8000 recommended) */
/* EDIT YOUR HERO SLIDES HERE. No prices in the hero by design. */
/* LIVE HANDS (per slide): the slide image must be the dial/case WITHOUT hands baked in, otherwise you see two sets.
   cx, cy = exact dial centre as % of the image width / height.  r = dial radius as % of the image height
   (the second hand's tip reaches roughly r). hh = hour/minute hand colour, hl = lume colour, hs = second hand colour.
   Set hands:false on a slide whose artwork cannot take overlaid hands.
   Not sure of the numbers? Open the page with ?calibrate on the end of the URL (see CALIBRATION below). */
const HANDS={cx:50,cy:50,r:28,hh:'#e9e9e9',hl:'#dfe9c8',hs:'#d3b57c'};
const BEATS=0; /* second hand: 0 = perfectly smooth sweep. 8 = high-beat movement (8 small steps per second). */
const slides=[
  {b:"TIMELESS STYLE.",m:"LIMITLESS PRESENCE.",ed:"Limited Edition",d:"Refined design, effortless elegance, made for every moment.",up:"Timeless design for every moment.",img:"/assets/images/millie-hero.png",hands:{cx:50,cy:50,r:28,hs:'#e7c27a'}},
  {b:"ELEGANCE",m:"IN EVERY SECOND.",ed:"Featured Collection",d:"Understated authority, refined over decades of precision.",up:"A refined look for every occasion.",img:"/assets/images/rolex-datejust.png",hands:{cx:49.8,cy:46.35,r:24,hh:'#dcbc6a',hl:'#f6f0d6',hs:'#c9a24a'}},
  {b:"YOUR STYLE.",m:"YOUR STATEMENT.",ed:"Signature Piece",d:"An icon of modern watchmaking, finished to the last detail.",up:"Bold character, made to be noticed.",img:"/assets/images/carbon.png",hands:{cx:50,cy:50,r:28,hh:'#d9dde3',hs:'#d3b57c'}}
];
const hero=$('top'),heroImg=$('heroImg'),peekImg=$('peekImg'),prog=$('prog');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let s=0,busy=false,timer=null,left=DELAY,t0=0;
const holds=new Set();
hero.style.setProperty('--dur',DELAY+'ms');
$('ct').textContent=pad(slides.length);
slides.forEach(d=>{new Image().src=d.img});

/* PHONE "UP NEXT" CARD: describes the slide after the current one. The card is hidden on tablet/desktop. */
function setUp(){
 const n=slides[(s+1)%slides.length];
 $('upNum').textContent=pad((s+1)%slides.length+1);
 $('upTot').textContent=pad(slides.length);
 $('upTitle').textContent=(n.b+' '+n.m).replace(/\.$/,'');
 $('upSub').textContent=n.up||n.d;
}

function load(img,src){
 return new Promise(res=>{
  img.dataset.fb='';
  img.onload=()=>{img.onload=img.onerror=null;res()};
  img.onerror=()=>{img.onerror=null;img.dataset.fb='1';img.src=FALLBACK};
  img.src=src;
 });
}

/* ---------- LIVE WATCH HANDS ----------
   Only the three hand layers rotate, never the watch image. All of them pivot on the dial centre (the .hands box is
   centred on it and each hand's transform-origin is 50% 50%). Angles come from the real clock every frame:
   second = (s + ms/1000) * 6deg, minute = (m + s/60) * 6deg, hour = ((h % 12) + m/60) * 30deg. */
const handsEl=$('hands'),hHour=$('hHour'),hMin=$('hMin'),hSec=$('hSec');
function applyHands(d,fellBack){
 const c=d.hands;
 if(!c||fellBack){handsEl.hidden=true;return} /* no hands for this slide, or its image failed to load so the centre would be wrong */
 const h=Object.assign({},HANDS,c);
 handsEl.style.setProperty('--cx',h.cx);handsEl.style.setProperty('--cy',h.cy);handsEl.style.setProperty('--r',h.r);
 handsEl.style.setProperty('--hh',h.hh);handsEl.style.setProperty('--hl',h.hl);handsEl.style.setProperty('--hs',h.hs);
 handsEl.hidden=false;
}
function tickHands(){
 if(handsEl.hidden)return;
 const n=new Date();
 let sec=n.getSeconds()+n.getMilliseconds()/1000;
 if(reduce)sec=Math.floor(sec); /* reduced motion: one step per second, no sweep */
 else if(BEATS>0)sec=Math.floor(sec*BEATS)/BEATS;
 const min=n.getMinutes()+sec/60,hr=(n.getHours()%12)+min/60;
 hSec.style.transform='rotate('+(sec*6).toFixed(3)+'deg)';
 hMin.style.transform='rotate('+(min*6).toFixed(3)+'deg)';
 hHour.style.transform='rotate('+(hr*30).toFixed(3)+'deg)';
}
let handRaf=0,handIv=0,handsVisible=true;
function handLoop(){tickHands();handRaf=requestAnimationFrame(handLoop)}
function handsStart(){
 if(handRaf||handIv)return;
 if(reduce){tickHands();handIv=setInterval(tickHands,1000)}else handLoop();
}
function handsStop(){cancelAnimationFrame(handRaf);clearInterval(handIv);handRaf=handIv=0}
/* run only while the hero is on screen and the tab is visible; the hands re-sync to the real time instantly on return */
new IntersectionObserver(([e])=>{handsVisible=e.isIntersecting;e.isIntersecting&&!document.hidden?handsStart():handsStop()},{threshold:0}).observe(hero);
document.addEventListener('visibilitychange',()=>document.hidden?handsStop():handsVisible&&handsStart());
function arm(ms){
 clearTimeout(timer);timer=null;
 if(reduce)return;
 left=ms;t0=Date.now();timer=setTimeout(()=>show(s+1),ms);
}
function pause(){
 if(!timer)return;
 clearTimeout(timer);timer=null;left-=Date.now()-t0;hero.classList.add('paused');
}
function resume(){
 if(timer||reduce||busy)return;
 hero.classList.remove('paused');t0=Date.now();timer=setTimeout(()=>show(s+1),Math.max(left,300));
}
const hold=k=>{holds.add(k);pause()};
const release=k=>{holds.delete(k);if(!holds.size)resume()};
/* Hooks used by header.js: its search bar, account panel and cart panel pause this slider and the live hands while they are open. */
window.SiteHooks={hold,release,stopHands:handsStop,resumeHands:()=>{if(handsVisible&&!document.hidden)handsStart()}};
function restartBar(){
 prog.style.animation='none';void prog.offsetWidth;prog.style.animation='';
 if(reduce){prog.style.transform='scaleX('+((s+1)/slides.length)+')'}
}
function show(i){
 if(busy)return;busy=true;
 hero.classList.toggle('back',i<s);
 clearTimeout(timer);timer=null;
 hero.classList.remove('in');hero.classList.add('out');
 setTimeout(()=>{
  s=(i+slides.length)%slides.length;
  const d=slides[s],n=slides[(s+1)%slides.length];
  $('hb').textContent=d.b;$('hm').textContent=d.m;$('hd').textContent=d.d;
  $('sb').textContent=d.m;$('se').textContent=d.ed;
  heroImg.alt=d.b+' '+d.m;
  $('cn').textContent=pad(s+1);
  setUp();
  hero.dataset.t=s%3;
  $('live').textContent=d.b+' '+d.m+', slide '+(s+1)+' of '+slides.length;
  Promise.race([load(heroImg,d.img),new Promise(r=>setTimeout(r,1500))]).then(()=>{
   applyHands(d,heroImg.dataset.fb==='1'&&d.img!==FALLBACK); /* new watch gets its own hand position and colours while hidden */
   load(peekImg,d.thumb||n.img);
   hero.classList.remove('out');void hero.offsetWidth;hero.classList.add('in');
   restartBar();arm(DELAY);if(holds.size)pause();
   setTimeout(()=>{busy=false},1300);
  });
 },450);
}
$('hx').onclick=()=>show(s+1);
$('hp').onclick=()=>show(s-1);
$('hx2').onclick=()=>show(s+1); /* phone arrows */
$('hp2').onclick=()=>show(s-1);
document.querySelector('.thumb').onclick=()=>show(s+1);

/* autoplay pause/resume: mouse hover, keyboard focus, finger down, hidden tab, offscreen */
hero.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hold('hover')});
hero.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')release('hover')});
hero.addEventListener('focusin',e=>{if(e.target.matches(':focus-visible'))hold('focus')});
hero.addEventListener('focusout',()=>release('focus'));
document.addEventListener('visibilitychange',()=>document.hidden?hold('tab'):release('tab'));
new IntersectionObserver(([e])=>e.isIntersecting?release('view'):hold('view'),{threshold:.25}).observe(hero);

/* swipe */
let x0=0,y0=0;
hero.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;hold('touch')},{passive:true});
hero.addEventListener('touchcancel',()=>release('touch'),{passive:true});
hero.addEventListener('touchend',e=>{
 const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;release('touch');
 if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)show(dx<0?s+1:s-1);
},{passive:true});
hero.addEventListener('keydown',e=>{
 if(e.key==='ArrowRight')show(s+1);
 if(e.key==='ArrowLeft')show(s-1);
});

$('sb').textContent=slides[0].m;$('se').textContent=slides[0].ed;
setUp();
load(peekImg,slides[0].thumb||slides[1].img);

applyHands(slides[0],false);
heroImg.onerror=()=>{heroImg.onerror=null;heroImg.dataset.fb='1';applyHands(slides[0],true)}; /* first image missing: hide hands rather than misplace them */
tickHands();
arm(DELAY);
restartBar();

/* CALIBRATION: add ?calibrate to the page URL. A red circle + cross-hair shows the hand box on the current slide.
   Arrow keys move the centre (hold Shift for bigger steps), + / - change the radius, C prints every slide's values
   to the console. Copy the numbers into the hands:{...} of each slide in the list above. Autoplay is paused. */
if(/[?&]calibrate/.test(location.search)){
 hero.classList.add('cal');hold('cal');
 const box=document.createElement('div');box.className='calbox';hero.appendChild(box);
 const show2=()=>{const c=slides[s].hands||(slides[s].hands={});const h=Object.assign({},HANDS,c);box.textContent=slides[s].m+'\ncx:'+h.cx+'  cy:'+h.cy+'  r:'+h.r+'\narrows=move  shift=x10  +/-=radius  c=log all'};
 show2();
 document.addEventListener('keydown',e=>{
  const c=slides[s].hands||(slides[s].hands={}),h=Object.assign({},HANDS,c),k=e.shiftKey?1:.1;
  const m={ArrowLeft:['cx',-k],ArrowRight:['cx',k],ArrowUp:['cy',-k],ArrowDown:['cy',k],'+':['r',k],'=':['r',k],'-':['r',-k],'_':['r',-k]}[e.key];
  if(m){e.preventDefault();e.stopPropagation();c[m[0]]=+(h[m[0]]+m[1]).toFixed(2);applyHands(slides[s],false);show2()}
  else if(e.key==='c')console.log(slides.map(d=>d.m+': '+JSON.stringify(d.hands)).join('\n'));
 },true);
 hero.addEventListener('transitionend',show2);setInterval(show2,500);
}

/* The header (menu button, scrolled look, search bar, account panel, cart panel, desktop nav highlight) now lives in header.js. */

/* ---------- APP-STYLE BOTTOM NAV (phone + tablet) ----------
   Mirrors the header cart count, shows a wishlist count, and highlights Home / Shop while scrolling this one-page site.
   Once the site is split into pages, delete the scroll-spy part and set aria-current="page" in the HTML instead. */
const mnav=document.getElementById('mnav');
if(mnav){
 const cartTop=$('cartCount'),cartNav=$('navCartCount'),favNav=$('navFavCount');
 const syncCart=()=>{cartNav.textContent=cartTop.textContent};
 new MutationObserver(syncCart).observe(cartTop,{childList:true,characterData:true,subtree:true});
 syncCart();
 track.addEventListener('click',e=>{
  if(!e.target.closest('.fav'))return;
  const n=track.querySelectorAll('.fav[aria-pressed="true"]').length;
  favNav.textContent=n;favNav.hidden=!n;
 });
 /* placeholder links ("#") do nothing for now instead of jumping to the top */
 mnav.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.getAttribute('href')==='#')e.preventDefault()});
}
/* The cart panel now lives in header.js (it exposes window.Cart.add / open / close, used by the product cards above). */

/* ---------- LIFESTYLE BANNER ----------
   Starts the text rise-in when the banner scrolls into view and runs its picture animation only while it is on screen. */
(()=>{
 const L=document.getElementById('legacy');if(!L||!('IntersectionObserver' in window))return;
 L.classList.add('ready');
 new IntersectionObserver(([e])=>{L.classList.toggle('live',e.isIntersecting);if(e.isIntersecting)L.classList.add('in')},{threshold:.2}).observe(L);
})();
/* ---------- CUSTOMER REVIEWS SLIDER ----------
   The arrows slide the row one card at a time; an arrow greys out at the start / end. On phones you just swipe. */
(()=>{
 const t=$('rvTrack'),p=$('rvPrev'),n=$('rvNext');if(!t||!p||!n)return;
 const step=()=>{const c=t.querySelector('.rv-card');return c?c.offsetWidth+parseFloat(getComputedStyle(t).columnGap||16):300};
 const sync=()=>{p.disabled=t.scrollLeft<4;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-4};
 p.addEventListener('click',()=>t.scrollBy({left:-step(),behavior:reduce?'auto':'smooth'}));
 n.addEventListener('click',()=>t.scrollBy({left:step(),behavior:reduce?'auto':'smooth'}));
 t.addEventListener('scroll',sync,{passive:true});
 window.addEventListener('resize',sync);window.addEventListener('load',sync);
 t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();n.click()}if(e.key==='ArrowLeft'){e.preventDefault();p.click()}});
 sync();
})();

/* ---------- LIFESTYLE PHOTO SLIDER ----------
   Slowly crossfades the banner photos and moves the dots with them. SHOW_MS = how long each photo stays (7000 = 7 seconds);
   the fade length itself is --life-fade in style.css. It only runs while the banner is on screen and the tab is open.
   Clicking a dot jumps to that photo. A photo whose file is missing is skipped and its dot is removed. */
(()=>{
 const L=document.getElementById('legacy'),box=L&&L.querySelector('.life-dots');if(!L||!box)return;
 const SHOW_MS=7000;
 let items=[...L.querySelectorAll('.life-img')].map((img,n)=>({img,dot:box.children[n]})).filter(it=>it.dot);
 let i=0,timer=null,onScreen=false;
 const show=n=>{
  if(!items.length)return;
  i=(n+items.length)%items.length;
  items.forEach((it,k)=>{const on=k===i;it.img.classList.toggle('is-active',on);it.dot.classList.toggle('is-active',on);it.dot.setAttribute('aria-current',on?'true':'false')});
 };
 const stop=()=>{clearInterval(timer);timer=null};
 const start=()=>{stop();if(items.length>1&&onScreen&&!document.hidden)timer=setInterval(()=>show(i+1),SHOW_MS)};
 const drop=it=>{
  const was=it.img.classList.contains('is-active');
  it.img.remove();it.dot.remove();items=items.filter(x=>x!==it);
  if(was)show(0);else i=Math.max(0,items.findIndex(x=>x.img.classList.contains('is-active')));
  if(items.length<2){box.hidden=true;stop()}
 };
 items.slice().forEach((it,k)=>{
  it.dot.addEventListener('click',()=>{show(items.indexOf(it));start()});
  it.img.addEventListener('error',()=>drop(it));
  if(it.img.complete&&!it.img.naturalWidth&&it.img.getAttribute('src'))drop(it);
 });
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 if('IntersectionObserver' in window)new IntersectionObserver(([e])=>{onScreen=e.isIntersecting;onScreen?start():stop()},{threshold:.2}).observe(L);
 else{onScreen=true;start()}
})();

/* ---------- NEWSLETTER BANNER ----------
   Checks the email, then the button shows "Subscribed" for a moment and the field clears.
   subscribe: add your real newsletter request here, email holds what the visitor typed. */
(()=>{
 const f=$('nlForm'),inp=$('nlEmail'),btn=$('nlBtn'),msg=$('nlMsg');if(!f||!inp||!btn)return;
 const html=btn.innerHTML;let t=0;
 f.addEventListener('submit',e=>{
  e.preventDefault();
  const email=inp.value.trim();
  if(!email||!inp.checkValidity()){
   f.classList.remove('bad');void f.offsetWidth;f.classList.add('bad');
   msg.textContent='Please enter a valid email address.';inp.focus({preventScroll:true});return;
  }
  /* subscribe: send email to your backend / mailing list here */
  f.reset();btn.disabled=true;btn.classList.add('done');
  btn.innerHTML='<span>Subscribed</span><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  msg.textContent='Thank you, you are subscribed.';
  clearTimeout(t);t=setTimeout(()=>{btn.classList.remove('done');btn.innerHTML=html;btn.disabled=false;msg.textContent=''},2800);
 });
 inp.addEventListener('input',()=>f.classList.remove('bad'));
})();