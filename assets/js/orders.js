/* =====================================================================
   MY ORDERS PAGE (orders.html)
   Reads the signed-in customer's orders from the browser, one list per account under "velantis_orders:<email>" (checkout.js adds an order there after a
   successful payment, as {ref,date,status,gateway,sub,shipping,total,items:[{id,q,b,m,d,p,img}],details:{name,email,phone,state,address,note}}).
   Not signed in = sent to login.html first and brought back here afterwards.
   status is one of: processing, shipped, delivered, cancelled. New orders start as "processing"; when your backend is ready, replace load() with an API call
   and let the server move the status along.
   Preview the design without real orders: open orders.html?demo=1 (sample orders, nothing is saved).
   Quick tuning: CURRENCY = money symbol, STATUS = the label / icon of each status.
   ===================================================================== */
(()=>{
 const $=id=>document.getElementById(id),CURRENCY='₦',KEY='velantis_user',MAX=10;
 const fmt=n=>CURRENCY+Math.round(+n||0).toLocaleString('en-US');
 const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const readUser=()=>{try{const u=JSON.parse(localStorage.getItem(KEY)||'null');return u&&typeof u==='object'&&(u.name||u.email)?u:null}catch(e){return null}};
 const user=readUser();
 if(!user){location.replace('login.html?redirect='+encodeURIComponent('/orders.html'));return}

 /* ----- who + sidebar ----- */
 const name=String(user.name||'').trim()||String(user.email||'').split('@')[0]||'Member';
 $('orHi').textContent='Hi, '+name;$('orMail').textContent=user.email||'';
 const av=$('orAv');av.textContent=name.charAt(0).toUpperCase();
 if(user.picture&&/^(https?:|data:image\/|\/)/.test(user.picture)){const im=new Image();im.alt='';im.onload=()=>av.appendChild(im);im.src=user.picture}
 $('orOut').addEventListener('click',async()=>{
  try{if(window.VelantisAuth&&window.VelantisAuth.signOut)await window.VelantisAuth.signOut()}catch(e){}
  try{localStorage.removeItem(KEY)}catch(e){}
  location.replace('login.html');
 });

 /* ----- orders ----- */
 const demo=/[?&]demo=1\b/.test(location.search);
 const storeKey=()=>'velantis_orders:'+String(user.email||user.name||'').trim().toLowerCase();
 const day=n=>new Date(Date.now()-n*864e5).toISOString();
 const sample=()=>{
  const it=(id,b,m,d,p,q,img)=>({id,b,m,d,p,q,img});
  const a=it('s1','Velantis','Classic Steel','Metal strap | Silver',18000,1,'/products/classic-steel.webp'),
        b=it('s2','Velantis','Golden Elegance','Metal strap | Gold',22000,1,'/products/product-data2.webp'),
        c=it('s28','Velantis','Ivory Minimal','Leather strap | Silver',11500,1,'/products/product-data10.webp'),
        d=it('s9','Velantis','Riviera Gold','Metal strap | Gold',31000,1,'/products/product-data9.webp');
  const mk=(ref,n,status,items)=>{const sub=items.reduce((s,i)=>s+i.p*i.q,0);return{ref,date:day(n),status,gateway:'paystack',sub,shipping:0,total:sub,items,details:{name,email:user.email||'',phone:'0801 234 5678',state:'Lagos',address:'12 Admiralty Way, Lekki Phase 1'}}};
  return[mk('VL-20261127-003',0,'processing',[c]),mk('VL-20261120-002',7,'shipped',[d,b]),mk('VL-20261115-001',12,'delivered',[a,b]),mk('VL-20261102-000',25,'cancelled',[a])];
 };
 const load=()=>{
  if(demo)return sample();
  try{const l=JSON.parse(localStorage.getItem(storeKey())||'[]');return Array.isArray(l)?l.filter(o=>o&&o.ref&&Array.isArray(o.items)):[]}catch(e){return[]}
 };
 let orders=[],filter='all',open=null;

 const I={
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  truck:'<path d="M2 6h12v9H2zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  cart:'<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  go:'<path d="M5 12h14M13 6l6 6-6 6"/>'
 };
 const svg=p=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
 const STATUS={
  delivered:{t:'Delivered',i:I.check,act:'Buy Again',ai:I.cart},
  processing:{t:'Processing',i:I.clock,act:'Track Order',ai:I.truck},
  shipped:{t:'Shipped',i:I.truck,act:'Track Order',ai:I.truck},
  cancelled:{t:'Cancelled',i:I.x,act:'View Details',ai:I.eye}
 };
 const STEPS=['Order placed','Processing','Shipped','Delivered'],STEP_AT={processing:1,shipped:2,delivered:3};
 const GATE={paystack:'Paystack',flutterwave:'Flutterwave'};
 const when=iso=>{const d=new Date(iso);return isNaN(d)?'':d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})};
 const count=o=>o.items.reduce((s,i)=>s+(+i.q||0),0);

 function details(o){
  const st=STATUS[o.status]?o.status:'processing',idx=STEP_AT[st];
  const trk=st==='cancelled'?'<div class="or-box" style="margin-bottom:6px"><h4>Cancelled</h4><p>This order was cancelled. If you were charged, the amount returns to your payment method.</p></div>'
   :'<ol class="or-trk" aria-label="Order progress">'+STEPS.map((s,k)=>{
     const cls=(k<idx||(st==='delivered'&&k===idx))?'on':(k===idx?'cur':'');
     return`<li class="${cls}"${k===idx?' aria-current="step"':''}><i>${cls==='on'?svg(I.check):k+1}</i><span>${s}</span></li>`}).join('')+'</ol>';
  const rows=o.items.map(i=>`<div class="or-li">${i.img?`<img src="${esc(i.img)}" alt="" loading="lazy">`:'<span class="or-ph"></span>'}<div><b>${esc((i.b+' '+i.m).trim())}</b><small>Qty: ${+i.q||1}${i.d?' · '+esc(i.d):''}</small></div><strong>${fmt(i.p*i.q)}</strong></div>`).join('');
  const d=o.details||{};
  const ship=[d.name,d.phone,d.address,d.state].filter(Boolean).map(esc).join('<br>');
  return`<div class="or-dt" id="dt-${esc(o.ref)}">${trk}${rows}
   <div class="or-info2"><div class="or-box"><h4>Delivery</h4><p>${ship||'Not available'}</p></div><div class="or-box"><h4>Payment</h4><p>${esc(GATE[o.gateway]||o.gateway||'Online payment')}<br>Ref: ${esc(o.ref)}</p></div></div>
   <dl class="or-sum"><div><dt>Subtotal</dt><dd>${fmt(o.sub!=null?o.sub:o.total)}</dd></div><div><dt>Shipping</dt><dd>${fmt(o.shipping||0)}</dd></div><div class="t"><dt>Total</dt><dd>${fmt(o.total)}</dd></div></dl></div>`;
 }
 function card(o){
  const key=STATUS[o.status]?o.status:'processing',s=STATUS[key],first=o.items[0]||{},n=count(o),isOpen=open===o.ref;
  const more=o.items.length>1?`<i>+${o.items.length-1}</i>`:'';
  return`<li class="or-card" data-ref="${esc(o.ref)}"><div class="or-row">
   <div class="or-th">${first.img?`<img src="${esc(first.img)}" alt="${esc((first.b+' '+first.m).trim())}" loading="lazy">`:''}${more}</div>
   <div class="or-info"><div class="or-top"><h3>Order #${esc(o.ref)}</h3><span class="or-st st-${key}">${svg(s.i)}${s.t}</span></div>
    <p class="or-meta">Placed on: ${when(o.date)} • ${n} item${n===1?'':'s'}</p>
    <button type="button" class="or-tg" data-a="toggle" aria-expanded="${isOpen}" aria-controls="dt-${esc(o.ref)}"><span>${isOpen?'Hide Order Details':'View Order Details'}</span>${svg(I.go)}</button></div>
   <div class="or-act"><b class="or-total">${fmt(o.total)}</b><button type="button" class="or-btn" data-a="${key==='delivered'?'again':key==='cancelled'?'toggle':'track'}">${svg(s.ai)}${s.act}</button></div>
  </div>${isOpen?details(o):''}</li>`;
 }

 const list=$('orList'),empty=$('orEmpty');
 function render(){
  const shown=orders.filter(o=>filter==='all'||o.status===filter);
  list.innerHTML=shown.map(card).join('');
  empty.hidden=!!shown.length;
  const a=$('orEmptyA');
  if(!shown.length){
   if(!orders.length){$('orEmptyT').textContent='No orders yet';$('orEmptyP').textContent='When you place an order, it will show up here so you can follow it.';a.textContent='Browse the collection';a.setAttribute('href','shop.html');delete a.dataset.reset}
   else{const l=(STATUS[filter]||{}).t||'';$('orEmptyT').textContent='No '+l.toLowerCase()+' orders';$('orEmptyP').textContent='You have no orders with this status right now.';a.textContent='View all orders';a.setAttribute('href','#');a.dataset.reset='1'}
  }
  $('orFilter').value=filter;
  $('orChips').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.f===filter)));
 }
 function setFilter(f){filter=f;open=null;render()}
 $('orFilter').addEventListener('change',e=>setFilter(e.target.value));
 $('orChips').addEventListener('click',e=>{const b=e.target.closest('button[data-f]');if(b)setFilter(b.dataset.f)});
 empty.addEventListener('click',e=>{const a=e.target.closest('a[data-reset]');if(a){e.preventDefault();setFilter('all')}});

 /* BUY AGAIN: puts every watch of the order back in the cart through the cart panel's own add(), then opens the cart */
 function again(o){
  o.items.forEach(i=>{
   if(!i||i.id==null)return;
   const c=document.createElement('div');
   c.dataset.id=String(i.id);c.dataset.brand=i.b||'';c.dataset.model=i.m||'';c.dataset.desc=i.d||'';c.dataset.price=i.p||0;
   if(i.img){const im=new Image();im.className='watch';im.setAttribute('src',i.img);c.appendChild(im)}
   for(let n=0;n<Math.min(MAX,+i.q||1);n++)if(window.Cart)window.Cart.add(c,null);
  });
  if(window.Cart)window.Cart.open();else location.href='shop.html';
 }
 list.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b)return;
  const li=b.closest('.or-card'),o=orders.find(x=>x.ref===li.dataset.ref);if(!o)return;
  if(b.dataset.a==='again'){again(o);return}
  const was=open===o.ref;
  open=was&&b.dataset.a==='toggle'?null:o.ref;
  render();
  if(open){const el=list.querySelector('.or-card[data-ref="'+CSS.escape(o.ref)+'"]');if(el&&b.dataset.a==='track')el.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})}
 });

 orders=load().sort((a,b)=>new Date(b.date)-new Date(a.date));
 $('orDemo').hidden=!demo;
 render();
 /* another tab placed / changed an order, or the Back button restored an old page */
 const reload=()=>{if(demo)return;orders=load().sort((a,b)=>new Date(b.date)-new Date(a.date));render()};
 window.addEventListener('storage',e=>{if(!e.key||e.key===storeKey()||e.key===KEY)reload()});
 window.addEventListener('pageshow',e=>{if(e.persisted)reload()});
})();