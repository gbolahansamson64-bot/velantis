/* =====================================================================
   HEADER (header.js)
   One place for the whole site header: the markup AND what it does.
   To use it on any page, add this one line where the header should appear (near the top of <body>):

       <script src="/assets/js/header.js"></script>

   and load /assets/css/header.css in the <head> (after style.css).
   It builds: the top bar (logo, links, search, account, cart, hamburger menu) plus the three panels those
   buttons open (search bar, account panel, cart panel). Styling lives in header.css.

   Links to sections of the home page ("#legacy") become "index.html#..." automatically
   when the header is used on any other page, so they still work there.

   script.js (the home page hero) can hand this file a few hooks through window.SiteHooks
   { hold, release, stopHands, resumeHands } so the hero slider pauses while a panel is open.
   Pages without a hero simply don't set them and nothing breaks.
   ===================================================================== */
(()=>{
 if(window.__velantisHeader)return;window.__velantisHeader=true;

 const here=document.currentScript;
 const onHome=/(^|\/)(index\.html)?$/.test(location.pathname);
 const B=onHome?'':'index.html'; /* prefix for links to home page sections */
 const page=document.body.dataset.page||''; /* a page marks itself with <body data-page="shop"> to get its own link highlighted */
 const S='shop.html'; /* every Shop / collection link opens the shop page */

 /* ---------- MARKUP ----------
    YOUR LOGO: put your logo file in /assets/images/ and change the file name in the two src values below. */
 const HEADER=`
 <header class="bar">
  <a href="index.html" class="brand" aria-label="Velantis home">
   <img src="/assets/images/velantis.png" alt="Velantis Luxury Watches">
  </a>
  <nav class="links" aria-label="Main">
   <a href="index.html"${onHome?' aria-current="page"':''}>Home</a><a href="${S}"${page==='shop'?' aria-current="page"':''}>Shop</a><a href="${B}#legacy">About</a><a href="#footer">Contact</a>
  </nav>
  <div class="tools">
   <a class="nav-cta" href="${S}">Shop Now <span class="nav-cta-ic"><svg class="i" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
   <button id="searchBtn" aria-label="Search" aria-expanded="false" aria-controls="sx"><svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></button>
   <button id="accountBtn" aria-label="Account" aria-expanded="false" aria-controls="ac"><svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></button>
   <a class="cart" href="#" aria-label="Cart"><svg class="i" viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg><span id="cartCount">0</span></a>
   <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
  </div>
  <ul class="menu" id="menu" hidden>
   <li><a href="index.html">Home</a></li><li><a href="${S}">Shop</a></li><li><a href="${B}#legacy">About</a></li><li><a href="#footer">Contact</a></li>
  </ul>
 </header>`;

 /* Panels opened by the header buttons. They float above the page (position:fixed), so they are added to the end of what is already on the page. */
 const PANELS=`
<div class="sx" id="sx" aria-hidden="true">
 <div class="sx-ov" id="sxOv"></div>
 <div class="sx-wrap">
  <form class="sx-box" id="sxForm" role="search" autocomplete="off">
   <div class="sx-in">
    <svg class="i sx-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
    <span class="sx-sep" aria-hidden="true"></span>
    <input type="search" id="sxInput" name="q" placeholder="Search for watches, brands..." aria-label="Search watches" enterkeyhint="search" tabindex="-1">
    <button type="submit" class="sx-go" aria-label="Search" tabindex="-1"><svg class="i" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
   </div>
  </form>
  <button type="button" class="sx-x" id="sxClose" aria-label="Close search" tabindex="-1"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <div class="sx-panel">
   <p class="sx-lbl">Quick searches</p>
   <div class="sx-chips">
    <button type="button" class="sx-chip" tabindex="-1">Men’s Watches</button>
    <button type="button" class="sx-chip" tabindex="-1">Luxury Watches</button>
    <button type="button" class="sx-chip" tabindex="-1">Sports Watches</button>
    <button type="button" class="sx-chip" tabindex="-1">Classic Watches</button>
   </div>
  </div>
 </div>
</div>

<div class="ac" id="ac" aria-hidden="true">
 <div class="ac-ov" id="acOv"></div>
 <div class="ac-wrap">
  <div class="ac-card" role="dialog" aria-label="Account">
   <button type="button" class="ac-x" id="acClose" aria-label="Close account panel"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
   <div class="ac-head">
    <h2 class="ac-title"><span id="acT1">Welcome</span><span id="acT2">Back</span></h2>
    <p class="ac-sub" id="acSub">Sign in to your Velantis account.</p>
   </div>
   <div class="ac-tabs" id="acTabs" data-tab="in" role="tablist" aria-label="Sign in or sign up">
    <i class="ac-slider" aria-hidden="true"></i>
    <button type="button" class="ac-tab" role="tab" data-tab="in" aria-selected="true">Sign In</button>
    <button type="button" class="ac-tab" role="tab" data-tab="up" aria-selected="false" tabindex="-1">Sign Up</button>
   </div>

   <form class="ac-pane" id="acIn" role="tabpanel">
    <div class="ac-field">
     <div class="ac-row"><label class="ac-lbl" for="acInEmail">Email</label></div>
     <div class="ac-in"><input type="email" id="acInEmail" name="email" placeholder="you@email.com" autocomplete="email" required></div>
    </div>
    <div class="ac-field">
     <div class="ac-row"><label class="ac-lbl" for="acInPass">Password</label><a class="ac-forgot" href="#">Forgot?</a></div>
     <div class="ac-in"><input type="password" id="acInPass" name="password" placeholder="Your password" autocomplete="current-password" required><button type="button" class="ac-eye" aria-label="Show password" aria-pressed="false"><svg class="i" viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="slash" d="M4 20L20 4"/></svg></button></div>
    </div>
    <button type="submit" class="ac-go"><span>Sign In</span><svg class="i" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    <p class="ac-foot">New to Velantis? <button type="button" class="ac-link" data-go="up">Create an account</button></p>
   </form>

   <form class="ac-pane" id="acUp" role="tabpanel" hidden>
    <div class="ac-field">
     <div class="ac-row"><label class="ac-lbl" for="acUpName">Full name</label></div>
     <div class="ac-in"><input type="text" id="acUpName" name="name" placeholder="Your full name" autocomplete="name" required></div>
    </div>
    <div class="ac-field">
     <div class="ac-row"><label class="ac-lbl" for="acUpEmail">Email</label></div>
     <div class="ac-in"><input type="email" id="acUpEmail" name="email" placeholder="you@email.com" autocomplete="email" required></div>
    </div>
    <div class="ac-field">
     <div class="ac-row"><label class="ac-lbl" for="acUpPass">Password</label></div>
     <div class="ac-in"><input type="password" id="acUpPass" name="password" placeholder="At least 8 characters" autocomplete="new-password" minlength="8" required><button type="button" class="ac-eye" aria-label="Show password" aria-pressed="false"><svg class="i" viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="slash" d="M4 20L20 4"/></svg></button></div>
    </div>
    <button type="submit" class="ac-go"><span>Create Account</span><svg class="i" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    <p class="ac-foot">Already a member? <button type="button" class="ac-link" data-go="in">Sign in</button></p>
   </form>
  </div>
 </div>
</div>

<div class="ct" id="cartPanel" aria-hidden="true">
 <div class="ct-ov" id="ctOv"></div>
 <aside class="ct-panel" role="dialog" aria-modal="true" aria-labelledby="ctTitle" data-lenis-prevent>
  <div class="ct-head">
   <h2 id="ctTitle">Your <em>Cart</em><span class="ct-n" id="ctN">0</span></h2>
   <button type="button" class="ct-x" id="ctClose" aria-label="Close cart"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>
  <div class="ct-bar"><button type="button" class="ct-clear" id="ctClear" aria-label="Remove every watch from the cart"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg><span>Clear cart</span></button></div>
  <div class="ct-body" id="ctBody"></div>
  <div class="ct-foot">
   <div class="ct-sub"><span>Subtotal</span><b id="ctTotal">₦0</b></div>
   <p class="ct-note">Delivery and payment are chosen at checkout.</p>
   <button type="button" class="ct-go" id="ctGo"><span>Checkout</span><svg class="i" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
   <button type="button" class="ct-more" data-a="shop">Continue shopping</button>
  </div>
 </aside>
</div>`;

 /* put the header exactly where this script tag is (or at the top of the page if that is not possible) */
 if(here)here.insertAdjacentHTML('beforebegin',HEADER);else document.body.insertAdjacentHTML('afterbegin',HEADER);
 document.body.insertAdjacentHTML('beforeend',PANELS);

 /* ---------- SHARED HELPERS ---------- */
 const $=id=>document.getElementById(id);
 const root=document.documentElement;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 /* hero slider hooks (set by script.js on the home page; harmless when missing) */
 const hook=(name,arg)=>{const h=window.SiteHooks;if(h&&h[name])h[name](arg)};
 const hold=k=>hook('hold',k),release=k=>hook('release',k);
 const stopHands=()=>hook('stopHands'),resumeHands=()=>hook('resumeHands');
 const goShop=()=>{const f=$('products');if(f)f.scrollIntoView({behavior:reduce?'auto':'smooth'});else location.href='shop.html'}; /* on the shop page: scroll to the watches; on any other page: open the shop page */

 /* ---------- HAMBURGER MENU ---------- */
 const burger=$('burger'),menu=$('menu');
 function toggleMenu(open){menu.hidden=!open;burger.setAttribute('aria-expanded',open)}
 burger.onclick=()=>toggleMenu(menu.hidden);
 menu.addEventListener('click',e=>{if(e.target.closest('a'))toggleMenu(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false)});
 /* tap/click anywhere outside the open menu (and outside the hamburger button) closes it. Capture phase, so it still works when another button stops the click from bubbling. */
 document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!burger.contains(e.target))toggleMenu(false)},true);

 /* header turns solid once the page is scrolled */
 const bar=document.querySelector('.bar');
 const onScroll=()=>bar.classList.toggle('scrolled',window.scrollY>20);
 window.addEventListener('scroll',onScroll,{passive:true});
 onScroll();

 /* ---------- DESKTOP PILL NAV: sliding gold highlight + scroll-spy ----------
    Only does anything when the centre links are visible (961px and wider). The highlighted link follows the section
    you are looking at. Links that point to another page (or "#") are skipped. */
 (()=>{
  const nav=document.querySelector('.links');if(!nav)return;
  const links=[...nav.querySelectorAll('a')];
  const pill=document.createElement('i');pill.className='pill';pill.setAttribute('aria-hidden','true');
  nav.prepend(pill);nav.classList.add('has-pill');
  const place=()=>{
   const a=nav.querySelector('a[aria-current]');if(!a||!a.offsetWidth)return;
   pill.style.width=a.offsetWidth+'px';pill.style.transform='translateX('+a.offsetLeft+'px)';
  };
  const setActive=a=>{
   if(a.hasAttribute('aria-current'))return;
   links.forEach(l=>l===a?l.setAttribute('aria-current','page'):l.removeAttribute('aria-current'));place();
  };
  /* the sections are looked up every time, because the rest of the page is not on screen yet when this file runs */
  const targets=()=>links.map(a=>{const h=a.getAttribute('href');return h&&h.length>1&&h[0]==='#'?document.querySelector(h):null});
  const spy=()=>{
   if(!nav.offsetWidth||page)return; /* pages with data-page keep their own highlight */
   const t=targets();
   if(!t.some(Boolean))return; /* page without these sections: keep whatever is highlighted */
   let best=0,bestTop=-Infinity;
   t.forEach((el,i)=>{if(!el)return;const top=el.getBoundingClientRect().top;if(top<innerHeight*.4&&top>bestTop){best=i;bestTop=top}});
   if(innerHeight+scrollY>=document.documentElement.scrollHeight-4){for(let i=t.length-1;i>=0;i--)if(t[i]){best=i;break}}
   setActive(links[best]);
  };
  place();requestAnimationFrame(()=>pill.classList.add('ready'));
  window.addEventListener('scroll',spy,{passive:true});
  window.addEventListener('resize',()=>{place();spy()});
  window.addEventListener('load',()=>{place();spy()});
  document.addEventListener('DOMContentLoaded',spy);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);
  spy();
 })();

 /* ---------- SEARCH BAR ----------
    Header search icon opens it. Closes on the X, a click outside, or Esc. The arrow button / Enter / a quick-search chip
    closes it and jumps to the products for now: hook a real search in at the "submit" line.
    While it is open: slider autoplay, the live watch hands, CSS animations (html.sx-open) and page scrolling are paused,
    and everything carries on from where it stopped once the bar is closed. */
 (()=>{
  const sx=$('sx'),btn=$('searchBtn'),input=$('sxInput'),form=$('sxForm'),x=$('sxClose'),ov=$('sxOv');
  if(!sx||!btn)return;
  const inner=sx.querySelectorAll('input,button');
  let focusT=0;
  const isOpen=()=>sx.classList.contains('open');
  const setTab=v=>inner.forEach(el=>el.tabIndex=v);
  function open(){
   if(isOpen())return;
   toggleMenu(false); /* close the hamburger menu if it is open */
   root.classList.add('sx-open');hold('search');stopHands(); /* freeze slider autoplay + live hands + CSS animations */
   sx.classList.add('open');sx.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');
   setTab(0);
   focusT=setTimeout(()=>input.focus({preventScroll:true}),380); /* focus after the bar has dropped in */
  }
  function close(back){
   if(!isOpen())return;
   clearTimeout(focusT);
   sx.classList.remove('open');sx.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');
   setTab(-1);input.blur();
   root.classList.remove('sx-open');release('search'); /* slider autoplay continues */
   resumeHands(); /* hands jump back to the real time */
   if(back!==false)btn.focus({preventScroll:true});
  }
  btn.addEventListener('click',e=>{e.stopPropagation();isOpen()?close():open()});
  x.addEventListener('click',()=>close());
  ov.addEventListener('click',()=>close(false));
  document.addEventListener('keydown',e=>{
   if(!isOpen())return;
   if(e.key==='Escape')close();
   else if([' ','PageUp','PageDown','Home','End','ArrowUp','ArrowDown'].includes(e.key)&&(e.target===document.body||e.target===root))e.preventDefault(); /* no scrolling behind the bar */
  });
  const noScroll=e=>{if(isOpen())e.preventDefault()};
  window.addEventListener('wheel',noScroll,{passive:false});
  window.addEventListener('touchmove',noScroll,{passive:false});
  form.addEventListener('submit',e=>{
   e.preventDefault();
   const q=input.value.trim();if(!q)return;
   close(false);
   /* submit: add your real search here, q holds what the visitor typed */
   goShop();
  });
  sx.querySelectorAll('.sx-chip').forEach(c=>c.addEventListener('click',()=>{
   input.value=c.textContent.trim();
   form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit',{cancelable:true}));
  }));
 })();

 /* ---------- ACCOUNT PANEL (desktop only, 961px and wider) ----------
    The header account icon opens it (same drop-down style as the search bar). Closes on the X, a click outside, or Esc.
    Sign In / Sign Up tabs switch the form, heading and text. While open: slider autoplay, live hands, CSS animations and
    page scrolling are paused and carry on from where they stopped when it closes.
    The forms do nothing yet: add your real sign in / sign up at the "submit" line. */
 (()=>{
  const ac=$('ac'),btn=$('accountBtn'),ov=$('acOv'),x=$('acClose'),tabs=$('acTabs');
  if(!ac||!btn)return;
  const desktop=matchMedia('(min-width:961px)'),wrap=ac.querySelector('.ac-wrap');
  const tabBtns=[...ac.querySelectorAll('.ac-tab')],panes={in:$('acIn'),up:$('acUp')};
  const COPY={in:['Welcome','Back','Sign in to your Velantis account.'],up:['Join','Velantis','Create your account to save favourites and track your orders.']};
  let focusT=0;
  const isOpen=()=>ac.classList.contains('open');
  const firstInput=()=>panes[tabs.dataset.tab].querySelector('input');
  function setTab(k,focus){
   tabs.dataset.tab=k;
   tabBtns.forEach(b=>{const on=b.dataset.tab===k;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1});
   Object.keys(panes).forEach(p=>panes[p].hidden=p!==k);
   $('acT1').textContent=COPY[k][0];$('acT2').textContent=COPY[k][1];$('acSub').textContent=COPY[k][2];
   if(focus)firstInput().focus({preventScroll:true});
  }
  function place(){ /* the little notch points at the account icon */
   const b=btn.getBoundingClientRect(),w=wrap.offsetWidth;
   ac.style.setProperty('--ac-n',Math.max(34,Math.min(w-34,Math.round(b.left+b.width/2-wrap.offsetLeft)))+'px');
  }
  function open(){
   if(isOpen()||!desktop.matches)return;
   const sxEl=$('sx');if(sxEl&&sxEl.classList.contains('open'))$('sxClose').click(); /* never both at once */
   place();
   root.classList.add('ac-open');hold('account');stopHands(); /* freeze slider autoplay + live hands + CSS animations */
   ac.classList.add('open');ac.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');
   focusT=setTimeout(()=>firstInput().focus({preventScroll:true}),450); /* focus after the card has dropped in */
  }
  function close(back){
   if(!isOpen())return;
   clearTimeout(focusT);
   ac.classList.remove('open');ac.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');
   root.classList.remove('ac-open');release('account'); /* slider autoplay continues */
   resumeHands();
   if(ac.contains(document.activeElement))document.activeElement.blur();
   if(back!==false)btn.focus({preventScroll:true});
  }
  btn.addEventListener('click',e=>{if(!desktop.matches)return;e.stopPropagation();isOpen()?close():open()});
  x.addEventListener('click',()=>close());
  ov.addEventListener('click',()=>close(false));
  desktop.addEventListener('change',()=>{desktop.matches?place():close(false)});
  window.addEventListener('resize',()=>{if(isOpen())place()});
  document.addEventListener('keydown',e=>{
   if(!isOpen())return;
   if(e.key==='Escape')close();
   else if([' ','PageUp','PageDown','Home','End','ArrowUp','ArrowDown'].includes(e.key)&&(e.target===document.body||e.target===root))e.preventDefault(); /* no scrolling behind the panel */
  });
  const noScroll=e=>{if(isOpen()&&!e.target.closest('.ac-card'))e.preventDefault()};
  window.addEventListener('wheel',noScroll,{passive:false});
  window.addEventListener('touchmove',noScroll,{passive:false});

  /* tabs + "Create an account" / "Sign in" links */
  tabBtns.forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab,true)));
  ac.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.go,true)));
  tabs.addEventListener('keydown',e=>{
   if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
   e.preventDefault();const k=tabs.dataset.tab==='in'?'up':'in';setTab(k,false);tabBtns.find(b=>b.dataset.tab===k).focus();
  });
  /* show / hide password */
  ac.querySelectorAll('.ac-eye').forEach(b=>b.addEventListener('click',()=>{
   const i=b.parentElement.querySelector('input'),show=i.type==='password';
   i.type=show?'text':'password';b.classList.toggle('on',show);b.setAttribute('aria-pressed',show);b.setAttribute('aria-label',show?'Hide password':'Show password');
   i.focus({preventScroll:true});
  }));
  ac.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault())); /* "Forgot?" has no page yet */
  Object.values(panes).forEach(f=>f.addEventListener('submit',e=>{
   e.preventDefault();
   /* submit: add your real sign in / sign up here. Read the values with new FormData(f) */
  }));
  setTab('in',false);
 })();

 /* ---------- CART PANEL ----------
    The cart icon (header + bottom nav) opens it. Adding a watch from the product cards puts it in the cart: the watch flies to the cart icon and the number on it goes up (the cart stays closed).
    Items are kept in the browser (localStorage) as {id,q,b,m,d,p,img}: the id, quantity and a copy of the watch's brand, model, details,
    price (a number) and picture, all read from the product card's data-* values in index.html. When products come from your backend, give each one a real id.
    CURRENCY is the only place the money symbol is set. Hook your real checkout at the "checkout" line.
    The product cards call window.Cart.add(card,picture); other pages can call window.Cart.open() / close(). */
 (()=>{
  const ct=$('cartPanel'),body=$('ctBody'),KEY='velantis_cart',CURRENCY='₦',MAX=10;
  if(!ct)return;
  let items=[],opener=null;
  try{items=JSON.parse(localStorage.getItem(KEY)||'[]').filter(i=>i&&i.id!=null&&i.b&&i.q>0&&i.p>=0)}catch(e){items=[]}
  const fmt=n=>CURRENCY+n.toLocaleString('en-US');
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}};
  const isOpen=()=>ct.classList.contains('open');
  let pending=0; /* watches still flying to the cart: the badge number waits for them to land */
  const qty=()=>items.reduce((a,i)=>a+i.q,0);
  const setBadge=()=>{$('cartCount').textContent=Math.max(0,qty()-pending)}; /* the bottom nav badge copies this one */

  function render(){
   const count=items.reduce((a,i)=>a+i.q,0),total=items.reduce((a,i)=>a+i.p*i.q,0);
   setBadge();
   $('ctN').textContent=count;$('ctTotal').textContent=fmt(total);
   ct.classList.toggle('empty',!count);
   body.innerHTML=count?items.map(i=>{
    const p=i;
    return `<article class="ct-item" data-id="${i.id}"><div class="ct-th">${p.img?`<img class="watch" src="${p.img}" alt="${p.b} ${p.m}">`:''}</div><div><span class="ct-b">${p.b}</span><b class="ct-m">${p.m}</b><span class="ct-d">${p.d}</span><div class="ct-row"><div class="ct-q"><button type="button" data-a="dec" aria-label="Decrease quantity">−</button><span>${i.q}</span><button type="button" data-a="inc" aria-label="Increase quantity">+</button></div><button type="button" class="ct-rm" data-a="rm" aria-label="Remove from cart"><svg class="i" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button><span class="ct-p">${fmt(i.p*i.q)}</span></div></div></article>`;
   }).join(''):`<div class="ct-empty"><div class="ct-empty-ic"><svg class="i" viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg></div><h3>Your cart is empty</h3><p>Looks like you haven’t added a watch yet.</p><button type="button" class="ct-go" data-a="shop"><span>Shop Now</span></button></div>`;
  }
 /* FLY TO CART: a copy of the watch picture flies in an arc from the product card to the cart icon, shrinking as it goes.
    Tune it: DUR = flight time in ms, LIFT = how high the arc rises. Skipped for visitors who prefer reduced motion. */
  const DUR=900,LIFT=120;
  function fly(src,done){
   const btn=document.querySelector('.cart');
   if(!src||!btn||reduce||!src.getBoundingClientRect||!Element.prototype.animate)return false;
   if(src.tagName==='IMG'&&!src.getAttribute('src'))return false; /* empty image slot: nothing to fly */
   let r=src.getBoundingClientRect();const t=btn.getBoundingClientRect();
   if(!r.width||!r.height||!t.width)return false;
   /* A product photo that already has its own background (the shop photos, class sh-img) flies as a ROUND picture: a circle cut from the middle of the photo, so it does not travel as a square. Cut-out watches (no background) fly exactly as before. To make any other picture fly round, give it class sh-img or the attribute data-round. */
   const round=!!(src.classList&&src.classList.contains('sh-img'))||!!(src.hasAttribute&&src.hasAttribute('data-round'));
   if(round){const side=Math.min(r.width,r.height);r={left:r.left+(r.width-side)/2,top:r.top+(r.height-side)/2,width:side,height:side}}
   const el=document.createElement('div');
   el.className='ct-fly'+(round?' ct-round':'');
   el.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px';
   el.appendChild(src.cloneNode(true));
   document.body.appendChild(el);
   const x0=r.left+r.width/2,y0=r.top+r.height/2,x1=t.left+t.width/2,y1=t.top+t.height/2;
   const cx=(x0+x1)/2,cy=Math.min(y0,y1)-Math.max(LIFT,Math.abs(x1-x0)*.18); /* the highest point of the arc */
   const end=Math.min(.2,28/r.height),frames=[],N=30;
   for(let i=0;i<=N;i++){
    const u=i/N,e=u*u*(3-2*u),k=1-e;
    const x=k*k*x0+2*k*e*cx+e*e*x1,y=k*k*y0+2*k*e*cy+e*e*y1;
    const sc=1+(end-1)*Math.pow(e,.55);
    frames.push({transform:'translate('+(x-x0).toFixed(1)+'px,'+(y-y0).toFixed(1)+'px) scale('+sc.toFixed(3)+') rotate('+(-28*e).toFixed(1)+'deg)',opacity:e>.88?1-(e-.88)*5:1});
   }
   const a=el.animate(frames,{duration:DUR,easing:'linear',fill:'forwards'});
   let over=false;
   const finish=()=>{if(over)return;over=true;el.remove();done()};
   a.onfinish=finish;a.oncancel=finish;
   return true;
  }
  function pop(){
   const c=document.querySelector('.cart');if(!c)return;
   c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');
  }
  function add(card,src){
   if(!card||!card.dataset.id)return;
   const id=card.dataset.id,pic=card.querySelector('img.watch'),it=items.find(i=>i.id===id);
   if(it)it.q=Math.min(MAX,it.q+1);
   else items.push({id,q:1,b:card.dataset.brand||'',m:card.dataset.model||'',d:card.dataset.desc||'',p:parseInt(card.dataset.price,10)||0,img:(pic&&pic.getAttribute('src'))||''});
   save();
   const flew=fly(src,()=>{pending=Math.max(0,pending-1);setBadge();pop()});
   if(flew)pending++;
   render();
   if(!flew)pop();
  }
  function open(){
   if(isOpen())return;
   opener=document.activeElement;
   toggleMenu(false);
   const sxEl=$('sx');if(sxEl&&sxEl.classList.contains('open'))$('sxClose').click(); /* never two panels at once */
   const acEl=$('ac');if(acEl&&acEl.classList.contains('open'))$('acClose').click();
   root.classList.add('ct-open');hold('cart');stopHands(); /* freeze slider autoplay + live hands while the cart is open */
   if(window.lenis)window.lenis.stop(); /* freeze the page's smooth scroll: the website behind the cart cannot scroll while it is open (the cart panel itself scrolls normally, see data-lenis-prevent) */
   ct.classList.add('open');ct.setAttribute('aria-hidden','false');
   setTimeout(()=>$('ctClose').focus({preventScroll:true}),350);
  }
  function close(){
   if(!isOpen())return;
   ct.classList.remove('open');ct.setAttribute('aria-hidden','true');
   root.classList.remove('ct-open');release('cart');
   if(window.lenis)window.lenis.start(); /* the page scrolls again once the cart is closed */
   resumeHands();
   if(opener&&opener.focus)opener.focus({preventScroll:true});
  }
  window.Cart={add,open,close};

  body.addEventListener('click',e=>{
   const b=e.target.closest('[data-a]');if(!b)return;
   const row=b.closest('.ct-item'),a=b.dataset.a;
   if(a==='shop'){close();goShop();return}
   const id=row.dataset.id,it=items.find(i=>i.id===id);if(!it)return;
   if(a==='inc')it.q=Math.min(MAX,it.q+1);
   if(a==='dec')it.q-=1;
   if(a==='rm'||it.q<1)items=items.filter(i=>i.id!==id);
   save();render();
  });
  /* CLEAR CART: removes every watch at once. The first tap only arms the button ("Tap again to clear"), a second tap within CLEAR_WAIT ms empties the cart,
     so one accidental tap can never wipe it. Change CLEAR_WAIT (milliseconds) to give more or less time. */
  const CLEAR_WAIT=3000,clr=$('ctClear'),clrTxt=clr.querySelector('span');let clrT=null;
  const disarm=()=>{clearTimeout(clrT);clrT=null;clr.classList.remove('confirm');clrTxt.textContent='Clear cart';clr.setAttribute('aria-label','Remove every watch from the cart')};
  clr.addEventListener('click',()=>{
   if(!items.length)return;
   if(!clr.classList.contains('confirm')){
    clr.classList.add('confirm');clrTxt.textContent='Tap again to clear';clr.setAttribute('aria-label','Confirm: remove every watch from the cart');
    clrT=setTimeout(disarm,CLEAR_WAIT);return;
   }
   disarm();items=[];save();render(); /* if you connect a database, send the "empty the cart" request here */
  });
  ct.querySelector('.ct-more').addEventListener('click',()=>{close();goShop()});
  $('ctGo').addEventListener('click',()=>{
   /* checkout: add your real checkout here. items holds [{id,q}] and the order total is $('ctTotal').textContent */
  });
  $('ctClose').addEventListener('click',close);
  $('ctOv').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  /* the header cart icon and the cart button in the bottom nav (the bottom nav is further down the page, so the click is caught here) */
  document.addEventListener('click',e=>{
   const a=e.target.closest('.cart,.mnav a[data-k="cart"]');if(!a)return;
   e.preventDefault();isOpen()?close():open();
  });
  render();
 })();
})();

