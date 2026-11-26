/* =====================================================================
   HEADER (header.js)
   One place for the whole site header: the markup AND what it does.
   To use it on any page, add this one line where the header should appear (near the top of <body>):

       <script src="/assets/js/header.js"></script>

   and load /assets/css/header.css in the <head> (after style.css).
   It builds: the top bar (logo, links, search, account, cart, hamburger menu) plus the panels those
   buttons open (search bar, cart panel; the account icon opens login.html). Styling lives in header.css.

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
   <img src="/assets/images/velantis.svg" alt="Velantis Luxury Watches" width="280" height="140" decoding="async">
  </a>
  <nav class="links" aria-label="Main">
   <a href="index.html"${onHome?' aria-current="page"':''}>Home</a><a href="${S}"${page==='shop'?' aria-current="page"':''}>Shop</a><a href="${B}#legacy">About</a><a href="#footer">Contact</a>
  </nav>
  <div class="tools">
   <button id="searchBtn" aria-label="Search" aria-expanded="false" aria-controls="sx"><svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></button>
   <div class="acc">
    <button id="accountBtn" aria-label="Account" aria-haspopup="true"><svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg><span class="acc-txt"><small id="accHi">Welcome</small><b id="accNm">Sign in / Register</b></span></button>
    <div class="acc-dd" role="menu">
     <div class="acc-user"><span class="acc-av" id="accAv" aria-hidden="true"></span><p class="acc-hello">Welcome back,<b id="accWho"></b></p></div>
     <button type="button" class="acc-out" id="accOut" role="menuitem"><span class="acc-out-ic" aria-hidden="true"><svg class="i" viewBox="0 0 24 24"><path d="M10 4H5a1 1 0 00-1 1v14a1 1 0 001 1h5M15 8l4 4-4 4M19 12H9"/></svg></span><span class="acc-out-txt">Sign out</span></button>
     <a class="acc-signin" href="login.html" role="menuitem">Sign in</a>
     <a class="acc-reg" href="login.html#signup" role="menuitem">Register</a>
     <span class="acc-line"></span>
     <a class="acc-link" data-auth href="orders.html" role="menuitem"><svg class="i" viewBox="0 0 24 24"><path d="M7 3h10a1 1 0 011 1v16a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM9 8h6M9 12h6M9 16h4"/></svg>My Orders</a>
     <a class="acc-link" data-auth href="wishlist.html" role="menuitem"><svg class="i" viewBox="0 0 24 24"><path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/></svg>Wishlist</a>
    </div>
   </div>
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

<div class="ct" id="cartPanel" aria-hidden="true">
 <div class="ct-ov" id="ctOv"></div>
 <div class="ct-panel" role="dialog" aria-modal="true" aria-labelledby="ctTitle" data-lenis-prevent>
  <div class="ct-head">
   <h2 id="ctTitle">My bag<span class="ct-n" id="ctN">0</span></h2>
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
 </div>
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

 /* ---------- ACCOUNT ICON ----------
    The sign in / sign up form no longer lives in this file. It is its own page now: login.html
    (styled by /assets/css/auth.css, logic in /assets/js/auth.js). The header icon just opens that page. */
 (()=>{
  const btn=$('accountBtn');if(!btn)return;
  /* the header button only opens the dropdown (hover / keyboard focus, see header.css). The Sign in and Register buttons inside the dropdown are what open the form page. */
  btn.addEventListener('click',e=>e.preventDefault());
 })();


 /* ---------- ACCOUNT DROPDOWN: My Orders + Wishlist need a signed-in customer ----------
    isSignedIn() is the ONE place that decides if someone is logged in. It currently looks for a saved "velantis_user" in the browser:
    change the key (or the check) to whatever auth.js saves when a customer logs in. Not signed in = sent to login.html first,
    and brought back to the page they wanted after they sign in (login.html can read ?next=). */
 (()=>{
  const isSignedIn=()=>{try{return !!localStorage.getItem('velantis_user')}catch(e){return false}};
  document.querySelectorAll('.acc-dd [data-auth]').forEach(a=>a.addEventListener('click',e=>{
   if(isSignedIn())return;
   e.preventDefault();
   location.href='login.html?redirect='+encodeURIComponent('/'+a.getAttribute('href'));
  }));
 })();

 /* ---------- SIGNED-IN STATE (header button + dropdown) ----------
    auth.js saves {name,email} under "velantis_user" after a successful sign in / sign up. This block reads that same key:
      - signed in : the header button shows "Hi, <name>" over "Account", and the dropdown shows a welcome line, My Orders, Wishlist and Sign out
      - signed out: everything goes back to "Welcome / Sign in / Register" with the Sign in + Register buttons
    It re-checks on page load, when the Back button restores a page, and when another tab signs in or out.
    To run your own sign-out request, set window.VelantisAuth.signOut = async()=>{...} (optional, same object as in auth.js). */
 (()=>{
  const acc=document.querySelector('.acc'),btn=$('accountBtn'),hi=$('accHi'),nm=$('accNm'),KEY='velantis_user';
  if(!acc||!btn||!hi||!nm)return;
  const read=()=>{try{const u=JSON.parse(localStorage.getItem(KEY)||'null');return u&&typeof u==='object'&&(u.name||u.email)?u:null}catch(e){return null}};
  const nameOf=u=>String(u.name||'').trim()||String(u.email||'').split('@')[0]||'Member';
  function sync(){
   const u=read();
   acc.classList.toggle('is-in',!!u);
   if(u){
    const n=nameOf(u);
    hi.textContent='Hi, '+n;nm.textContent='Account';
    $('accWho').textContent=n;$('accAv').textContent=n.charAt(0).toUpperCase();
    btn.setAttribute('aria-label','Account, signed in as '+n);
   }else{
    hi.textContent='Welcome';nm.textContent='Sign in / Register';
    btn.setAttribute('aria-label','Account');
   }
  }
  $('accOut').addEventListener('click',async()=>{
   try{if(window.VelantisAuth&&window.VelantisAuth.signOut)await window.VelantisAuth.signOut()}catch(e){}
   try{localStorage.removeItem(KEY)}catch(e){}
   sync();
   if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  });
  window.addEventListener('storage',e=>{if(!e.key||e.key===KEY)sync()});
  window.addEventListener('pageshow',sync);
  sync();
 })();

 /* ---------- WISHLIST ICON (desktop header; phones use the Wishlist button in the bottom nav) ----------
    Shows how many watches are saved. It copies the number of the bottom-nav wishlist badge (#navFavCount), which shop.js and
    script.js already keep up to date when a heart is pressed, so nothing else had to change. Pages without that badge read the saved list
    ("velantis_shop_favs") instead. There is no wishlist page yet, so for now the icon does not navigate: when you build one, set href on #wishBtn. */
 (()=>{
  const a=document.getElementById('wishBtn'),n=document.getElementById('wishCount');if(!a||!n)return;
  a.addEventListener('click',e=>e.preventDefault());
  const show=v=>{v=+v||0;n.textContent=v>99?'99+':v;n.hidden=!v};
  const saved=()=>{try{return JSON.parse(localStorage.getItem('velantis_shop_favs')||'[]').length}catch(e){return 0}};
  const hook=()=>{
   const src=document.getElementById('navFavCount');
   const sync=()=>show(src?(src.hidden?0:src.textContent):saved());
   sync();
   if(src)new MutationObserver(sync).observe(src,{attributes:true,childList:true,characterData:true,subtree:true});
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',hook):hook();
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