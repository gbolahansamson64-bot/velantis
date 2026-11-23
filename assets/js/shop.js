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
   - picture (optional): path of the real photo, e.g. '/assets/images/products/classic-steel.png'.
     Until a watch has a picture, a drawn watch in its colours is shown instead.
   ===================================================================== */
(()=>{
 'use strict';
 const $=s=>document.querySelector(s);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

 /* ---------- SETTINGS ---------- */
 const CURRENCY='₦',PRICE_MIN=10000,PRICE_MAX=100000; /* at PRICE_MAX the price filter has no upper limit */
 const DESKTOP=matchMedia('(min-width:961px)');
 const PHONE=matchMedia('(max-width:780px)'); /* phone width: the grid is 2 columns here */
 const pageSize=()=>DESKTOP.matches?9:PHONE.matches?8:12; /* products per page: 9 on desktop, 8 on phone (4 even rows of 2), 12 on tablet (4 even rows of 3) */
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
 const card=p=>{
  const desc=`${LABEL[p.t]} strap | ${LABEL[p.c]}`;
  const badge=p.b?`<span class="sh-badge ${p.b==='New'?'new':'best'}">${p.b}</span>`:'';
  const f=favs.has(p.id);
  return `<li><article class="sh-card" data-id="s${p.id}" data-brand="Velantis" data-model="${p.n}" data-desc="${desc}" data-price="${p.p}">
 <div class="sh-pic">${badge}<button type="button" class="sh-fav" aria-pressed="${f}" aria-label="Save ${p.n}"><svg class="i" viewBox="0 0 24 24"><path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/></svg></button>${pic(p)}</div>
 <div class="sh-info"><h3 class="sh-name">${p.n}</h3><p class="sh-desc">${desc}</p><b class="sh-price">${fmt(p.p)}</b><div class="sh-rate">${stars(p.r)}<span>(${p.v})</span></div>
  <button type="button" class="sh-add" aria-label="Add ${p.n} to cart"><svg class="i cart" viewBox="0 0 24 24"><path d="M2 3h3l2.6 12.2a1 1 0 001 .8h9.6a1 1 0 001-.8L21 7H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg><svg class="i ok" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button></div>
 </article></li>`;
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
 const favBadge=$('#navFavCount');
 function showFavs(){if(!favBadge)return;favBadge.textContent=favs.size;favBadge.hidden=!favs.size}
 grid.addEventListener('click',e=>{
  const add=e.target.closest('.sh-add');
  if(add){
   const c=add.closest('.sh-card');
   if(window.Cart)window.Cart.add(c,c.querySelector('.sh-img,.sh-w')); /* same cart as the home page */
   add.classList.add('done');clearTimeout(add._t);add._t=setTimeout(()=>add.classList.remove('done'),1400);
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
 function panel(open,focus){
  filters.classList.toggle('open',open);ov.classList.toggle('on',open);
  document.documentElement.classList.toggle('sh-lock',open);
  fToggle.setAttribute('aria-expanded',open);syncInert();
  if(focus!==false)(open?$('#shFClose'):fToggle).focus({preventScroll:true});
 }
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

 /* ---------- START ---------- */
 DESKTOP.addEventListener('change',change); /* page size changes when the window crosses the desktop width */
 PHONE.addEventListener('change',change); /* ...and when it crosses the phone width */
 syncRange();showFavs();syncInert();render();
})();