/* ---------- BOTTOM NAV LOADING RING (phone + tablet) ----------
   When a visitor taps a bottom-nav link that opens another page (Home, Shop, and any page you add later), the icon of that link
   turns into a small gold ring that rolls in circles until the new page opens, so a slow page never feels like a dead tap.
   Links that only scroll or open a panel (href="#") and links to the page you are already on are ignored. */
(()=>{
 const norm=p=>p.replace(/\/index\.html$/,'/').replace(/\/$/,'')||'/';
 const clear=()=>document.querySelectorAll('.mnav a.is-loading').forEach(a=>{
  a.classList.remove('is-loading');a.removeAttribute('aria-busy');
  const s=a.querySelector('.mn-spin');if(s)s.remove();
 });
 document.addEventListener('click',e=>{
  const a=e.target.closest('.mnav a[href]');
  if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank')return;
  const h=a.getAttribute('href');if(!h||h.charAt(0)==='#')return;
  let u;try{u=new URL(a.href,location.href)}catch(x){return}
  if(u.origin===location.origin&&norm(u.pathname)===norm(location.pathname))return;
  clear();
  a.classList.add('is-loading');a.setAttribute('aria-busy','true');
  const s=document.createElement('i');s.className='mn-spin';s.setAttribute('aria-hidden','true');
  a.insertBefore(s,a.querySelector('svg.i'));
  setTimeout(clear,10000); /* safety: if the page never opens, the ring stops after 10 seconds */
 });
 window.addEventListener('pageshow',clear); /* Back button: a page restored from memory must not keep spinning */
})();

