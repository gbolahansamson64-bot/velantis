/* =====================================================================
   SIGN IN / CREATE ACCOUNT (auth.js) - used only by login.html
   The sign in / sign up form used to live inside header.js. It is its own page now.

   What it does: switches between the Sign In and Create Account tabs (login.html#signup opens the second one),
   shows / hides the password, checks the fields, and sends people back to the page they came from (?redirect=...).

   IMPORTANT - there is no server yet. Until you connect one, a successful sign in / sign up only saves
   {name, email} under "velantis_user" in this browser (no password is stored). That is the key the live chat reads
   to know who is signed in. To connect your real backend, set window.VelantisAuth BEFORE this script loads:

       window.VelantisAuth={
         signIn:  async ({email,password})      => ({name,email}),   // throw new Error('message') to show an error
         signUp:  async ({name,email,password}) => ({name,email}),
         google:  async ()                      => ({name,email}),
         forgot:  async (email)                 => {},
         signOut: async ()                      => {}                // optional, runs before "Log Out" clears the browser
       };

   ACCOUNT PAGE: once someone is signed in, this same page shows their account (welcome name, Total Orders, Wishlist, Rewards Points,
   My Orders, My Wishlist, Help & Support, Log Out) instead of the sign in form. On phones + tablets a successful sign in / sign up
   switches to it right away (unless a ?redirect= page was asked for, then they go there). Your backend can return extra numbers:
   {name,email,orders:3,points:120}. The Wishlist number is counted from the saved watches ("velantis_shop_favs").
   ===================================================================== */
