/* ---------- SMOOTH SCROLL (Lenis) ----------
   Load the Lenis library first, then this file, on every page:
   <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js"></script>
   <script src="/assets/js/smooth-scroll.js"></script> */
(()=>{
 if(!window.Lenis||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const lenis=new Lenis({duration:1.2,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
 const raf=time=>{lenis.raf(time);requestAnimationFrame(raf)};
 requestAnimationFrame(raf);
 /* in-page links (#featured, #legacy, #top...) glide smoothly, keeping the 70px header gap */
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');
  if(!a)return;
  const id=a.getAttribute('href');
  if(id==='#')return;
  const el=document.querySelector(id);
  if(!el)return;
  e.preventDefault();
  lenis.scrollTo(el,{offset:-70});
 });
})();