/* ---------- SWIPE TO CLOSE (phone + tablet touch screens) ----------
   The X buttons still work exactly as before. On top of that:
     - CART: drag the cart sideways (either direction) and let go: it slides away and closes. Short drags spring back.
     - SEARCH: drag the search bar upward and let go: it closes.
   Only touch / pen is used (a mouse on desktop is not affected). Vertical scrolling inside the cart still works normally.
   The panels are closed by pressing their own X button, so every bit of the existing close behaviour (focus, paused slider, etc.) is reused. */
(()=>{
 const $=id=>document.getElementById(id);
 const ct=$('cartPanel'),sx=$('sx');
 let dragged=false;
 /* a drag must never count as a tap on whatever button the finger started on */
 document.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopPropagation();dragged=false}},true);
 const settle=()=>setTimeout(()=>{dragged=false},60);

 /* shared drag helper: axis 'x' or 'y', onMove(delta), onEnd(delta, velocityPxPerMs) */
 function drag(host,axis,{canStart,onMove,onEnd,onCancel}){
  let id=null,x0=0,y0=0,t0=0,lastD=0,lastT=0,vel=0,live=false;
  host.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse'||!e.isPrimary||!canStart(e))return;
   id=e.pointerId;x0=e.clientX;y0=e.clientY;t0=lastT=performance.now();lastD=0;vel=0;live=false;
  });
  host.addEventListener('pointermove',e=>{
   if(e.pointerId!==id)return;
   const dx=e.clientX-x0,dy=e.clientY-y0,d=axis==='x'?dx:dy;
   if(!live){
    if(Math.abs(dx)<10&&Math.abs(dy)<10)return;
    const main=axis==='x'?Math.abs(dx)>Math.abs(dy):Math.abs(dy)>Math.abs(dx);
    if(!main){id=null;return} /* the visitor is scrolling the other way: leave it alone */
    live=true;dragged=true;try{host.setPointerCapture(id)}catch(x){}
   }
   const now=performance.now();
   if(now>lastT){vel=(d-lastD)/(now-lastT);lastD=d;lastT=now}
   onMove(d);
  });
  const end=e=>{
   if(e.pointerId!==id)return;
   const was=live;id=null;live=false;
   if(!was)return;
   if(e.type==='pointercancel'){onCancel();settle();return}
   onEnd(lastD,vel);settle();
  };
  host.addEventListener('pointerup',end);
  host.addEventListener('pointercancel',end);
 }

 /* when a panel opens again, wipe the leftover inline drag styles */
 const watch=(el,clear)=>{if(el)new MutationObserver(()=>{if(el.classList.contains('open'))clear()}).observe(el,{attributes:true,attributeFilter:['class']})};

 /* ----- CART: swipe sideways ----- */
 if(ct){
  const panel=ct.querySelector('.ct-panel'),ov=$('ctOv'),X=$('ctClose');
  const clear=()=>{panel.style.transition='none';panel.style.transform='';ov.style.transition='none';ov.style.opacity='';void panel.offsetWidth;panel.style.transition='';ov.style.transition=''};
  watch(ct,clear);
  const isOpen=()=>ct.classList.contains('open');
  drag(ct,'x',{
   canStart:()=>isOpen(),
   onMove:d=>{
    panel.style.transition='none';ov.style.transition='none';
    panel.style.transform='translateX('+d+'px)';
    ov.style.opacity=String(Math.max(0,1-Math.abs(d)/panel.offsetWidth));
   },
   onEnd:(d,v)=>{
    const w=panel.offsetWidth;
    if(Math.abs(d)>w*.3||Math.abs(v)>.5){
     const dir=(Math.abs(v)>.5?Math.sign(v):Math.sign(d))||1;
     panel.style.transition='transform .28s cubic-bezier(.4,0,.8,.4)';ov.style.transition='opacity .28s ease';
     panel.style.transform='translateX('+dir*(w+40)+'px)';ov.style.opacity='0';
     setTimeout(()=>{X.click();setTimeout(clear,650)},230);
    }else{ /* not far enough: spring back */
     panel.style.transition='transform .3s cubic-bezier(.2,.8,.2,1)';ov.style.transition='opacity .3s ease';
     panel.style.transform='translateX(0)';ov.style.opacity='1';
     setTimeout(clear,320);
    }
   },
   onCancel:()=>{panel.style.transition='transform .3s ease';panel.style.transform='translateX(0)';ov.style.transition='opacity .3s ease';ov.style.opacity='1';setTimeout(clear,320)}
  });
 }

 /* ----- SEARCH: swipe up ----- */
 if(sx){
  const wrap=sx.querySelector('.sx-wrap'),X=$('sxClose');
  const clear=()=>{wrap.style.transition='none';wrap.style.transform='';wrap.style.opacity='';void wrap.offsetWidth;wrap.style.transition=''};
  watch(sx,clear);
  const isOpen=()=>sx.classList.contains('open');
  drag(sx,'y',{
   canStart:()=>isOpen(),
   onMove:d=>{
    const up=Math.min(0,d);
    wrap.style.transition='none';wrap.style.transform='translateY('+up+'px)';
    wrap.style.opacity=String(Math.max(0,1+up/260));
   },
   onEnd:(d,v)=>{
    if(d<-60||v<-.4){
     wrap.style.transition='transform .24s ease,opacity .24s ease';wrap.style.transform='translateY(-140%)';wrap.style.opacity='0';
     setTimeout(()=>{X.click();setTimeout(clear,1000)},200);
    }else{
     wrap.style.transition='transform .3s cubic-bezier(.2,.8,.2,1),opacity .3s ease';wrap.style.transform='';wrap.style.opacity='';
     setTimeout(clear,320);
    }
   },
   onCancel:()=>{wrap.style.transition='transform .3s ease,opacity .3s ease';wrap.style.transform='';wrap.style.opacity='';setTimeout(clear,320)}
  });
 }
})();

