/* =====================================================================
   SHOP PAGE (shop.js)
   Builds the product grid, the filters, sorting, grid/list switch, pagination, wishlist hearts and the newsletter box.
   Add to cart uses the same cart as the home page (window.Cart from header.js).

   YOUR WATCHES: edit the list called PRODUCTS below. One line = one watch:
     [ name, price (number only), style, gender, strap, colour, badge, rating, reviews, picture ]
   - style:  classic | elegant | sport | bold
   - gender: men | unisex
   - strap:  metal | leather | silicone
   - colour: black | silver | gold | blue | green   (this is what the colour swatches filter on)
   - badge:  'Bestseller', 'New' or '' for none
   - picture (optional): path of the real photo, e.g. '/assets/images/products/classic-steel.webp'.
     Until a watch has a picture, a drawn watch in its colours is shown instead.
   ===================================================================== */
(()=>{
 'use strict';
 const $=s=>document.querySelector(s);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

 /* ---------- SETTINGS ---------- */
 const CURRENCY='₦',PRICE_MIN=10000,PRICE_MAX=100000; /* at PRICE_MAX the price filter has no upper limit */
 const DESKTOP=matchMedia('(min-width:961px)');
 const WIDE=matchMedia('(min-width:1200px)'); /* wide desktop: the grid is 4 columns here */
 const PHONE=matchMedia('(max-width:780px)'); /* phone width: the grid is 2 columns here */
 const pageSize=()=>WIDE.matches?12:DESKTOP.matches?9:PHONE.matches?8:12; /* products per page: 12 on wide desktop (3 even rows of 4), 9 on smaller desktop (3 rows of 3), 8 on phone (4 even rows of 2), 12 on tablet (4 even rows of 3) */
 const fmt=n=>CURRENCY+n.toLocaleString('en-US');

 /* ---------- PRODUCT PICTURES ----------
    The easy way: type each watch's picture path in the PRODUCT PICTURES list at the bottom of shop.html (data-img="").
    Those paths win over the last item of a line in PRODUCTS below. */
 const PICS={};
 document.querySelectorAll('#shPics li').forEach(li=>{const v=(li.dataset.img||'').trim();if(v)PICS[li.dataset.id]=v});

 /* ---------- PRODUCTS ---------- */
 const PRODUCTS=[
  ['Classic Steel',18000,'classic','men','metal','silver','Bestseller',4.6,124],
  ['Golden Elegance',22000,'elegant','unisex','metal','gold','New',4.5,89],
  ['Sport Pro',20000,'sport','men','metal','black','',4.4,71],
  ['Azure Classic',17500,'classic','men','metal','blue','',4.3,67],
  ['Minimalist Edge',15000,'elegant','unisex','leather','black','',4.7,93],
  ['Timeless Silver',19000,'classic','unisex','metal','silver','',4.5,80],
  ['Noir Chrono',26500,'sport','men','metal','black','New',4.6,58],
  ['Emerald Reserve',24000,'bold','men','leather','green','',4.5,46],
  ['Riviera Gold',31000,'elegant','unisex','metal','gold','Bestseller',4.8,102],
  ['Tide Diver',21500,'sport','men','silicone','blue','',4.4,64],
  ['Heritage Tan',16500,'classic','men','leather','gold','',4.2,54],
  ['Slate Bold',28000,'bold','men','metal','black','New',4.6,39],
  ['Arctic Minimal',14000,'elegant','unisex','leather','silver','',4.5,112],
  ['Pacific Sport',18500,'sport','unisex','silicone','green','',4.1,77],
  ['Regent Blue',23500,'classic','men','metal','blue','',4.6,61],
  ['Sovereign Gold',38500,'bold','men','metal','gold','Bestseller',4.7,48],
  ['Midnight Slim',12500,'elegant','unisex','leather','black','',4.3,135],
  ['Trail Runner',13500,'sport','men','silicone','black','',4.2,83],
  ['Verde Classic',19500,'classic','unisex','leather','green','',4.5,41],
  ['Atlas Steel',27500,'bold','men','metal','silver','',4.6,52],
  ['Champagne Mist',25000,'elegant','unisex','metal','gold','New',4.5,44],
  ['Cobalt Edge',29500,'bold','men','metal','blue','',4.6,36],
  ['Dune Chrono',33000,'sport','men','leather','gold','',4.5,29],
  ['Pearl Classic',16000,'classic','unisex','metal','silver','',4.2,97],
  ['Onyx Pro',41000,'bold','men','metal','black','Bestseller',4.9,33],
  ['Seafoam Sport',15500,'sport','unisex','silicone','green','',4.1,58],
  ['Royal Azure',34500,'elegant','men','leather','blue','',4.5,27],
  ['Ivory Minimal',11500,'elegant','unisex','leather','silver','',4.3,142],
  ['Obsidian Gold',44500,'bold','men','metal','gold','New',4.9,21],
  ['Forest Diver',22500,'sport','men','silicone','green','',4.5,49]
 ].map((a,i)=>({id:i+1,n:a[0],p:a[1],s:a[2],g:a[3],t:a[4],c:a[5],b:a[6],r:a[7],v:a[8],img:PICS[i+1]||a[9]||''}));

 /* colours of the drawn watch (used while a watch has no photo) */
 const PAL={
  black:{dial:'#15120f',ring:'#4a443d',hand:'#eadfc4',metal:'#3a3633',leather:'#1c1815',silicone:'#26272a'},
  silver:{dial:'#f3f1ea',ring:'#c8cbd0',hand:'#26231f',metal:'#b9bdc2',leather:'#5e402a',silicone:'#8d959d'},
  gold:{dial:'#e9cd8a',ring:'#d1a74f',hand:'#4a3210',metal:'#cba45a',leather:'#4a2e1a',silicone:'#3a3a3d'},
  blue:{dial:'#17387f',ring:'#bfc3c8',hand:'#f2e8cb',metal:'#b9bdc2',leather:'#2b2119',silicone:'#1f45a0'},
  green:{dial:'#21432f',ring:'#c4a55f',hand:'#f0e5c2',metal:'#b9bdc2',leather:'#3a2a1c',silicone:'#23553a'}
 };

 /* ---------- FILTER OPTIONS ---------- */
 const GROUPS=[
  {key:'style',el:'gStyle',opts:[['classic','Classic'],['elegant','Elegant'],['sport','Sport'],['bold','Bold']]},
  {key:'gender',el:'gGender',opts:[['men','Men’s'],['unisex','Unisex']]},
  {key:'strap',el:'gStrap',opts:[['metal','Metal'],['leather','Leather'],['silicone','Silicone']]}
 ];
 const COLORS=[['black','Black','#15120f'],['silver','Silver','linear-gradient(135deg,#eceef0,#9da3aa)'],['gold','Gold','linear-gradient(135deg,#f0d58f,#b98b43)'],['blue','Blue','#1236a8'],['green','Green','#1f3d2b']];
 const LABEL={};GROUPS.forEach(g=>g.opts.forEach(o=>LABEL[o[0]]=o[1]));COLORS.forEach(c=>LABEL[c[0]]=c[1]);

 /* ---------- STATE ---------- */
 const S={min:PRICE_MIN,max:PRICE_MAX,style:new Set(),gender:new Set(),strap:new Set(),color:new Set(),sort:'popular',view:'grid',page:1};
 const FKEY='velantis_shop_favs';
 let favs=new Set();
 try{favs=new Set(JSON.parse(localStorage.getItem(FKEY)||'[]'))}catch(e){}
 const saveFavs=()=>{try{localStorage.setItem(FKEY,JSON.stringify([...favs]))}catch(e){}};

 /* ---------- ELEMENTS ---------- */
 const grid=$('#shGridEl'),count=$('#shCount'),pages=$('#shPages'),empty=$('#shEmpty'),results=$('#products');
 const filters=$('#shFilters'),ov=$('#shOv'),fToggle=$('#shFToggle'),fN=$('#shFN');
 const minI=$('#shMin'),maxI=$('#shMax'),range=$('#shRange');

 /* ---------- BUILD THE FILTER CONTROLS ---------- */
 GROUPS.forEach(g=>{
  $('#'+g.el).innerHTML=g.opts.map(o=>`<label class="sh-opt"><input type="checkbox" data-g="${g.key}" value="${o[0]}"><span class="sh-box"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>${o[1]}</label>`).join('');
 });
 $('#gColor').innerHTML=COLORS.map(c=>`<button type="button" data-c="${c[0]}" style="--c:${c[2]}" aria-pressed="false" aria-label="${c[1]}" title="${c[1]}"></button>`).join('');

 /* ---------- PRODUCT CARD ---------- */
 const stars=r=>{
  const five=`<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#star"/></svg>`.repeat(5);
  return `<span class="sh-stars" role="img" aria-label="${r.toFixed(1)} out of 5 stars"><span>${five}</span><span class="on" style="width:${(r/5*100).toFixed(1)}%">${five}</span></span>`;
 };
 const drawn=p=>{
  const c=PAL[p.c];
  return `<svg class="sh-w" viewBox="0 0 200 320" style="--strap:${c[p.t]};--ring:${c.ring};--dial:${c.dial};--hand:${c.hand}" role="img" aria-label="${p.n}"><use href="#w"/></svg>`;
 };
 const pic=p=>p.img?`<img class="sh-img watch" src="${p.img}" alt="${p.n}" loading="lazy" decoding="async">`:drawn(p);
 /* a picture that cannot be loaded (wrong path) falls back to the drawn watch instead of a broken icon */
 grid.addEventListener('error',e=>{
  const im=e.target;if(!im.matches||!im.matches('img.sh-img'))return;
  const p=PRODUCTS.find(x=>'s'+x.id===im.closest('.sh-card').dataset.id);if(!p)return;
  const t=document.createElement('template');t.innerHTML=drawn(p);im.replaceWith(t.content.firstChild);
 },true);
 /* CARD PHOTO DOTS + HOVER PHOTO (desktop with a mouse only): a card whose watch has more than one photo shows small dots at the bottom of its picture,
    and hovering the picture fades to the watch's 2nd photo; moving the mouse off goes back to the 1st. The photos come from the watch's own pictures (main photo + DETAIL imgs).
    MAX_DOTS = most dots shown. Phones, tablets and touch screens never see the dots or the hover photo. */
 const MAX_DOTS=5,HOVER=matchMedia('(min-width:961px) and (hover:hover)');
 const cardPhotos=p=>{
  const d=DETAIL[p.id]||{},a=[];
  [p.img,...(d.imgs||[])].forEach(x=>{if(x&&!a.includes(x))a.push(x)});
  return p.img?a:[];
 };
 grid.addEventListener('error',e=>{ /* a missing 2nd photo: drop it and its dots so nothing looks broken */
  const im=e.target;if(!im.matches||!im.matches('img.sh-alt'))return;
  const pic=im.closest('.sh-pic'),dots=pic&&pic.querySelector('.sh-pdots');
  im.remove();if(dots)dots.remove();
 },true);
 let peeked=null;
 const unpeek=()=>{if(peeked)peeked.classList.remove('peek');peeked=null};
 grid.addEventListener('mousemove',e=>{
  if(!HOVER.matches)return;
  const c=e.target.closest('.sh-card');
  if(peeked&&peeked!==c)unpeek();
  if(!c)return;
  const pic=c.querySelector('.sh-pic');if(!pic||!c.querySelector('.sh-alt'))return;
  const r=pic.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
  if(inside){c.classList.add('peek');peeked=c}else if(peeked===c)unpeek();
 });
 grid.addEventListener('mouseleave',unpeek);
 window.addEventListener('blur',unpeek);
 /* CUSTOMER REVIEWS LINK: the stars + count on every card and in the pop-up open the reviews page (reviews.html). The watch is passed in the link for now;
    when the backend is ready the reviews page can load the real reviews by the watch id alone. */
 const rvUrl=p=>'reviews.html?id='+p.id+'&n='+encodeURIComponent(p.n)+'&r='+p.r+'&v='+p.v+'&p='+p.p+'&img='+encodeURIComponent(p.img||'');
 const card=p=>{
  const ph=cardPhotos(p),extra=ph.length>1?`<img class="sh-alt" src="${ph[1]}" alt="" loading="lazy" decoding="async" aria-hidden="true"><span class="sh-pdots" aria-hidden="true">${'<i></i>'.repeat(Math.min(ph.length,MAX_DOTS))}</span>`:'';
  const desc=`${LABEL[p.t]} strap | ${LABEL[p.c]}`;
  const badge=p.b?`<span class="sh-badge ${p.b==='New'?'new':'best'}">${p.b}</span>`:'';
  const f=favs.has(p.id);
  return `<li><article class="sh-card" data-id="s${p.id}" data-brand="Velantis" data-model="${p.n}" data-desc="${desc}" data-price="${p.p}">
 <div class="sh-pic">${badge}<button type="button" class="sh-fav" aria-pressed="${f}" aria-label="Save ${p.n}"><svg class="i" viewBox="0 0 24 24"><path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/></svg></button>${pic(p)}${extra}<span class="sh-expand" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg></span></div>
 <div class="sh-info"><h3 class="sh-name">${p.n}</h3><p class="sh-desc">${desc}</p><b class="sh-price">${fmt(p.p)}</b><a class="sh-rate" href="${rvUrl(p)}" aria-label="${p.v} reviews for ${p.n}. Open customer reviews">${stars(p.r)}<span>(${p.v})</span></a>
  <button type="button" class="sh-add" aria-label="Add ${p.n} to cart"><svg class="i add-ic" viewBox="0 0 24 24"><path d="M2 3h3l2.6 12.2a1 1 0 001 .8h9.6a1 1 0 001-.8L21 7H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg><svg class="i ok" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button></div>
 <button type="button" class="sh-open" aria-label="View ${p.n} details" aria-haspopup="dialog"></button></article></li>`;
 };

 /* ---------- FILTER + SORT + RENDER ---------- */
 const SORTS={
  popular:(a,b)=>b.v-a.v,
  newest:(a,b)=>b.id-a.id,
  rated:(a,b)=>b.r-a.r||b.v-a.v,
  low:(a,b)=>a.p-b.p,
  high:(a,b)=>b.p-a.p
 };
 const pass=p=>p.p>=S.min&&(S.max>=PRICE_MAX||p.p<=S.max)&&
  (!S.style.size||S.style.has(p.s))&&(!S.gender.size||S.gender.has(p.g))&&
  (!S.strap.size||S.strap.has(p.t))&&(!S.color.size||S.color.has(p.c));

 const activeCount=()=>S.style.size+S.gender.size+S.strap.size+S.color.size+((S.min>PRICE_MIN||S.max<PRICE_MAX)?1:0);

 function render(){
  const list=PRODUCTS.filter(pass).sort(SORTS[S.sort]);
  const size=pageSize(),total=list.length,n=Math.max(1,Math.ceil(total/size));
  if(S.page>n)S.page=n;
  const from=(S.page-1)*size,slice=list.slice(from,from+size);
  grid.innerHTML=slice.map(card).join('');
  grid.classList.toggle('list',S.view==='list');
  grid.hidden=!total;empty.hidden=!!total;
  count.textContent=total?`Showing ${from+1}–${from+slice.length} of ${total} product${total===1?'':'s'}`:'No products found';
  $('#shApply').textContent=total?`Show ${total} product${total===1?'':'s'}`:'No products found';
  renderPages(total,n,size);
  const a=activeCount();fN.textContent=a;fN.hidden=!a;
 }
 const chev=d=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
 function renderPages(total,n,size){
  if(total<=size){pages.innerHTML='';return}
  let h='';
  if(S.page>1)h+=`<button type="button" data-p="${S.page-1}" aria-label="Previous page">${chev('M15 5l-7 7 7 7')}</button>`;
  for(let i=1;i<=n;i++)h+=`<button type="button" data-p="${i}" aria-label="Page ${i}"${i===S.page?' aria-current="page"':''}>${i}</button>`;
  if(S.page<n)h+=`<button type="button" data-p="${S.page+1}" aria-label="Next page">${chev('M9 5l7 7-7 7')}</button>`;
  pages.innerHTML=h;
 }
 const change=()=>{S.page=1;render()};

 /* ---------- FILTER EVENTS ---------- */
 filters.addEventListener('change',e=>{
  const i=e.target.closest('input[data-g]');if(!i)return;
  const set=S[i.dataset.g];i.checked?set.add(i.value):set.delete(i.value);change();
 });
 $('#gColor').addEventListener('click',e=>{
  const b=e.target.closest('button[data-c]');if(!b)return;
  const on=b.getAttribute('aria-pressed')!=='true';
  b.setAttribute('aria-pressed',on);on?S.color.add(b.dataset.c):S.color.delete(b.dataset.c);change();
 });

 /* price slider: the two handles can never cross */
 const STEP=+minI.step;
 function syncRange(from){
  let lo=+minI.value,hi=+maxI.value;
  if(lo>hi-STEP){if(from===minI){lo=hi-STEP;minI.value=lo}else{hi=lo+STEP;maxI.value=hi}}
  S.min=lo;S.max=hi;
  const span=PRICE_MAX-PRICE_MIN;
  range.style.setProperty('--lo',(lo-PRICE_MIN)/span);range.style.setProperty('--hi',(hi-PRICE_MIN)/span);
  minI.style.zIndex=lo>PRICE_MAX-span*.15?2:''; /* keeps the lower handle reachable when both sit at the far end */
  $('#shMinO').textContent=fmt(lo);$('#shMaxO').textContent=fmt(hi)+(hi>=PRICE_MAX?'+':'');
 }
 [minI,maxI].forEach(i=>i.addEventListener('input',()=>{syncRange(i);change()}));

 function clearAll(){
  S.style.clear();S.gender.clear();S.strap.clear();S.color.clear();
  filters.querySelectorAll('input[data-g]').forEach(i=>i.checked=false);
  filters.querySelectorAll('#gColor button').forEach(b=>b.setAttribute('aria-pressed','false'));
  minI.value=PRICE_MIN;maxI.value=PRICE_MAX;syncRange();change();
 }
 $('#shClear').addEventListener('click',clearAll);
 $('#shEmptyClear').addEventListener('click',clearAll);

 /* ---------- SORT + VIEW ---------- */
 $('#shSort').addEventListener('change',e=>{S.sort=e.target.value;change()});
 const gBtn=$('#shGrid'),lBtn=$('#shList');
 const setView=v=>{S.view=v;gBtn.setAttribute('aria-pressed',v==='grid');lBtn.setAttribute('aria-pressed',v==='list');render()};
 gBtn.addEventListener('click',()=>setView('grid'));
 lBtn.addEventListener('click',()=>setView('list'));

 /* ---------- PAGINATION ---------- */
 pages.addEventListener('click',e=>{
  const b=e.target.closest('button[data-p]');if(!b)return;
  S.page=+b.dataset.p;render();
  results.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
 });

 /* ---------- HEARTS + ADD TO CART ---------- */
 /* ADD TO CART LOADING + RATE LIMIT (same as the old home page button): after a click the button shows a spinner for ADD_DELAY ms, then the watch is added.
    While it is loading, every Add to cart button ignores clicks, so fast repeated clicks can never fire many requests.
    Change ADD_DELAY (milliseconds) to make the loading shorter or longer. */
 const ADD_DELAY=900;
 let adding=false;
 const favBadge=$('#navFavCount');
 function showFavs(){if(!favBadge)return;favBadge.textContent=favs.size;favBadge.hidden=!favs.size}
 grid.addEventListener('click',e=>{
  const add=e.target.closest('.sh-add');
  if(add){
   if(adding||add.disabled)return; /* RATE LIMIT: while one add is loading, every Add to cart button ignores clicks */
   const c=add.closest('.sh-card'),pic=c.querySelector('.sh-img,.sh-w');
   adding=true;const html=add.innerHTML;
   clearTimeout(add._t);add.classList.remove('done');
   add.disabled=true;add.setAttribute('aria-busy','true');add.classList.add('loading');
   add.innerHTML='<i class="spin" aria-hidden="true"></i>';
   setTimeout(()=>{
    if(window.Cart)window.Cart.add(c,pic); /* same cart as the home page. The real add happens here, once, after the loading time. If you connect a database, send the request here. */
    adding=false;
    add.classList.remove('loading');add.innerHTML=html;add.classList.add('done');
    add._t=setTimeout(()=>{add.classList.remove('done');add.disabled=false;add.removeAttribute('aria-busy')},ADD_DELAY+500);
   },ADD_DELAY);
   return;
  }
  const fav=e.target.closest('.sh-fav');
  if(fav){
   const id=+fav.closest('.sh-card').dataset.id.slice(1),on=!favs.has(id);
   on?favs.add(id):favs.delete(id);
   fav.setAttribute('aria-pressed',on);saveFavs();showFavs();
  }
 });

 /* bottom-nav cart badge follows the header cart badge */
 const cc=$('#cartCount'),nc=$('#navCartCount');
 if(cc&&nc){const sync=()=>{nc.textContent=cc.textContent};sync();new MutationObserver(sync).observe(cc,{childList:true,characterData:true,subtree:true})}

 /* ---------- FILTER PANEL ON PHONES + TABLETS ---------- */
 const mq=matchMedia('(max-width:960px)');
 const isOpen=()=>filters.classList.contains('open');
 const syncInert=()=>{filters.inert=mq.matches&&!isOpen()};
 /* While the panel is open: freeze the page behind it (iOS-safe), make everything else inert, and swallow scroll gestures outside the panel */
 let lockY=0,inerted=[];
 function lockPage(){
  lockY=window.scrollY||document.documentElement.scrollTop||0;
  document.documentElement.style.setProperty('--sh-y',lockY+'px');
  document.documentElement.classList.add('sh-lock');
  inerted=[];let n=filters;
  while(n&&n!==document.body){
   const par=n.parentElement;
   if(par)[...par.children].forEach(sib=>{
    if(sib===n||sib===ov||/^(SCRIPT|STYLE|LINK)$/.test(sib.tagName)||sib.inert)return;
    sib.inert=true;inerted.push(sib);
   });
   n=par;
  }
 }
 function unlockPage(){
  inerted.forEach(el=>{el.inert=false});inerted=[];
  document.documentElement.classList.remove('sh-lock');
  document.documentElement.style.removeProperty('--sh-y');
  window.scrollTo({top:lockY,left:0,behavior:'instant'});
 }
 function panel(open,focus){
  if(open===isOpen())return;
  filters.classList.toggle('open',open);ov.classList.toggle('on',open);
  if(open)lockPage();else unlockPage();
  fToggle.setAttribute('aria-expanded',open);syncInert();
  if(focus!==false)(open?$('#shFClose'):fToggle).focus({preventScroll:true});
 }
 const blockOutside=e=>{if(isOpen()&&!filters.contains(e.target)){e.preventDefault();e.stopImmediatePropagation()}};
 window.addEventListener('wheel',blockOutside,{passive:false,capture:true});
 window.addEventListener('touchmove',blockOutside,{passive:false,capture:true});

 /* swipe the panel back to the left to close it */
 let sx=0,sy=0,sdx=0,sT=0,swiping=false,tracking=false;
 function swStart(e){
  if(!isOpen()||e.touches.length!==1||e.target.closest('input[type=range]')){tracking=false;return}
  tracking=true;swiping=false;sx=e.touches[0].clientX;sy=e.touches[0].clientY;sdx=0;sT=Date.now();
 }
 function swMove(e){
  if(!tracking)return;
  const dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
  if(!swiping){
   if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){tracking=false;return}
   if(dx<-10&&Math.abs(dx)>Math.abs(dy)){swiping=true;filters.classList.add('drag')}else return;
  }
  sdx=Math.min(0,dx);
  filters.style.transform='translateX('+sdx+'px)';
  ov.style.opacity=Math.max(0,1-Math.abs(sdx)/filters.offsetWidth);
 }
 function swEnd(){
  if(!tracking)return;tracking=false;
  if(!swiping)return;swiping=false;
  const fast=Math.abs(sdx)/Math.max(1,Date.now()-sT)>0.5;
  const shouldClose=Math.abs(sdx)>filters.offsetWidth*0.3||fast;
  filters.classList.remove('drag');filters.style.transform='';ov.style.opacity='';
  if(shouldClose)panel(false,false);
 }
 [filters,ov].forEach(el=>{
  el.addEventListener('touchstart',swStart,{passive:true});
  el.addEventListener('touchmove',swMove,{passive:true});
  el.addEventListener('touchend',swEnd,{passive:true});
  el.addEventListener('touchcancel',swEnd,{passive:true});
 });
 fToggle.addEventListener('click',()=>panel(!isOpen()));
 $('#shFClose').addEventListener('click',()=>panel(false));
 $('#shApply').addEventListener('click',()=>{panel(false);results.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})});
 ov.addEventListener('click',()=>panel(false,false));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen())panel(false)});
 mq.addEventListener('change',()=>{if(!mq.matches&&isOpen())panel(false,false);syncInert()});

 /* ---------- NEWSLETTER ---------- */
 const nlForm=$('#shNlForm'),nlEmail=$('#shNlEmail'),nlBtn=$('#shNlBtn'),nlMsg=$('#shNlMsg');
 nlForm.addEventListener('submit',e=>{
  e.preventDefault();
  const v=nlEmail.value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){
   nlMsg.textContent='Please enter a valid email address.';
   nlForm.classList.remove('bad');void nlForm.offsetWidth;nlForm.classList.add('bad');nlEmail.focus();return;
  }
  /* subscribe: send v to your email service here */
  nlBtn.disabled=true;nlBtn.firstElementChild.textContent='Subscribed';nlEmail.value='';
  nlMsg.textContent='Thank you for subscribing.';
 });

 /* ---------- BANNER PHOTO SLIDER ----------
    Same idea as the home page lifestyle banner: slowly crossfades the banner photos and moves the gold dot with them.
    SHOW_MS = how long each photo stays (7000 = 7 seconds); the fade length itself is --sh-fade in shop.css.
    It only runs while the banner is on screen and the tab is open. Clicking a dot jumps to that photo.
    A photo whose file is missing is skipped and its dot is removed. */
 (()=>{
  const B=$('.sh-banner'),box=B&&B.querySelector('.sh-dots');if(!B||!box)return;
  const SHOW_MS=7000;
  let items=[...B.querySelectorAll('.sh-slide')].map((img,n)=>({img,dot:box.children[n]})).filter(it=>it.dot);
  let i=0,timer=null,onScreen=false;
  const show=n=>{
   if(!items.length)return;
   i=(n+items.length)%items.length;
   items.forEach((it,k)=>{const on=k===i;it.img.classList.toggle('is-active',on);it.dot.classList.toggle('is-active',on);it.dot.setAttribute('aria-current',on?'true':'false')});
  };
  const stop=()=>{clearInterval(timer);timer=null};
  const start=()=>{stop();if(items.length>1&&onScreen&&!document.hidden)timer=setInterval(()=>show(i+1),SHOW_MS)};
  const drop=it=>{
   if(!items.includes(it))return;
   const was=it.img.classList.contains('is-active');
   it.img.remove();it.dot.remove();items=items.filter(x=>x!==it);
   if(was)show(0);else i=Math.max(0,items.findIndex(x=>x.img.classList.contains('is-active')));
   if(items.length<2){box.hidden=true;stop()}
  };
  items.slice().forEach(it=>{
   it.dot.addEventListener('click',()=>{show(items.indexOf(it));start()});
   it.img.addEventListener('error',()=>drop(it));
   if(it.img.complete&&!it.img.naturalWidth&&it.img.getAttribute('src'))drop(it);
  });
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  if('IntersectionObserver' in window)new IntersectionObserver(([e])=>{onScreen=e.isIntersecting;onScreen?start():stop()},{threshold:.2}).observe(B);
  else{onScreen=true;start()}
 })();

 /* =====================================================================
    PRODUCT POP-UP (quick view): opens when a shopper clicks a watch on the shop page.
    Extra photos + a video for a watch go in DETAIL below (see the notes there). Everything else is built from the PRODUCTS list.
    ===================================================================== */
 const DETAIL={
  /* Add one line per watch, using the same number as data-id in shop.html. Every key is optional:
     imgs:   more photos            ['/products/classic-steel.webp','/products/classic-steel-2.jpg']
     video:  a video file           '/assets/video/classic-steel.mp4'      (poster: '/products/classic-steel-video.jpg' is optional)
     old:    old price (number)     22000   -> shows it crossed out with the % off
     colors: colour choices         [['silver','/products/a.png'],['black','/products/b.png'],['gold','/products/c.png']]  (picture is optional)
     sizes:  case sizes             ['40mm','42mm','44mm']
     desc / features / specs: your own words (specs is a list like [['Movement','Quartz']])
     A file that is missing is skipped automatically (its small picture disappears). */
  1:{imgs:[],video:'',poster:'',old:22000}
 };
 /* TEMPORARY PLACEHOLDERS: gives every watch two other watch pictures so you can see how the gallery looks.
    DELETE this whole block when the admin dashboard supplies the real pictures. */
 (()=>{
  const all=[...new Set(PRODUCTS.map(p=>p.img).filter(Boolean))];
  PRODUCTS.forEach(p=>{
   if(DETAIL[p.id]&&DETAIL[p.id].imgs&&DETAIL[p.id].imgs.length)return; /* a watch you filled in by hand keeps its own pictures */
   const others=all.filter(s=>s!==p.img),i=p.id%others.length;
   DETAIL[p.id]=Object.assign({},DETAIL[p.id],{imgs:[others[i],others[(i+3)%others.length]]});
  });
 })();
 const SIZES=['40mm','42mm','44mm'],SIZE_DEFAULT='42mm';
 const FEATURES=['Premium stainless steel build','Scratch-resistant glass','Water resistant design','Elegant and versatile'];
 const STYLE_COPY={
  classic:'A refined everyday classic with clean lines and a dial that reads at a glance.',
  elegant:'Slim, polished and understated: made to sit under a cuff and still be noticed.',
  sport:'Built for an active day, with a confident look that is just as sharp off the clock.',
  bold:'A statement piece with real presence on the wrist, finished to the last detail.'
 };
 const SHIPPING=['Delivery fee and time are shown at checkout, based on your address.','Every watch is checked and packed in the Velantis gift box.','1 Year Warranty on every watch.','Need help with an order? Our support team is available 24/7.'];
 const TRUST=[
  ['1 Year','Warranty','<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z"/>'],
  ['Fast','Delivery','<path d="M2.5 6.5h11v9.5h-11zM13.5 9.5h4l3 3.3V16h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'],
  ['24/7','Support','<path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>']
 ];
 const IC={
  x:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  prev:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  heart:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/></svg>',
  cart:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h3l2.6 12.2a1 1 0 001 .8h9.6a1 1 0 001-.8L21 7H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
  check:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>'
 };
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

 const qv=document.createElement('div');
 qv.className='qv';qv.id='qv';qv.hidden=true;
 qv.innerHTML=`<div class="qv-ov" data-close></div>
 <div class="qv-dialog" role="dialog" aria-modal="true" aria-labelledby="qvTitle" tabindex="-1">
  <button type="button" class="qv-x" data-close aria-label="Close">${IC.x}</button>
  <div class="qv-scroll" data-lenis-prevent id="qvBody"></div>
  <div class="qv-foot" id="qvFoot"></div>
 </div>`;
 document.body.appendChild(qv);
 const qvBody=qv.querySelector('#qvBody'),qvFoot=qv.querySelector('#qvFoot'),qvDialog=qv.querySelector('.qv-dialog');

 let Q=null,qvOpener=null,qvLockY=0,qvInert=[],qvTimer=0;

 const qvItems=p=>{
  const d=DETAIL[p.id]||{},list=[];
  const add=s=>{if(s&&!list.some(x=>x.src===s))list.push({t:'img',src:s})};
  add(p.img);(d.imgs||[]).forEach(add);
  if(!list.length)list.push({t:'drawn'});
  if(d.video)list.push({t:'video',src:d.video,poster:d.poster||''});
  return list;
 };
 const thumb=(it,n)=>{
  let inner;
  if(it.t==='img')inner=`<img src="${esc(it.src)}" alt="" loading="lazy" decoding="async">`;
  else if(it.t==='video')inner=(it.poster?`<img src="${esc(it.poster)}" alt="" loading="lazy">`:`<video src="${esc(it.src)}#t=0.1" muted playsinline preload="metadata" tabindex="-1"></video>`)+`<span class="qv-play"><i>${IC.play}</i></span>`;
  else inner=drawn(Q.p);
  return `<button type="button" class="qv-th" data-i="${n}" aria-label="${it.t==='video'?'Play video':'Show photo '+(n+1)}" aria-current="${n===Q.i}">${inner}</button>`;
 };
 const stageHTML=it=>{
  if(it.t==='video')return `<video class="qv-video" src="${esc(it.src)}" ${it.poster?`poster="${esc(it.poster)}"`:''} controls playsinline preload="metadata"></video>`;
  if(it.t==='img')return `<img class="qv-img" data-round src="${esc(it.src)}" alt="${esc(Q.p.n)}" decoding="async">`;
  return drawn(Q.p);
 };

 function qvBuild(p){
  const d=DETAIL[p.id]||{};
  const colors=(d.colors&&d.colors.length)?d.colors:[[p.c]];
  const sizes=d.sizes||SIZES;
  Q={p,i:0,items:qvItems(p),color:p.c,size:sizes.includes(SIZE_DEFAULT)?SIZE_DEFAULT:sizes[0],sizes,colors,d};
  const off=d.old&&d.old>p.p?Math.round((1-p.p/d.old)*100):0;
  const badge=p.b?`<span class="sh-badge ${p.b==='New'?'new':'best'}">${p.b}</span>`:'';
  const multi=Q.items.length>1;
  const sw=colors.map(c=>{const meta=COLORS.find(x=>x[0]===c[0])||[c[0],c[0],'#999'];return `<button type="button" class="qv-sw" data-c="${c[0]}" style="--c:${meta[2]}" aria-pressed="${c[0]===Q.color}" aria-label="${meta[1]}" title="${meta[1]}"></button>`}).join('');
  const chips=sizes.map(s=>`<button type="button" class="qv-chip" data-s="${s}" aria-pressed="${s===Q.size}">${s}</button>`).join('');
  const feats=(d.features||FEATURES).map(f=>`<li>${esc(f)}</li>`).join('');
  const specRows=[['Style',LABEL[p.s]],['Gender',LABEL[p.g]],['Strap type',LABEL[p.t]],['Colour','<span id="qvSpC">'+LABEL[p.c]+'</span>'],['Case size','<span id="qvSpS">'+Q.size+'</span>'],['Warranty','1 Year']].concat((d.specs||[]).map(r=>[esc(r[0]),esc(r[1])]));
  const specs=specRows.map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('');
  qvBody.innerHTML=`<div class="qv-top">
   <div class="qv-gal${multi?'':' single'}">
    ${multi?`<div class="qv-thumbs" id="qvThumbs">${Q.items.map(thumb).join('')}</div>`:''}
    <div class="qv-stage" id="qvStage">${badge}
     <div class="qv-media" id="qvMedia"></div>
     ${multi?`<button type="button" class="qv-nav prev" data-nav="-1" aria-label="Previous photo">${IC.prev}</button><button type="button" class="qv-nav next" data-nav="1" aria-label="Next photo">${IC.next}</button><span class="qv-count" id="qvCount"></span>`:''}
    </div>
   </div>
   <div class="qv-info">
    <h2 class="qv-title" id="qvTitle">${esc(p.n)}</h2>
    <a class="qv-rate" href="${rvUrl(p)}" aria-label="${p.v} reviews for ${p.n}. Open customer reviews">${stars(p.r)}<span><b>${p.r.toFixed(1)}</b> (${p.v} reviews)</span></a>
    <div class="qv-price"><b>${fmt(p.p)}</b>${off?`<s>${fmt(d.old)}</s><span class="qv-off">${off}% OFF</span>`:''}</div>
    <p class="qv-lede">${esc(d.desc||`Timeless elegance meets modern craftsmanship. The ${p.n} is designed for those who value style, precision and durability in every moment.`)}</p>
    <p class="qv-lbl">Colour: <span id="qvColL">${LABEL[p.c]}</span></p>
    <div class="qv-sws" id="qvSws">${sw}</div>
    <p class="qv-lbl">Size: <span id="qvSizeL">${Q.size}</span></p>
    <div class="qv-chips" id="qvChips">${chips}</div>
    <div class="qv-buy">${buyBtns()}</div>
    <div class="qv-trust">${TRUST.map(t=>`<div><i><svg class="i" viewBox="0 0 24 24" aria-hidden="true">${t[2]}</svg></i><b>${t[0]}</b><span>${t[1]}</span></div>`).join('')}</div>
   </div>
  </div>
  <div class="qv-more">
   <div class="qv-tabs" role="tablist" aria-label="Product details">
    <button type="button" class="qv-tab" role="tab" id="qt0" aria-controls="qp0" aria-selected="true" data-t="0">Description</button>
    <button type="button" class="qv-tab" role="tab" id="qt1" aria-controls="qp1" aria-selected="false" data-t="1" tabindex="-1">Specifications</button>
    <button type="button" class="qv-tab" role="tab" id="qt2" aria-controls="qp2" aria-selected="false" data-t="2" tabindex="-1">Shipping Info</button>
    <button type="button" class="qv-tab" role="tab" id="qt3" aria-controls="qp3" aria-selected="false" data-t="3" tabindex="-1">Reviews (${p.v})</button>
   </div>
   <div class="qv-panel" role="tabpanel" id="qp0" aria-labelledby="qt0"><p>${esc(d.desc?d.desc:`The ${p.n} is a perfect blend of sophistication and performance. ${STYLE_COPY[p.s]}`)}</p><ul class="qv-list">${feats}</ul></div>
   <div class="qv-panel" role="tabpanel" id="qp1" aria-labelledby="qt1" hidden><dl class="qv-specs">${specs}</dl></div>
   <div class="qv-panel" role="tabpanel" id="qp2" aria-labelledby="qt2" hidden><ul class="qv-list one">${SHIPPING.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>
   <div class="qv-panel" role="tabpanel" id="qp3" aria-labelledby="qt3" hidden><div class="qv-rv"><b>${p.r.toFixed(1)}</b><div>${stars(p.r)}<p>Based on ${p.v} customer reviews</p><a class="qv-rvlink" href="${rvUrl(p)}">See all customer reviews</a></div></div></div>
  </div>`;
  qvFoot.innerHTML=`<div class="qv-foot-p"><small>Price</small><b>${fmt(p.p)}</b></div>${buyBtns()}`;
  qvShow(0,false);qvFav();
 }
 const buyBtns=()=>`<button type="button" class="qv-add" data-act="add">${IC.cart}<span>Add to Cart</span></button><button type="button" class="qv-fav" data-act="fav" aria-pressed="false" aria-label="Save to wishlist">${IC.heart}</button>`;

 /* show photo / video number n in the big place */
 function qvShow(n,play){
  const media=qv.querySelector('#qvMedia');if(!media||!Q)return;
  media.querySelectorAll('video').forEach(v=>v.pause());
  Q.i=(n+Q.items.length)%Q.items.length;
  const it=Q.items[Q.i];
  media.innerHTML=stageHTML(it);
  qv.querySelector('#qvStage').classList.toggle('is-video',it.t==='video');
  qv.querySelectorAll('.qv-th').forEach((b,k)=>{const on=k===Q.i;b.setAttribute('aria-current',on);if(on&&play!==false)b.scrollIntoView({block:'nearest',inline:'nearest'})});
  const c=qv.querySelector('#qvCount');if(c)c.textContent=(Q.i+1)+' / '+Q.items.length;
  const v=media.querySelector('video');
  if(v){
   v.addEventListener('error',()=>qvDrop(it),{once:true});
   if(play!==false){const pr=v.play();if(pr&&pr.catch)pr.catch(()=>{})}
  }
  const im=media.querySelector('img.qv-img');
  if(im)im.addEventListener('error',()=>qvDrop(it),{once:true});
 }
 /* a photo or video file that cannot be loaded is removed (its small picture too) instead of showing a broken icon */
 function qvDrop(it){
  if(!Q)return;const k=Q.items.indexOf(it);if(k<0)return;
  if(Q.items.length===1){Q.items=[{t:'drawn'}];Q.i=0;qvRethumbs();qvShow(0,false);return}
  Q.items.splice(k,1);
  const n=Q.i>k?Q.i-1:Math.min(Q.i,Q.items.length-1);
  qvRethumbs();qvShow(n,false);
 }
 function qvRethumbs(){
  const box=qv.querySelector('#qvThumbs'),gal=qv.querySelector('.qv-gal');
  if(Q.items.length<2){if(box)box.remove();gal.classList.add('single');qv.querySelectorAll('.qv-nav,.qv-count').forEach(e=>e.remove());return}
  if(box)box.innerHTML=Q.items.map(thumb).join('');
 }

 function qvFav(){
  if(!Q)return;const on=favs.has(Q.p.id);
  qv.querySelectorAll('.qv-fav').forEach(b=>{b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'Remove from wishlist':'Save to wishlist')});
 }

 /* ---------- open / close ---------- */
 function qvLock(){
  qvLockY=window.scrollY||document.documentElement.scrollTop||0;
  document.documentElement.style.setProperty('--qv-y',qvLockY+'px');
  document.documentElement.classList.add('qv-lock');
  qvInert=[...document.body.children].filter(el=>el!==qv&&!/^(SCRIPT|STYLE|LINK)$/.test(el.tagName)&&!/^velantis-livechat/.test(el.id)&&!el.inert); /* the live chat button + panel stay clickable */
  qvInert.forEach(el=>{el.inert=true});
  if(window.lenis)window.lenis.stop();
 }
 function qvUnlock(){
  qvInert.forEach(el=>{el.inert=false});qvInert=[];
  document.documentElement.classList.remove('qv-lock');
  document.documentElement.style.removeProperty('--qv-y');
  window.scrollTo({top:qvLockY,left:0,behavior:'instant'});
  if(window.lenis)window.lenis.start();
 }
 const qvIsOpen=()=>qv.classList.contains('on');
 function qvOpen(id,opener){
  const p=PRODUCTS.find(x=>x.id===id);if(!p||qvIsOpen())return;
  clearTimeout(qvTimer);qvOpener=opener||document.activeElement;
  qvBuild(p);qvBody.scrollTop=0;
  qv.hidden=false;void qv.offsetWidth;
  qvLock();qv.classList.add('on');
  qvDialog.focus({preventScroll:true});
 }
 function qvClose(){
  if(!qvIsOpen())return;
  qv.querySelectorAll('video').forEach(v=>v.pause());
  qv.classList.remove('on');qvUnlock();
  if(qvOpener&&qvOpener.focus)qvOpener.focus({preventScroll:true});
  qvTimer=setTimeout(()=>{qv.hidden=true;qvBody.innerHTML='';qvFoot.innerHTML='';Q=null},reduce?0:340);
 }

 /* ---------- add to cart from the pop-up (same cart, same spinner and rate limit as the grid buttons) ---------- */
 function qvAdd(btn){
  if(!Q||adding||btn.disabled)return;
  const p=Q.p;adding=true;
  const label=btn.innerHTML;
  qv.querySelectorAll('.qv-add').forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true')});
  btn.innerHTML='<i class="spin" aria-hidden="true"></i><span>Adding…</span>';
  const src=qv.querySelector('#qvMedia img.qv-img')||qv.querySelector('.qv-th img')||null; /* the picture that flies to the cart icon */
  setTimeout(()=>{
   if(window.Cart){
    const proxy=document.createElement('div');
    proxy.dataset.id='s'+p.id;proxy.dataset.brand='Velantis';proxy.dataset.model=p.n;
    proxy.dataset.desc=`${LABEL[p.t]} strap | ${LABEL[Q.color]} | ${Q.size}`;proxy.dataset.price=p.p;
    if(p.img)proxy.innerHTML=`<img class="watch" src="${esc(p.img)}" alt="">`;
    window.Cart.add(proxy,src);
   }
   adding=false;
   btn.innerHTML=IC.check+'<span>Added</span>';btn.classList.add('done');
   setTimeout(()=>{qv.querySelectorAll('.qv-add').forEach(b=>{b.disabled=false;b.removeAttribute('aria-busy');b.classList.remove('done');b.innerHTML=label})},ADD_DELAY+500);
  },ADD_DELAY);
 }

 /* ---------- events ---------- */
 grid.addEventListener('click',e=>{
  const o=e.target.closest('.sh-open');if(!o)return;
  qvOpen(+o.closest('.sh-card').dataset.id.slice(1),o);
 });
 qv.addEventListener('click',e=>{
  if(e.target.closest('[data-close]'))return qvClose();
  const th=e.target.closest('.qv-th');if(th)return qvShow(+th.dataset.i);
  const nav=e.target.closest('.qv-nav');if(nav)return qvShow(Q.i+ +nav.dataset.nav,false);
  const sw=e.target.closest('.qv-sw');
  if(sw){
   Q.color=sw.dataset.c;
   qv.querySelectorAll('.qv-sw').forEach(b=>b.setAttribute('aria-pressed',b===sw));
   qv.querySelector('#qvColL').textContent=LABEL[Q.color];const sc=qv.querySelector('#qvSpC');if(sc)sc.textContent=LABEL[Q.color];
   const pic=(Q.colors.find(c=>c[0]===Q.color)||[])[1]; /* a colour with its own picture swaps the first photo */
   if(pic){const f=Q.items.findIndex(x=>x.t==='img'||x.t==='drawn');if(f>-1)Q.items[f]={t:'img',src:pic};qvRethumbs();qvShow(f>-1?f:0,false)}
   return;
  }
  const ch=e.target.closest('.qv-chip');
  if(ch){
   Q.size=ch.dataset.s;
   qv.querySelectorAll('.qv-chip').forEach(b=>b.setAttribute('aria-pressed',b===ch));
   qv.querySelector('#qvSizeL').textContent=Q.size;const ss=qv.querySelector('#qvSpS');if(ss)ss.textContent=Q.size;
   return;
  }
  const tab=e.target.closest('.qv-tab');
  if(tab){
   qv.querySelectorAll('.qv-tab').forEach(b=>{const on=b===tab;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1});
   qv.querySelectorAll('.qv-panel').forEach(pn=>{pn.hidden=pn.id!=='qp'+tab.dataset.t});
   return;
  }
  const act=e.target.closest('[data-act]');
  if(!act)return;
  if(act.dataset.act==='add')return qvAdd(act);
  if(act.dataset.act==='fav'){
   const id=Q.p.id,on=!favs.has(id);on?favs.add(id):favs.delete(id);
   saveFavs();showFavs();qvFav();
   const g=grid.querySelector('.sh-card[data-id="s'+id+'"] .sh-fav');if(g)g.setAttribute('aria-pressed',on);
  }
 });
 document.addEventListener('keydown',e=>{
  if(!qvIsOpen())return;
  if(e.key==='Escape'){e.preventDefault();qvClose()}
  else if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&Q&&Q.items.length>1&&!e.target.closest('video,.qv-tabs')){qvShow(Q.i+(e.key==='ArrowRight'?1:-1),false)}
 });
 /* a small picture whose file is missing is removed too */
 qv.addEventListener('error',e=>{
  const b=e.target.closest&&e.target.closest('.qv-th');if(!b||!Q)return;
  const it=Q.items[+b.dataset.i];if(it&&it.t!=='drawn')qvDrop(it);
 },true);
 /* swipe the big picture left / right on a phone */
 let tx=0,ty=0,tOn=false;
 qv.addEventListener('touchstart',e=>{const m=e.target.closest('.qv-media');tOn=!!m&&!e.target.closest('video')&&e.touches.length===1;if(tOn){tx=e.touches[0].clientX;ty=e.touches[0].clientY}},{passive:true});
 qv.addEventListener('touchend',e=>{
  if(!tOn||!Q)return;tOn=false;
  const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)qvShow(Q.i+(dx<0?1:-1),false);
 },{passive:true});
 /* if the wishlist heart is used on the grid while the pop-up exists, nothing to sync (the pop-up is closed then) */

 /* ---------- SWIPE DOWN TO CLOSE (phone sheet) ----------
    Drag the sheet down from its top edge, or from anywhere while its content is scrolled to the top. The sheet follows your finger.
    Let go past CLOSE_DRAG pixels (or flick it down quickly) and it closes; let go sooner and it springs back. Desktop is not affected. */
 const SHEET=matchMedia('(max-width:780px)'),CLOSE_DRAG=110,qvOv=qv.querySelector('.qv-ov');
 let dx0=0,dy0=0,dY=0,dT=0,dTop=false,dOn=false,dTrack=false;
 qv.addEventListener('touchstart',e=>{
  dTrack=false;dOn=false;
  if(!SHEET.matches||!qvIsOpen()||e.touches.length!==1)return;
  if(e.target.closest('video,input'))return;
  const t=e.touches[0];
  dTop=t.clientY-qvDialog.getBoundingClientRect().top<56; /* the handle / close-button strip at the top always pulls the sheet */
  if(!dTop&&qvBody.scrollTop>0)return; /* content is scrolled down: the finger scrolls it instead */
  dTrack=true;dx0=t.clientX;dy0=t.clientY;dY=0;dT=Date.now();
 },{passive:true});
 qv.addEventListener('touchmove',e=>{
  if(!dTrack)return;
  const t=e.touches[0],dx=t.clientX-dx0,dy=t.clientY-dy0;
  if(!dOn){
   if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){dTrack=false;return} /* sideways: photo swipe or the small pictures row */
   if(dy<-6){dTrack=false;return} /* upwards: normal scrolling */
   if(dy<8)return;
   if(!dTop&&qvBody.scrollTop>0){dTrack=false;return}
   dOn=true;qvDialog.style.transition='none';
  }
  e.preventDefault();
  dY=Math.max(0,dy);
  qvDialog.style.transform='translateY('+dY+'px)';
  qvOv.style.opacity=Math.max(.15,1-dY/(qvDialog.offsetHeight*.9));
 },{passive:false});
 const dEnd=()=>{
  dTrack=false;
  if(!dOn)return;
  dOn=false;
  const fast=dY/Math.max(1,Date.now()-dT)>0.6;
  qvDialog.style.transition='';qvDialog.style.transform='';qvOv.style.opacity='';
  if(dY>CLOSE_DRAG||(fast&&dY>40))qvClose(); /* closes from where the finger let go */
 };
 qv.addEventListener('touchend',dEnd,{passive:true});
 qv.addEventListener('touchcancel',dEnd,{passive:true});

 /* ---------- START ---------- */
 DESKTOP.addEventListener('change',change); /* page size changes when the window crosses the desktop width */
 WIDE.addEventListener('change',change); /* ...and when it crosses the wide desktop width (4 columns) */
 PHONE.addEventListener('change',change); /* ...and when it crosses the phone width */
 syncRange();showFavs();syncInert();render();
})();