(()=>{
 const $=id=>document.getElementById(id);
 const tabs=$('auTabs');if(!tabs)return;
 const KEY='velantis_user';
 const panes={in:$('paneIn'),up:$('paneUp')};
 const tabBtns=[...tabs.querySelectorAll('.au-tab')];
 const msg=$('auMsg');
 const COPY={in:['Welcome back','Sign in to your VELANTIS account'],up:['Join us','Create your VELANTIS account']};

 /* ---------- storage + redirect ---------- */
 const save=u=>{try{localStorage.setItem(KEY,JSON.stringify(u))}catch(e){}};
 const goBack=()=>{ /* only same-site relative paths, never another website */
  let to='';
  try{
   const r=new URLSearchParams(location.search).get('redirect');
   if(r&&/^\/(?!\/)/.test(r)&&!/[\\\r\n]/.test(r))to=r;
  }catch(e){}
  if(to){location.href=to;return}
  /* phones + tablets: this page turns into the account page. Desktop: back to the home page, the header shows the name */
  if(window.matchMedia&&matchMedia('(max-width:960px)').matches){render();window.scrollTo(0,0);return}
  location.href='index.html';
 };

 /* ---------- previous button ----------
    Goes back to the page the visitor came from: the ?redirect= page if there is one (the live chat adds it),
    otherwise the page they were on before (same site only), otherwise the home page. */
 const prevs=[$('auPrev'),$('acPrev')].filter(Boolean);
 if(prevs.length){
  let ref='';
  try{const u=new URL(document.referrer);if(document.referrer&&u.origin===location.origin&&!/\/login(\.html)?$/.test(u.pathname))ref=u.pathname+u.search+u.hash}catch(e){}
  let red='';
  try{const r=new URLSearchParams(location.search).get('redirect');if(r&&/^\/(?!\/)/.test(r)&&!/[\\\r\n]/.test(r))red=r}catch(e){}
  prevs.forEach(prev=>{
   prev.setAttribute('href',red||ref||'index.html');
   prev.addEventListener('click',e=>{
    if(red||!ref||history.length<2)return; /* normal link to redirect / home */
    e.preventDefault();history.back(); /* same page they left, scroll position kept */
   });
  });
 }

 /* ---------- messages ---------- */
 function say(text,error){
  if(!text){msg.hidden=true;msg.textContent='';return}
  msg.textContent=text;msg.classList.toggle('is-error',!!error);msg.hidden=false;
 }
 const clearBad=()=>document.querySelectorAll('.au-in.is-bad').forEach(l=>l.classList.remove('is-bad'));

 /* ---------- tabs ---------- */
 function setTab(k,focus){
  tabs.dataset.tab=k;
  tabBtns.forEach(b=>{const on=b.dataset.tab===k;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1});
  Object.keys(panes).forEach(p=>panes[p].hidden=p!==k);
  $('auTitle').textContent=COPY[k][0];$('auSub').textContent=COPY[k][1];
  document.title=(k==='in'?'Sign In':'Create Account')+' | Velantis';
  say('');clearBad();
  try{history.replaceState(null,'',location.pathname+location.search+(k==='up'?'#signup':''))}catch(e){}
  if(focus)panes[k].querySelector('input').focus({preventScroll:true});
 }
 tabBtns.forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab,true)));
 document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.go,true)));
 tabs.addEventListener('keydown',e=>{
  if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
  e.preventDefault();const k=tabs.dataset.tab==='in'?'up':'in';setTab(k,false);tabBtns.find(b=>b.dataset.tab===k).focus();
 });

 /* ---------- show / hide password ---------- */
 document.querySelectorAll('.au-eye').forEach(b=>b.addEventListener('click',()=>{
  const i=b.parentElement.querySelector('input'),show=i.type==='password';
  i.type=show?'text':'password';b.classList.toggle('on',show);b.setAttribute('aria-pressed',show);b.setAttribute('aria-label',show?'Hide password':'Show password');
  i.focus({preventScroll:true});
 }));

 /* ---------- helpers ---------- */
 const API=()=>window.VelantisAuth||{};
 const okEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
 const nameFrom=email=>{const n=email.split('@')[0].replace(/[._-]+/g,' ').trim();return n?n.replace(/\b\w/g,c=>c.toUpperCase()):'Member'};
 function bad(input,text){
  input.closest('.au-in').classList.add('is-bad');say(text,true);input.focus({preventScroll:true});
 }
 async function run(form,fn){
  const btn=form.querySelector('.au-go');btn.disabled=true;say('');
  try{const user=await fn();if(user){save(user);goBack()}}
  catch(err){say((err&&err.message)||'Something went wrong. Please try again.',true)}
  finally{btn.disabled=false}
 }
 document.addEventListener('input',e=>{const l=e.target.closest&&e.target.closest('.au-in');if(l)l.classList.remove('is-bad')});

 /* ---------- sign in ---------- */
 panes.in.addEventListener('submit',e=>{
  e.preventDefault();clearBad();
  const email=$('inEmail'),pass=$('inPass'),v=email.value.trim();
  if(!okEmail(v))return bad(email,'Please enter a valid email address.');
  if(!pass.value)return bad(pass,'Please enter your password.');
  run(panes.in,async()=>{
   if(API().signIn)return API().signIn({email:v,password:pass.value});
   return{name:nameFrom(v),email:v}; /* demo: replace with your real sign in */
  });
 });

 /* ---------- create account ---------- */
 panes.up.addEventListener('submit',e=>{
  e.preventDefault();clearBad();
  const name=$('upName'),email=$('upEmail'),pass=$('upPass'),v=email.value.trim();
  if(name.value.trim().length<2)return bad(name,'Please enter your full name.');
  if(!okEmail(v))return bad(email,'Please enter a valid email address.');
  if(pass.value.length<8)return bad(pass,'Your password needs at least 8 characters.');
  run(panes.up,async()=>{
   if(API().signUp)return API().signUp({name:name.value.trim(),email:v,password:pass.value});
   return{name:name.value.trim(),email:v}; /* demo: replace with your real sign up */
  });
 });

 /* ---------- Google + forgot password ---------- */
 $('auGoogle').addEventListener('click',async()=>{
  if(!API().google){say('Google sign-in is not connected yet. Please use your email for now.');return}
  try{const u=await API().google();if(u){save(u);goBack()}}catch(err){say((err&&err.message)||'Google sign-in did not complete.',true)}
 });
 $('auForgot').addEventListener('click',async e=>{
  e.preventDefault();
  const email=$('inEmail'),v=email.value.trim();
  if(!API().forgot){say('Password reset is not connected yet.');return}
  if(!okEmail(v))return bad(email,'Type your email above first, then tap "Forgot password?".');
  try{await API().forgot(v);say('If that email has an account, a reset link is on its way.')}catch(err){say((err&&err.message)||'Could not send the reset link.',true)}
 });

 /* ---------- ACCOUNT PAGE (signed in) ---------- */
 const readUser=()=>{try{const u=JSON.parse(localStorage.getItem(KEY)||'null');return u&&typeof u==='object'&&(u.name||u.email)?u:null}catch(e){return null}};
 const favCount=()=>{try{const f=JSON.parse(localStorage.getItem('velantis_shop_favs')||'[]');return Array.isArray(f)?f.length:0}catch(e){return 0}};
 const whole=v=>{v=Number(v);return isFinite(v)&&v>0?Math.floor(v):0};
 function render(){
  const card=$('auCard'),view=$('acView');if(!card||!view)return;
  const u=readUser();
  card.hidden=!!u;view.hidden=!u;
  const main=card.closest('main');if(main)main.classList.toggle('is-account',!!u);
  if(!u)return;
  const n=String(u.name||'').trim()||nameFrom(String(u.email||''));
  $('acName').textContent=n;$('acInit').textContent=n.charAt(0).toUpperCase();
  $('acOrders').textContent=whole(u.orders);$('acFavs').textContent=favCount();$('acPts').textContent=whole(u.points);
  document.title='My Account | Velantis';
 }
 $('acOut').addEventListener('click',async()=>{
  try{if(API().signOut)await API().signOut()}catch(e){}
  try{localStorage.removeItem(KEY)}catch(e){}
  location.replace(location.pathname+location.search); /* reload: back to the sign in form, header updated too */
 });
 window.addEventListener('storage',e=>{if(!e.key||e.key===KEY||e.key==='velantis_shop_favs')render()});
 window.addEventListener('pageshow',render);

 /* login.html#signup opens the Create Account tab */
 setTab(location.hash==='#signup'?'up':'in',false);
 render();
})();