/* ---------- PAGE PRE-LOADING ----------
   Once this page has finished loading, the browser quietly fetches the other pages it links to (and the style/script files those pages need),
   so tapping Home or Shop opens from memory: a much shorter wait. Nothing is shown. It is skipped on slow connections and data-saver mode. */
(()=>{
 const c=navigator.connection;
 if(c&&(c.saveData||/(^|-)2g$/.test(c.effectiveType||'')))return;
 const norm=p=>p.replace(/\/index\.html$/,'/').replace(/\/$/,'')||'/';
 let have=new Set();
 const pre=(href,as)=>{
  if(have.has(href))return;have.add(href);
  const l=document.createElement('link');l.rel='prefetch';l.href=href;if(as)l.as=as;document.head.appendChild(l);
 };
 const run=()=>{
  have=new Set([...document.querySelectorAll('link[rel=stylesheet][href],script[src]')].map(n=>new URL(n.getAttribute('href')||n.getAttribute('src'),location.href).href));
  const pages=new Map();
  document.querySelectorAll('a[href]').forEach(a=>{
   let u;try{u=new URL(a.href,location.href)}catch(x){return}
   if(u.origin!==location.origin||!/\.html$|\/$/.test(u.pathname)||norm(u.pathname)===norm(location.pathname))return;
   pages.set(norm(u.pathname),u.origin+u.pathname);
  });
  [...pages.values()].slice(0,4).forEach(url=>{
   fetch(url,{credentials:'same-origin'}).then(r=>r.ok?r.text():'').then(t=>{
    if(!t)return;
    const d=new DOMParser().parseFromString(t,'text/html');
    d.querySelectorAll('link[rel=stylesheet][href]').forEach(l=>pre(new URL(l.getAttribute('href'),url).href,'style'));
    d.querySelectorAll('script[src]').forEach(s=>pre(new URL(s.getAttribute('src'),url).href,'script'));
   }).catch(()=>{});
  });
 };
 const go=()=>(window.requestIdleCallback||(f=>setTimeout(f,1500)))(run);
 document.readyState==='complete'?go():window.addEventListener('load',go,{once:true});
})();

/* ---------- PHONE STATUS BAR COLOUR ----------
   On phones and tablets the header is a cream band, so the phone's own top strip (clock, battery, notch area) takes the same cream colour
   instead of the dark colour the pages set in <meta name="theme-color">. On desktop the original dark colour is kept.
   Change PHONE_TOP to match the header band if you ever change its colour in header.css. */
(()=>{
 const PHONE_TOP='#fcf6ea',m=document.querySelector('meta[name="theme-color"]');if(!m||!matchMedia)return;
 const mq=matchMedia('(max-width:960px)'),dark=m.getAttribute('content');
 const sync=()=>m.setAttribute('content',mq.matches?PHONE_TOP:dark);
 sync();mq.addEventListener?mq.addEventListener('change',sync):mq.addListener(sync);
})();