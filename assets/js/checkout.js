/* =====================================================================
   CHECKOUT (checkout.html)
   Reads the cart (VelantisCart, made by header.js), shows the order summary, checks the form and "pays".
   TO GO LIVE: put the real Flutterwave / Paystack call inside pay() where marked. It must call finish(gateway) once payment succeeds.
   Quick tuning: CURRENCY = money symbol, SHIPPING = delivery fee (0 = free).
   ===================================================================== */
(()=>{
 const $=id=>document.getElementById(id),CURRENCY='₦',SHIPPING=0,DRAFT='velantis_checkout';
 const fmt=n=>CURRENCY+Math.round(n).toLocaleString('en-US');
 const cart=()=>window.VelantisCart?window.VelantisCart.read():[];
 const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')||{}}catch(e){return{}}};
 let items=cart(),sub=0,total=0,paying=false,completed=false;const form=$('ckForm');
 const calc=()=>{sub=items.reduce((s,i)=>s+i.p*i.q,0);total=sub+SHIPPING};calc();

 /* open the cart panel from the header (the "Cart" step and "Return to Cart") */
 const openCart=()=>{const c=document.querySelector('.cart');if(c)c.click();else location.href='shop.html'};
 $('ckStepCart').addEventListener('click',openCart);
 $('ckBack').addEventListener('click',()=>{location.href='shop.html'}); /* "Return to Shop" goes back to the shop page */

 if(!items.length){$('ckGrid').hidden=true;$('ckSteps').hidden=true;$('ckEmpty').hidden=false;return}

 /* order summary: paint() draws it from the current cart, and runs again whenever the cart changes (see LIVE CART below) */
 const box=$('ckItems');
 function paint(){
  box.textContent='';
  items.forEach(i=>{
   const row=document.createElement('div');row.className='ck-item';
   let im;if(i.img){im=document.createElement('img');im.src=i.img;im.alt=i.b+' '+i.m;im.loading='lazy'}else{im=document.createElement('span');im.className='ck-ph'}
   const t=document.createElement('div'),b=document.createElement('b'),q=document.createElement('small'),p=document.createElement('strong');
   b.textContent=(i.b+' '+i.m).trim();q.textContent='Qty: '+i.q;p.textContent=fmt(i.p*i.q);
   t.append(b,q);row.append(im,t,p);box.append(row);
  });
  $('ckSub').textContent=fmt(sub);$('ckShip').textContent=fmt(SHIPPING);$('ckTotal').textContent=fmt(total);
  if(!paying)$('ckPayTxt').textContent='Pay Now '+fmt(total);
 }
 paint();

 /* prefill: last checkout details first, then the signed-in account */
 const u=get('velantis_user'),d=get(DRAFT);
 const set=(id,v)=>{if(v)$(id).value=v};
 set('ckName',d.name||u.name);set('ckEmail',d.email||u.email);set('ckPhone',d.phone);set('ckState',d.state);set('ckAddress',d.address);

 /* checks */
 const rules={
  ckName:v=>v.trim().length>=2||'Please enter your full name.',
  ckEmail:v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())||'Please enter a valid email address.',
  ckPhone:v=>{const n=v.replace(/\D/g,'');return(n.length>=10&&n.length<=14)||'Please enter a valid phone number.'},
  ckState:v=>!!v||'Please select your state.',
  ckAddress:v=>v.trim().length>=6||'Please enter your full delivery address.'
 };
 const mark=(id,msg)=>{const f=$(id).closest('.ck-f');f.classList.toggle('bad',msg!==true);f.querySelector('.ck-err').textContent=msg===true?'':msg};
 Object.keys(rules).forEach(id=>{
  const el=$(id);
  el.addEventListener('blur',()=>{if(el.value||el.closest('.ck-f').classList.contains('bad'))mark(id,rules[id](el.value))});
  el.addEventListener('input',()=>{if(el.closest('.ck-f').classList.contains('bad'))mark(id,rules[id](el.value))});
 });

 /* success: save the order, empty the cart, show the confirmation */
 function finish(gateway){
  completed=true; /* the cart is about to be emptied on purpose: do not treat that as "cart emptied" */
  /* the order is also added to the customer's order list (shown on orders.html): one list per signed-in account, like the cart */
  const who=String(u.email||u.name||'').trim().toLowerCase(),okey=who?'velantis_orders:'+who:'velantis_orders';
  let list=[];try{list=JSON.parse(localStorage.getItem(okey)||'[]');if(!Array.isArray(list))list=[]}catch(e){list=[]}
  const now=new Date(),pad=(n,l)=>String(n).padStart(l||2,'0');
  const ref='VL-'+now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+'-'+pad(list.length+1,3); /* e.g. VL-20261127-001 (a backend should issue the real number) */
  const f={name:$('ckName').value.trim(),email:$('ckEmail').value.trim(),phone:$('ckPhone').value.trim(),state:$('ckState').value,address:$('ckAddress').value.trim(),note:$('ckNote').value.trim()};
  try{localStorage.setItem(DRAFT,JSON.stringify(f));localStorage.setItem('velantis_last_order',JSON.stringify({ref,gateway,total,items,details:f,date:new Date().toISOString()}));list.push({ref,date:now.toISOString(),status:'processing',gateway,sub,shipping:SHIPPING,total,items,details:f});localStorage.setItem(okey,JSON.stringify(list))}catch(e){}
  if(window.VelantisCart)window.VelantisCart.write([]);
  const cc=$('cartCount');if(cc)cc.textContent='0'; /* the bag badge in the header */
  $('ckGrid').hidden=true;$('ckDone').hidden=false;
  $('ckDoneName').textContent=f.name.split(' ')[0];$('ckRef').textContent=ref;$('ckDoneMail').textContent=f.email;
  const li=$('ckSteps').querySelectorAll('li');
  li.forEach((l,k)=>{l.classList.remove('cur');l.removeAttribute('aria-current');if(k<3)l.classList.add('done');if(k===3)l.classList.add('cur')});
  li.forEach(l=>{const dot=l.querySelector('.ck-dot');if(l.classList.contains('done')&&dot.tagName==='SPAN')dot.innerHTML='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'});
  scrollTo({top:0,behavior:'smooth'});
 }

 /* PAY: demo only. Replace the setTimeout with the real gateway (amount = total, customer email = $('ckEmail').value, reference = unique id). */
 function pay(gateway){
  paying=true; /* if the gateway fails, set paying=false again so the page keeps following the cart */
  const btn=$('ckPay');btn.disabled=true;btn.classList.add('load');$('ckPayTxt').textContent='Processing…';
  setTimeout(()=>finish(gateway),1400);
 }
 /* LIVE CART: the cart icon in the header opens the same cart panel on this page. Whenever a watch is removed, or its quantity changes, there (or in another tab),
    the order summary and the Pay button total update straight away, and when the cart becomes empty the checkout page closes and takes the customer to the shop. */
 function sync(){
  if(paying||completed)return;
  items=cart();
  if(!items.length){if(window.Cart&&window.Cart.close)window.Cart.close();location.replace('shop.html');return}
  calc();paint();
 }
 if(window.VelantisCart){
  const w=window.VelantisCart.write; /* header.js saves the cart through this, so listen here */
  window.VelantisCart.write=function(){const r=w.apply(this,arguments);setTimeout(sync,0);return r};
 }
 window.addEventListener('storage',e=>{if(!e.key||e.key==='velantis_user'||e.key.indexOf('velantis_cart')===0)sync()});
 window.addEventListener('pageshow',e=>{if(e.persisted)sync()});
 form.addEventListener('submit',e=>{
  e.preventDefault();$('ckFail').classList.remove('on');
  let first=null;
  Object.keys(rules).forEach(id=>{const r=rules[id]($(id).value);mark(id,r);if(r!==true&&!first)first=$(id)});
  if(first){first.focus({preventScroll:true});first.scrollIntoView({block:'center',behavior:'smooth'});return}
  pay(form.gateway.value);
 });
})();