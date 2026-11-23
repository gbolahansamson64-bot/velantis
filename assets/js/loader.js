/* =====================================================================
   LOADING SCREEN (loader.js)
   Shows the Velantis loading screen ONLY when a visitor:
     - opens the website freshly (typed address, bookmark, Google, a link from another site), or
     - reloads the page (refresh button / F5).
   It does NOT show when the visitor just moves around inside the site (Home -> Shop -> Home, back / forward buttons).

   To use it on any page, put these two lines in the <head> (after your stylesheets):

       <link rel="stylesheet" href="/assets/css/loader.css">
       <script src="/assets/js/loader.js"></script>

   Nothing else is needed: the screen builds itself. Pages that do not have these two lines never show it.
   Settings are the three values just below.
   ===================================================================== */
(()=>{
 if(window.__velantisLoader)return;window.__velantisLoader=true;

 /* ---------- SETTINGS ---------- */
 const LOGO='/assets/images/velantis.png'; /* your logo (transparent PNG or SVG works best) */
 const MIN=3900;  /* shortest time the screen stays, in milliseconds */
 const MAX=8000;  /* safety limit: the screen always leaves by then, even if something is slow to load */

 /* ---------- SHOULD IT SHOW? ---------- */
 const root=document.documentElement;
 const nav=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||null;
 let type=nav?nav.type:'navigate';
 if(!nav&&performance.navigation&&performance.navigation.type===1)type='reload';
 let inside=false; /* did the visitor come from another page of this same website? */
 try{inside=!!document.referrer&&new URL(document.referrer).origin===location.origin}catch(e){}
 const show=type==='reload'||(type==='navigate'&&!inside);
 if(!show)return;

 /* ---------- BUILD + SHOW ---------- */
 const L=document.createElement('div');
 L.className='loader';L.id='loader';
 L.setAttribute('role','status');L.setAttribute('aria-live','polite');L.setAttribute('aria-label','Loading Velantis');
 L.innerHTML='<div class="ld-in"><img class="ld-logo" src="'+LOGO+'" alt="Velantis" width="280" height="120"><div class="ld-bar" aria-hidden="true"><u></u></div></div>';
 root.classList.add('loading'); /* stops scrolling and holds the page animations until the screen is gone */
 root.appendChild(L);

 /* the home page hero slider (script.js) can be held while the screen shows; pages without it simply skip this */
 const hook=n=>{const h=window.SiteHooks;if(h&&typeof h[n]==='function')h[n]('loader')};

 const t0=performance.now();
 let gone=false;
 const finish=()=>{
  if(gone)return;gone=true;
  L.classList.add('done');root.classList.remove('loading');hook('release');
  setTimeout(()=>L.remove(),900);
 };
 document.addEventListener('DOMContentLoaded',()=>{if(!gone)hook('hold')},{once:true});
 const ready=()=>setTimeout(finish,Math.max(0,MIN-(performance.now()-t0)));
 document.readyState==='complete'?ready():window.addEventListener('load',ready,{once:true});
 setTimeout(finish,MAX);
})();