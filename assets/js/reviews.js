/* =====================================================================
   CUSTOMER REVIEWS PAGE (reviews.js): DEMO VERSION WITH FAKE REVIEWS.
   Opens from the stars + count on every shop product: reviews.html?id=5&n=Ivory%20Minimal&r=4.3&v=142&p=11500&img=/products/x.png
   Everything below that says FAKE is placeholder data made up in the browser, so the page can be designed and tested before the backend exists.

   BACKEND LATER (replace the FAKE parts):
     1. Load the real, admin-approved reviews of the watch with that id (instead of makeReviews()).
     2. The rating summary (average + how many 5/4/3/2/1 stars) should come from the same data (instead of distribution()).
     3. "Write a review": only customers who BOUGHT this watch may submit. Save the review as "pending"; it only shows here after you approve it in the admin dashboard.
   ===================================================================== */
(()=>{
 'use strict';
 const $=s=>document.querySelector(s);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const CURRENCY='₦',PAGE=6; /* PAGE = how many reviews show at first and with each "Show more" click */
 const fmt=n=>CURRENCY+Math.round(n).toLocaleString('en-US');

 /* ---------- THE WATCH (read from the link) ---------- */
 const q=new URLSearchParams(location.search);
 const num=(k,d)=>{const v=parseFloat(q.get(k));return isFinite(v)?v:d};
 const safeImg=s=>/^(\/(?!\/)|[\w-]+\/)[^\s"'<>]*$/.test(s||'')?s:'';
 const P={
  id:Math.max(1,parseInt(q.get('id'),10)||1),
  n:(q.get('n')||'Velantis Watch').slice(0,80),
  r:Math.min(5,Math.max(1,num('r',4.5))),
  v:Math.max(1,Math.round(num('v',100))),
  p:Math.max(0,num('p',0)),
  img:safeImg(q.get('img'))
 };
 document.title='Reviews: '+P.n+' | Velantis';

 /* ---------- FAKE DATA ---------- */
 /* how many 1-5 star ratings add up to the average (index 0 = 1 star ... 4 = 5 stars) */
 function distribution(mean,total){
  let lo=-6,hi=6;
  const f=b=>{let s=0,m=0;for(let k=1;k<=5;k++){const w=Math.exp(b*k);s+=w;m+=w*k}return m/s};
  for(let i=0;i<40;i++){const mid=(lo+hi)/2;f(mid)<mean?lo=mid:hi=mid}
  const b=(lo+hi)/2,w=[1,2,3,4,5].map(k=>Math.exp(b*k)),sum=w.reduce((a,x)=>a+x,0);
  const c=w.map(x=>Math.round(total*x/sum));
  c[4]+=total-c.reduce((a,x)=>a+x,0);
  return c;
 }
 const rng=seed=>{let t=seed*2654435761>>>0;return()=>{t=(t+0x6D2B79F5)>>>0;let x=Math.imul(t^t>>>15,1|t);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296}};
 const NAMES=['Chukwuemeka O.','Aisha B.','Tunde A.','Ngozi E.','Ibrahim S.','Funke A.','Emeka N.','Blessing U.','Segun O.','Zainab M.','Chidi K.','Kemi L.','Yusuf D.','Adaeze I.','Femi T.','Halima R.','Obinna C.','Tolu B.'];
 const CITIES=['Lagos','Abuja','Port Harcourt','Ibadan','Enugu','Kano','Benin City','Akure'];
 const TXT={
  5:[['Absolutely love it','The {n} arrived well packed and looks stunning on the wrist. I get compliments every time I wear it.'],['Worth every naira','Great build quality for the price. The finish is clean, it feels solid and it keeps good time.'],['Perfect gift','Bought it as a gift and he loved it. Delivery to {city} was quick and the box feels really premium.'],['Looks even better in person','The photos do not do it justice. Comfortable strap, easy to read dial. Highly recommend the {n}.'],['Exactly as pictured','Very happy with my purchase. Fast delivery to {city} and the watch is exactly what was shown.']],
  4:[['Really nice watch','Lovely watch overall. It is a little bigger than I expected but it looks great and feels well made.'],['Good value','Good quality and it arrived on time. One star off because I had to adjust the strap myself.'],['Almost perfect','Beautiful design and solid finish. Delivery to {city} took a day longer than I hoped, but the {n} is worth it.']],
  3:[['It is okay','The watch looks nice but the strap felt stiff at first. It is fine for everyday wear.'],['Decent for the price','Does the job and looks good. I expected the finish to be a little sharper in person.']],
  2:[['Not what I expected','The colour looks a bit different from the pictures and the strap is tighter than I like.']],
  1:[['Disappointed','Mine arrived with a small scratch on the case. Support was polite but I am still waiting for a fix.']]
 };
 function makeReviews(){
  const R=rng(P.id*97+P.v),cnt=distribution(P.r,P.v),total=cnt.reduce((a,x)=>a+x,0),out=[];
  const N=Math.min(P.v,30),pickStar=()=>{let t=R()*total;for(let s=0;s<5;s++){t-=cnt[s];if(t<=0)return s+1}return 5};
  const today=new Date();
  for(let i=0;i<N;i++){
   const stars=pickStar(),pool=TXT[stars],t=pool[Math.floor(R()*pool.length)],name=NAMES[Math.floor(R()*NAMES.length)],city=CITIES[Math.floor(R()*CITIES.length)];
   const days=2+Math.floor(R()*320),d=new Date(today.getTime()-days*864e5);
   out.push({id:i,name,stars,title:t[0],text:t[1].replace(/\{n\}/g,P.n).replace(/\{city\}/g,city),days,date:d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),help:Math.floor(R()*19),voted:false});
  }
  return out;
 }
 const COUNTS=distribution(P.r,P.v),REVIEWS=makeReviews();

 /* ---------- SMALL PIECES ---------- */
 const star1='<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#star"/></svg>';
 const stars=(r,big)=>`<span class="rvp-stars${big?' big':''}" role="img" aria-label="${(+r).toFixed(1)} out of 5 stars"><span>${star1.repeat(5)}</span><span class="on" style="width:${(r/5*100).toFixed(1)}%">${star1.repeat(5)}</span></span>`;
 const initials=n=>n.replace(/[^A-Za-z ]/g,'').split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'V';
 const CHECK='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

 /* ---------- PAGE PARTS ---------- */
 $('#rvTitle').textContent='Customer Reviews';
 $('#rvProd').innerHTML=`<div class="rvp-pimg">${P.img?`<img src="${esc(P.img)}" alt="" decoding="async">`:''}</div>
  <div class="rvp-pinfo"><span>Reviews for</span><h2>${esc(P.n)}</h2>${P.p?`<b>${fmt(P.p)}</b>`:''}</div>
  <a class="rvp-plink" href="shop.html">View in shop</a>`;
 const pimg=$('#rvProd img');if(pimg)pimg.addEventListener('error',()=>pimg.remove());

 const st={star:0,sort:'new',shown:PAGE};
 const bars=[5,4,3,2,1].map(s=>{const c=COUNTS[s-1],pc=P.v?c/P.v*100:0;return `<li><button type="button" data-star="${s}" aria-pressed="false" aria-label="Show ${s} star reviews (${c})"><span class="n">${s}</span>${star1}<i class="rvp-track"><em style="width:${pc.toFixed(1)}%"></em></i><b>${c}</b></button></li>`}).join('');
 $('#rvSum').innerHTML=`<div class="rvp-score"><b>${P.r.toFixed(1)}</b><div>${stars(P.r,true)}<p>${P.v} verified rating${P.v===1?'':'s'}</p></div></div>
  <ul class="rvp-dist">${bars}</ul>
  <button type="button" class="rvp-btn" id="rvWrite">Write a review</button>
  <p class="rvp-note">Only customers who bought this watch can review it. Reviews are checked by our team before they appear.</p>`;

 const sorters={new:(a,b)=>a.days-b.days,high:(a,b)=>b.stars-a.stars||a.days-b.days,low:(a,b)=>a.stars-b.stars||a.days-b.days,help:(a,b)=>b.help-a.help};
 function card(r){
  return `<article class="rvp-card" data-i="${r.id}"><header><span class="rvp-av" aria-hidden="true">${esc(initials(r.name))}</span><div><b>${esc(r.name)}</b><span class="rvp-ver">${CHECK}Verified purchase</span></div><time>${esc(r.date)}</time></header>
   <div class="rvp-rt">${stars(r.stars)}<h3>${esc(r.title)}</h3></div><p>${esc(r.text)}</p>
   <footer><button type="button" class="rvp-help" data-help aria-pressed="${r.voted}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11v9H4v-9zM7 11l4-8c1.7 0 2.7 1.3 2.4 3L13 9h5.5a1.8 1.8 0 011.8 2.2l-1.4 7A2.5 2.5 0 0116.4 20H7"/></svg><span>Helpful (${r.help+(r.voted?1:0)})</span></button></footer></article>`;
 }
 function render(){
  const list=REVIEWS.filter(r=>!st.star||r.stars===st.star).sort(sorters[st.sort]);
  $('#rvList').innerHTML=list.length?list.slice(0,st.shown).map(card).join(''):`<div class="rvp-empty"><b>No ${st.star}-star reviews yet</b><p>Try another rating, or clear the filter to see every review.</p></div>`;
  const more=$('#rvMore'),left=list.length-st.shown;
  more.hidden=left<=0;more.textContent=`Show more reviews (${Math.max(0,left)} left)`;
  $('#rvListTitle').textContent=`Verified reviews (${list.length})`;
  const chips=$('#rvChips');chips.hidden=!st.star;
  chips.innerHTML=st.star?`<button type="button" data-clear>${st.star} star${st.star>1?'s':''}<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`:'';
  document.querySelectorAll('.rvp-dist button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.star===st.star));
 }
 $('.rvp-dist').addEventListener('click',e=>{const b=e.target.closest('[data-star]');if(!b)return;const s=+b.dataset.star;st.star=st.star===s?0:s;st.shown=PAGE;render()});
 $('#rvChips').addEventListener('click',e=>{if(e.target.closest('[data-clear]')){st.star=0;st.shown=PAGE;render()}});
 $('#rvSort').addEventListener('change',e=>{st.sort=e.target.value;st.shown=PAGE;render()});
 $('#rvMore').addEventListener('click',()=>{st.shown+=PAGE;render()});
 $('#rvList').addEventListener('click',e=>{ /* "Helpful": UI only for now; the backend will count it for real */
  const b=e.target.closest('[data-help]');if(!b)return;
  const r=REVIEWS[+b.closest('.rvp-card').dataset.i];r.voted=!r.voted;
  b.setAttribute('aria-pressed',r.voted);b.querySelector('span').textContent=`Helpful (${r.help+(r.voted?1:0)})`;
 });
 /* back link: if the visitor came from the shop, go back there so the shop keeps its scroll position */
 $('#rvBack').addEventListener('click',e=>{
  let same=false;try{same=!!document.referrer&&new URL(document.referrer).origin===location.origin&&/shop/.test(document.referrer)}catch(x){}
  if(same&&history.length>1){e.preventDefault();history.back()}
 });

 /* ---------- WRITE A REVIEW (FAKE: nothing is saved or sent) ---------- */
 const dlg=$('#rvDlg'),form=$('#rvForm'),done=$('#rvDone'),pick=$('#rvPick');
 let rating=0,opener=null;
 pick.innerHTML=[1,2,3,4,5].map(n=>`<button type="button" role="radio" aria-checked="false" data-v="${n}" aria-label="${n} star${n>1?'s':''}">${star1}</button>`).join('');
 const paint=v=>pick.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',+b.dataset.v<=v);b.setAttribute('aria-checked',+b.dataset.v===rating)});
 pick.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;rating=+b.dataset.v;paint(rating);$('#rvRErr').textContent=''});
 pick.addEventListener('mouseover',e=>{const b=e.target.closest('[data-v]');if(b)paint(+b.dataset.v)});
 pick.addEventListener('mouseleave',()=>paint(rating));
 const lock=on=>{document.documentElement.classList.toggle('rvp-lock',on);if(window.lenis)on?window.lenis.stop():window.lenis.start()};
 function open(){
  opener=document.activeElement;rating=0;paint(0);form.reset();form.hidden=false;done.hidden=true;
  $('#rvRErr').textContent='';$('#rvTErr').textContent='';
  dlg.hidden=false;lock(true);requestAnimationFrame(()=>dlg.classList.add('on'));
  setTimeout(()=>pick.querySelector('button').focus({preventScroll:true}),60);
 }
 function close(){
  if(dlg.hidden)return;dlg.classList.remove('on');lock(false);
  setTimeout(()=>{dlg.hidden=true},300);
  if(opener&&opener.focus)opener.focus({preventScroll:true});
 }
 $('#rvWrite').addEventListener('click',open);
 dlg.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 $('#rvTx').addEventListener('input',()=>{if($('#rvTx').value.trim().length>=10)$('#rvTErr').textContent=''});
 form.addEventListener('submit',e=>{
  e.preventDefault();
  const t=$('#rvTx').value.trim();let ok=true;
  $('#rvRErr').textContent='';$('#rvTErr').textContent='';
  if(!rating){$('#rvRErr').textContent='Please choose a star rating.';ok=false}
  if(t.length<10){$('#rvTErr').textContent='Please write at least a few words (10 characters).';ok=false}
  if(!ok)return;
  /* BACKEND: send { watch: P.id, rating, title, text, name } here. The server checks the customer bought this watch and saves the review as "pending" for admin approval. */
  form.hidden=true;done.hidden=false;done.querySelector('button').focus({preventScroll:true});
 });

  /* SWIPE DOWN TO CLOSE the "Write a review" sheet (phones only). Drag the sheet down and let go: far enough (or a quick flick) closes it, a short drag springs back.
    CLOSE_AT = how many pixels you must drag down to close it. Typing inside the boxes is not affected. */
 (()=>{
  const box=dlg.querySelector('.rvp-dlg-box'),ov=dlg.querySelector('.rvp-dlg-ov'),PHONE=matchMedia('(max-width:640px)'),CLOSE_AT=110;
  let y0=0,x0=0,t0=0,dy=0,drag=false,track=false;
  box.addEventListener('touchstart',e=>{
   track=PHONE.matches&&!dlg.hidden&&e.touches.length===1&&box.scrollTop<=0&&!e.target.closest('input,textarea,select');
   if(!track)return;
   y0=e.touches[0].clientY;x0=e.touches[0].clientX;t0=Date.now();dy=0;drag=false;
  },{passive:true});
  box.addEventListener('touchmove',e=>{
   if(!track)return;
   const my=e.touches[0].clientY-y0,mx=e.touches[0].clientX-x0;
   if(!drag){
    if(my<-8||(Math.abs(mx)>Math.abs(my)&&Math.abs(mx)>8)){track=false;return} /* scrolling up or sideways: not a close swipe */
    if(my>8&&box.scrollTop<=0){drag=true;box.style.transition='none';ov.style.transition='none'}else return;
   }
   dy=Math.max(0,my);
   box.style.transform='translateY('+dy+'px)';
   ov.style.opacity=String(Math.max(0,1-dy/box.offsetHeight));
   e.preventDefault();
  },{passive:false});
  const end=()=>{
   if(!track)return;track=false;
   if(!drag)return;drag=false;
   const fast=dy>40&&dy/Math.max(1,Date.now()-t0)>0.6;
   box.style.transition='';ov.style.transition='';box.style.transform='';ov.style.opacity='';
   if(dy>CLOSE_AT||fast)close();
  };
  box.addEventListener('touchend',end);
  box.addEventListener('touchcancel',end);
 })();
 render();
})();

