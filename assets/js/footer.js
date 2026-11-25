/* =====================================================================
   FOOTER (footer.js)
   One place for the whole site footer. To use it on any page, add this one line where the footer should appear
   (usually at the very end of <body>, before your other scripts):

       <script src="/assets/js/footer.js"></script>

   and load /assets/css/footer.css in the <head> (after style.css).
   Links to sections of the home page ("#legacy") become "index.html#..." automatically when the footer
   is used on any other page, so they still work there. The header's Contact link points to the footer's id ("#footer"),
   so use footer.js on every page that uses header.js.
   ===================================================================== */
(()=>{
 if(window.__velantisFooter)return;window.__velantisFooter=true;

 const here=document.currentScript;
 const onHome=/(^|\/)(index\.html)?$/.test(location.pathname);
 const B=onHome?'':'index.html'; /* prefix for links to home page sections */

 const FOOTER=`
<footer class="ft" id="footer"><div class="wrap">
 <div class="ft-grid">

  <div class="ft-brand">
   <a href="index.html" class="ft-logo" aria-label="Velantis home"><img src="/assets/images/velantis.webp" alt="Velantis Timeless Luxury" width="280" height="140" loading="lazy" decoding="async"></a>
   <p class="ft-about">Timeless watches with a premium look at student-friendly prices. Made for the ambitious, the focused and the dreamers.</p>
   <div class="ft-soc">
    <a href="#" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.8c0 3.3 2.9 6.2 6.2 6.2l1.1-1.3-2-1-.8.7a3.6 3.6 0 0 1-1.6-1.6l.7-.8-1-2z"/></svg></a>
    <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6"/></svg></a>
    <a href="#" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.3 2.4 2 4 4.5 4.2"/></svg></a>
    <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 00-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/></svg></a>
   </div>
  </div>

  <nav class="ft-col" aria-label="Shop">
   <h4>Shop</h4>
   <ul>
    <li><a href="shop.html">All Watches</a></li>
    <li><a href="#">Men’s Watches</a></li>
    <li><a href="#">Luxury Watches</a></li>
    <li><a href="#">Sports Watches</a></li>
    <li><a href="#">Classic Watches</a></li>
   </ul>
  </nav>

  <nav class="ft-col" aria-label="Help">
   <h4>Help</h4>
   <ul>
    <li><a href="${B}#legacy">About Us</a></li>
    <li><a href="#">FAQs</a></li>
    <li><a href="#">Shipping</a></li>
    <li><a href="#">Returns &amp; Refunds</a></li>
    <li><a href="#">Track Order</a></li>
    <li><a href="#">Terms &amp; Conditions</a></li>
   </ul>
  </nav>

  <!-- EDIT YOUR REAL CONTACT DETAILS HERE -->
  <div class="ft-col ft-contact">
   <h4>Contact</h4>
   <ul>
    <li><span>Email:</span> <a href="mailto:hello@velantis.com">hello@velantis.com</a></li>
    <li><span>Phone:</span> <a href="tel:+2348000000000">+234 800 000 0000</a></li>
    <li><span>Delivery:</span> Nationwide, across Nigeria</li>
   </ul>
  </div>

 </div>
 <div class="ft-bottom"><p>© 2026 Velantis. All rights reserved.</div>
</div></footer>`;

 /* put the footer exactly where this script tag is (or at the end of the page if that is not possible) */
 if(here)here.insertAdjacentHTML('beforebegin',FOOTER);else document.body.insertAdjacentHTML('beforeend',FOOTER);
})();