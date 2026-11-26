/*!
 * VELANTIS Live Chat widget  (assets/js/livechat.js)
 * Self-contained: injects its own UI + CSS (inside a Shadow DOM, so it can never
 * clash with style.css). Add ONE line before </body> on every page:
 *
 *   <script src="assets/js/livechat.js" defer></script>
 *
 * Optional settings (data-attributes on the script tag OR window.VELANTIS_CHAT):
 *   data-login-url="login.html"        where "Sign In / Register" sends people
 *   data-user-key="velantis_user"      localStorage key holding the signed-in user
 *                                      as JSON: {"name":"John Doe","email":"john@x.com"}
 *   data-firebase-url="https://YOUR-PROJECT-default-rtdb.firebaseio.com"
 *                                      turns on REAL live messaging (see notes)
 *   data-logo="assets/images/logo.png" optional logo for the avatar
 *
 * Without data-firebase-url the widget runs in DEMO mode: messages are kept in the
 * visitor's browser and a friendly auto-reply answers common questions.
 */
(function () {
  'use strict';
  if (window.__velantisChat) return;
  window.__velantisChat = true;

  var script = document.currentScript || {};
  var ds = script.dataset || {};
  var CFG = Object.assign({
    title: 'VELANTIS Support',
    loginUrl: ds.loginUrl || 'login.html',
    userKey: ds.userKey || 'velantis_user',
    firebaseUrl: (ds.firebaseUrl || '').replace(/\/$/, ''),
    logo: ds.logo || '',
    demoReplies: true
  }, window.VELANTIS_CHAT || {});
  CFG.firebaseUrl = (CFG.firebaseUrl || '').replace(/\/$/, '');

  /* ---------- helpers ---------- */
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function json(s) { try { return JSON.parse(s); } catch (e) { return null; } }
  function rid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function fmt(ts) { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  /* ---------- who is the visitor? ---------- */
  function currentUser() {
    var u = window.VELANTIS_USER || json(LS.get(CFG.userKey));
    return u && (u.email || u.name) ? u : null;
  }
  function resolveSession() {
    var user = currentUser();
    var s = json(LS.get('vlc_session'));
    if (user) {
      var uid = 'u_' + slug(user.email || user.name);
      if (!s || s.id !== uid) {
        s = { id: uid, type: 'user', name: user.name || user.email, email: user.email || '' };
        LS.set('vlc_session', JSON.stringify(s));
      }
    } else if (s && s.type === 'user') { // signed out since last visit
      s = null; LS.del('vlc_session');
    }
    return s;
  }
  var session = resolveSession();

  /* ---------- transports ---------- */
  // Each transport: send(session,msg) -> Promise, listen(session,cb) -> stop fn
  var Local = {
    mode: 'local',
    key: function (id) { return 'vlc_msgs_' + id; },
    read: function (id) { return json(LS.get(this.key(id))) || []; },
    send: function (s, m) {
      var list = this.read(s.id); list.push(m);
      LS.set(this.key(s.id), JSON.stringify(list.slice(-200)));
      if (window.BroadcastChannel) { try { new BroadcastChannel('vlc').postMessage({ id: s.id, m: m }); } catch (e) {} }
      return Promise.resolve();
    },
    listen: function (s, cb) {
      var self = this, bc = null;
      this.read(s.id).forEach(cb);
      if (window.BroadcastChannel) {
        try { bc = new BroadcastChannel('vlc'); bc.onmessage = function (e) { if (e.data && e.data.id === s.id) cb(e.data.m); }; } catch (e) {}
      }
      return function () { if (bc) bc.close(); };
    }
  };

  var Firebase = {
    mode: 'firebase',
    send: function (s, m) {
      var b = CFG.firebaseUrl;
      var meta = { name: s.name, email: s.email || '', type: s.type, last: m.text || '[image]', ts: m.ts, from: m.from };
      fetch(b + '/inbox/' + s.id + '.json', { method: 'PATCH', body: JSON.stringify(meta) }).catch(function () {});
      return fetch(b + '/chats/' + s.id + '/messages.json', { method: 'POST', body: JSON.stringify(m) })
        .then(function (r) { if (!r.ok) throw new Error('send failed'); });
    },
    listen: function (s, cb) {
      if (!window.EventSource) return function () {};
      var es = new EventSource(CFG.firebaseUrl + '/chats/' + s.id + '/messages.json');
      function h(e) {
        var d = json(e.data); if (!d || d.data == null) return;
        if (d.path === '/') { Object.keys(d.data).forEach(function (k) { cb(d.data[k]); }); }
        else if (d.path.split('/').filter(Boolean).length === 1) cb(d.data);
      }
      es.addEventListener('put', h); es.addEventListener('patch', h);
      return function () { es.close(); };
    }
  };
  var T = CFG.firebaseUrl ? Firebase : Local;

  /* ---------- styles ---------- */
  var CSS = '\
:host{all:initial;display:inline-block}\
*{box-sizing:border-box;margin:0;padding:0}\
.w{--ink:#1c1a17;--ink2:#2b221b;--gold:#a88655;--gold2:#d6b074;--cream:#faf8f3;--cream2:#f1ebdf;--line:#e6dfd2;--txt:#1c1a17;--mut:#7b756b;\
--serif:"Cormorant Garamond",Georgia,"Times New Roman",serif;font-family:"Jost","Inter","Segoe UI",system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:var(--txt);-webkit-font-smoothing:antialiased}\
button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent}\
button:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}\
textarea:focus-visible{outline:0}\
svg{display:block}\
/* launcher */\
.fab{position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:2147483000;width:74px;height:74px;border-radius:50%;padding:0;\
background:radial-gradient(circle at 32% 26%,#3a2d20,#14100c 70%);border:2.5px solid #c9a265;\
box-shadow:0 10px 26px rgba(20,10,0,.45),inset 0 0 0 2px rgba(20,10,0,.55),inset 0 1px 0 rgba(255,225,170,.25);\
transition:transform .2s,box-shadow .25s,opacity .2s}\
.fab:hover{transform:translateY(-2px);box-shadow:0 0 0 3px rgba(214,176,116,.35),0 0 26px 6px rgba(214,176,116,.55),0 12px 28px rgba(20,10,0,.5),inset 0 0 0 2px rgba(20,10,0,.55)}\
.fab:active{transform:scale(.96);background:radial-gradient(circle at 32% 26%,#ecc47a,#a88655 75%)}\
.fab:active .ic-chat{color:#1a120b}.fab:active .dt{fill:#e8c27c}\
.ic{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fbe9cf;transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .2s}\
.ic svg{width:35px;height:35px}\
.dt{fill:#2b221b}\
.ic-x{opacity:0;transform:rotate(-90deg) scale(.5)}\
.fab.open .ic-chat{opacity:0;transform:rotate(90deg) scale(.5)}\
.fab.open .ic-x{opacity:1;transform:none}\
.fab{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}\
.fab:not(.inline){touch-action:none}\
.fab.l{left:max(20px,env(safe-area-inset-left));right:auto}\
.fab.drag,.fab.drag:hover,.fab.drag:active{transform:scale(1.1);transition:transform .15s,box-shadow .2s;cursor:grabbing;box-shadow:0 0 0 3px rgba(214,176,116,.4),0 0 30px 8px rgba(214,176,116,.6),0 16px 34px rgba(20,10,0,.55),inset 0 0 0 2px rgba(20,10,0,.55)}\
.fab:before,.fab:after{content:"";position:absolute;inset:-2.5px;border-radius:50%;border:1.5px solid rgba(201,162,101,.6);opacity:0;pointer-events:none}\
.fab.pulse:before{animation:ring 2.2s ease-out 3}\
.fab.pulse:after{animation:ring 2.2s ease-out .7s 3}\
.fab.pulse.loop:before,.fab.pulse.loop:after{animation-iteration-count:infinite}\
@keyframes ring{0%{transform:scale(1);opacity:.75}100%{transform:scale(2);opacity:0}}\
.badge{position:absolute;top:-6px;right:-6px;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:linear-gradient(145deg,#f04848,#c81e1e);color:#fff;font-size:13px;font-weight:700;display:none;align-items:center;justify-content:center;border:2px solid #fbe9cf;box-shadow:0 3px 8px rgba(160,20,20,.4)}\
.badge.on{display:flex}\
.fab.open .badge{display:none}\
/* panel */\
.panel{position:fixed;right:max(20px,env(safe-area-inset-right));bottom:calc(max(20px,env(safe-area-inset-bottom)) + 88px);z-index:2147483001;width:390px;height:min(620px,calc(100dvh - 132px));\
display:flex;flex-direction:column;background:var(--cream);border-radius:22px;overflow:hidden;border:1px solid var(--line);\
box-shadow:0 24px 70px rgba(20,10,0,.4);transform-origin:bottom right;transform:translateY(16px) scale(.96);opacity:0;visibility:hidden;transition:transform .25s cubic-bezier(.2,.8,.2,1),opacity .2s,visibility .25s}\
.panel.open{transform:none;opacity:1;visibility:visible}\
@media (min-width:521px){.panel.left{right:auto;left:max(20px,env(safe-area-inset-left));transform-origin:bottom left}}\
.scrim{display:none}.hb-back{display:none}\
.head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:linear-gradient(135deg,#2b221b,#14100c);color:#f1eadf;border-bottom:1px solid rgba(214,176,116,.35);flex:none}\
.av{width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#2e2014,#14100c);border:1.5px solid rgba(214,176,116,.7);display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden;color:var(--gold2);font-family:var(--serif);font-size:22px;font-weight:700}\
.av img{width:100%;height:100%;object-fit:cover}\
.av.sm{width:30px;height:30px;font-size:15px;border-width:1px}\
.ht{flex:1;min-width:0}\
.ht b{display:block;font-family:var(--serif);font-size:21px;font-weight:600;letter-spacing:.04em;line-height:1.1;color:#e6c98f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.ht span{display:flex;align-items:center;gap:6px;font-size:12.5px;color:#fff;opacity:.95}\
.dot{width:8px;height:8px;border-radius:50%;background:#3ddc84;box-shadow:0 0 0 2px rgba(61,220,132,.3)}\
.hb{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;transition:background .15s}\
.hb:hover{background:rgba(255,255,255,.2)}.hb svg{width:20px;height:20px}\
/* gate */\
.gate{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px 28px 32px;overflow:auto}\
.gico{width:78px;height:78px;border-radius:50%;background:var(--cream2);display:flex;align-items:center;justify-content:center;color:var(--ink);margin-bottom:18px}\
.gico svg{width:38px;height:38px}\
.gate h3{font-family:var(--serif);font-size:26px;font-weight:600;color:var(--ink);margin-bottom:8px}\
.gate p{color:var(--mut);line-height:1.5;max-width:270px;margin-bottom:24px}\
.btn{width:100%;padding:14px 18px;border-radius:14px;font-weight:600;font-size:15px;transition:transform .15s,box-shadow .15s,background .15s}\
.btn:active{transform:scale(.98)}\
.btn.dark{background:var(--ink);color:#fff;margin-bottom:12px}.btn.dark:hover{background:#000}\
.btn.line{background:transparent;border:1.5px solid var(--gold);color:var(--ink)}.btn.line:hover{background:var(--cream2)}\
.gnote{margin-top:16px;font-size:12px;color:var(--mut)}\
/* messages */\
.chat{flex:1;display:none;flex-direction:column;min-height:0}.chat.on{display:flex}\
.gate.off{display:none}\
.msgs{flex:1;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;padding:18px 16px 8px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth}\
.msgs::-webkit-scrollbar{width:6px}.msgs::-webkit-scrollbar-thumb{background:var(--line);border-radius:6px}\
.row{display:flex;gap:9px;align-items:flex-end;max-width:100%}\
.row.me{justify-content:flex-end}\
.bub{max-width:78%;padding:11px 14px;border-radius:16px;line-height:1.45;word-wrap:break-word;overflow-wrap:anywhere;white-space:pre-wrap}\
.row.them .bub{background:var(--cream2);border-bottom-left-radius:5px}\
.row.me .bub{background:linear-gradient(135deg,#dcb878,#b99160);color:#1a0f0a;border-bottom-right-radius:5px}\
.bub img{display:block;max-width:100%;max-height:220px;border-radius:10px;margin:-2px 0 4px}\
.meta{display:flex;align-items:center;gap:4px;margin-top:5px;font-size:11px;color:var(--mut);white-space:normal}\
.row.me .meta{justify-content:flex-end;color:rgba(26,15,10,.62)}\
.tick{width:15px;height:15px}\
.typing{display:none;align-items:center;gap:9px;padding:0 16px 8px}.typing.on{display:flex}\
.typing i{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--gold);margin-right:3px;animation:b 1.2s infinite}\
.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}\
@keyframes b{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}\
.tb{background:var(--cream2);padding:10px 13px;border-radius:16px;border-bottom-left-radius:5px}\
/* composer */\
.comp{position:relative;display:flex;align-items:flex-end;gap:10px;padding:10px 14px max(14px,env(safe-area-inset-bottom));background:var(--cream);flex:none}\
.field{flex:1;display:flex;align-items:flex-end;background:#fff;border:1px solid var(--line);border-radius:16px;padding:4px 6px 4px 14px;transition:border-color .15s,box-shadow .15s}\
.field:focus-within{border-color:var(--gold);box-shadow:0 0 0 3px rgba(168,134,85,.18)}\
textarea{flex:1;border:0;outline:0;resize:none;background:transparent;font:inherit;font-size:15px;color:var(--txt);padding:10px 0;max-height:110px;line-height:1.35}\
textarea::placeholder{color:#a8977f}\
.ib{width:36px;height:40px;display:flex;align-items:center;justify-content:center;color:#7b756b;border-radius:10px;flex:none}\
.ib:hover{color:var(--gold)}.ib svg{width:21px;height:21px}\
.send{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#dcb878,#a88655);color:#1a0f0a;display:flex;align-items:center;justify-content:center;flex:none;box-shadow:0 6px 14px rgba(168,134,85,.35);transition:transform .15s,opacity .15s}\
.send:hover{transform:translateY(-1px)}.send:active{transform:scale(.95)}.send:disabled{opacity:.5;cursor:default;transform:none}\
.send svg{width:21px;height:21px}\
.emo{position:absolute;left:14px;right:14px;bottom:calc(100% - 2px);display:none;grid-template-columns:repeat(8,1fr);gap:2px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:8px;box-shadow:0 10px 26px rgba(20,10,0,.18)}\
.emo.on{display:grid}.emo button{font-size:21px;padding:6px 0;border-radius:8px}.emo button:hover{background:var(--cream2)}\
.pw{font-size:11px;text-align:center;color:var(--mut);padding:0 0 8px;background:var(--cream)}\
.pw b{color:var(--gold);font-weight:600}\
.demo{background:#fff7e6;color:#8a5a12;font-size:11.5px;text-align:center;padding:6px 10px;border-bottom:1px solid var(--line)}\
/* mobile: full-screen sheet */\
@media (max-width:520px){\
/* phone = a real full-page inbox: pinned to the visible screen (top + height follow the keyboard, see syncViewport) with a solid backdrop so the page can never show through */\
.panel{left:0;right:0;top:var(--vt,0px);bottom:auto;width:100%;height:var(--vh,100vh);height:var(--vh,100dvh);border-radius:0;border:0;transform:translateY(30px);transform-origin:bottom center}\
.scrim{display:block;position:fixed;inset:0;z-index:2147483000;background:#faf8f3;opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s}\
.scrim.on{opacity:1;visibility:visible}\
.hb-back{display:flex;margin-left:-8px}.hb-min{display:none}\
.fab{right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));width:66px;height:66px}\
.fab.l{left:max(14px,env(safe-area-inset-left));right:auto}\
.fab.lift{bottom:calc(96px + env(safe-area-inset-bottom))}\
.fab.inline{position:relative;right:auto;bottom:auto;z-index:1;width:62px;height:62px;box-shadow:0 6px 16px rgba(20,10,0,.35),inset 0 0 0 2px rgba(20,10,0,.55)}\
.fab .ic svg{width:31px;height:31px}\
.fab.open{opacity:0;pointer-events:none}\
.head{padding-top:max(14px,env(safe-area-inset-top))}\
.bub{max-width:84%}.msgs{padding:16px 12px 8px}\
textarea{font-size:16px}\
}\
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}\
';

  /* ---------- icons ---------- */
  var I = {
    bub: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8C6.6 2.8 2.6 6.4 2.6 11c0 2.3 1 4.4 2.7 5.9L4.4 21.4l4.5-2.3c1 .3 2 .4 3.1.4 5.4 0 9.4-3.6 9.4-8.2S17.4 2.8 12 2.8z"/><circle class="dt" cx="7.9" cy="11.2" r="1.4"/><circle class="dt" cx="12" cy="11.2" r="1.4"/><circle class="dt" cx="16.1" cy="11.2" r="1.4"/></svg>',
    xl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.4-.8L3 21l1.9-5A8.4 8.4 0 1 1 21 11.5z"/><circle cx="8.5" cy="11.5" r=".6" fill="currentColor"/><circle cx="12" cy="11.5" r=".6" fill="currentColor"/><circle cx="15.5" cy="11.5" r=".6" fill="currentColor"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    min: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/></svg>',
    clip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9"/></svg>',
    smile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/><circle cx="9" cy="10" r=".8" fill="currentColor"/><circle cx="15" cy="10" r=".8" fill="currentColor"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4l17.5-7.6a1 1 0 0 0 0-1.8L3.4 3.4a.8.8 0 0 0-1.1.9L3.5 10l9 2-9 2-1.2 5.5a.8.8 0 0 0 1.1.9z"/></svg>',
    one: '<svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    two: '<svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12.5L7 17l9-10M10.5 15.5l1.5 1.5 9.5-10"/></svg>'
  };

  /* ---------- build UI ---------- */
  var host = el('div'); host.id = 'velantis-livechat';
  var root = host.attachShadow({ mode: 'open' });
  var style = el('style'); style.textContent = CSS; root.appendChild(style);
  var w = el('div', 'w'); root.appendChild(w);
  var scrim = el('div', 'scrim'); w.appendChild(scrim); // phone only: solid backdrop behind the full-screen chat
  // The launcher button lives in its own shadow host so it can be placed inside the page on mobile
  var hostF = el('div'); hostF.id = 'velantis-livechat-btn';
  var rootF = hostF.attachShadow({ mode: 'open' });
  var styleF = el('style'); styleF.textContent = CSS; rootF.appendChild(styleF);
  var wF = el('div', 'w'); rootF.appendChild(wF);

  function avatar(small) {
    var a = el('div', 'av' + (small ? ' sm' : ''));
    if (CFG.logo) { var im = el('img'); im.src = CFG.logo; im.alt = ''; im.onerror = function () { a.textContent = 'V'; im.remove(); }; a.appendChild(im); }
    else a.textContent = 'V';
    return a;
  }

  // launcher
  var fab = el('button', 'fab');
  fab.type = 'button'; fab.setAttribute('aria-label', 'Open live chat');
  fab.innerHTML = '<span class="ic ic-chat">' + I.bub + '</span><span class="ic ic-x">' + I.xl + '</span><span class="badge"></span>';
  var badge = fab.querySelector('.badge');
  wF.appendChild(fab);

  // panel
  var panel = el('section', 'panel');
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', CFG.title);
  // The site's smooth-scroll library (Lenis) is frozen while the chat is open and cancels every swipe that is not inside an element marked data-lenis-prevent. That is what stopped the message list from scrolling by touch. Marking the chat tells Lenis to leave its swipes alone.
  panel.setAttribute('data-lenis-prevent', '');
  var head = el('div', 'head');
  var bBack = el('button', 'hb hb-back', I.back); bBack.type = 'button'; bBack.setAttribute('aria-label', 'Back to the website'); head.appendChild(bBack); // phone only
  head.appendChild(avatar());
  var ht = el('div', 'ht', '<b></b><span><i class="dot"></i>Online</span>');
  ht.querySelector('b').textContent = CFG.title;
  head.appendChild(ht);
  var bMin = el('button', 'hb hb-min', I.min); bMin.type = 'button'; bMin.setAttribute('aria-label', 'Minimise chat');
  var bClose = el('button', 'hb', I.x); bClose.type = 'button'; bClose.setAttribute('aria-label', 'Close chat');
  head.appendChild(bMin); head.appendChild(bClose);
  panel.appendChild(head);
  if (T.mode === 'local' && CFG.demoReplies) panel.appendChild(el('div', 'demo', 'Demo mode: messages stay in this browser'));

  // gate (guest / sign in)
  var gate = el('div', 'gate',
    '<div class="gico">' + I.user + '</div><h3>Start a Conversation</h3>' +
    '<p>Chat with us as a guest or create an account for a better experience.</p>' +
    '<button class="btn dark" type="button" data-a="guest">Continue as Guest</button>' +
    '<button class="btn line" type="button" data-a="signin">Sign In / Register</button>' +
    '<div class="gnote">Typically replies in a few minutes</div>');
  panel.appendChild(gate);

  // chat view
  var chat = el('div', 'chat');
  var msgsEl = el('div', 'msgs'); msgsEl.setAttribute('aria-live', 'polite'); msgsEl.setAttribute('data-lenis-prevent', '');
  var typing = el('div', 'typing'); typing.appendChild(avatar(true)); typing.appendChild(el('div', 'tb', '<i></i><i></i><i></i>'));
  var comp = el('div', 'comp');
  var emo = el('div', 'emo');
  ['\uD83D\uDE00', '\uD83D\uDE0A', '\uD83D\uDE0D', '\uD83D\uDC4D', '\uD83D\uDE4F', '\uD83C\uDF89', '\u231A', '\uD83D\uDC8E', '\uD83D\uDE9A', '\uD83D\uDCE6', '\u2764\uFE0F', '\uD83D\uDC4B', '\uD83E\uDD1D', '\u2728', '\uD83D\uDD25', '\uD83D\uDE09'].forEach(function (e) {
    var b = el('button'); b.type = 'button'; b.textContent = e; emo.appendChild(b);
  });
  var field = el('div', 'field');
  var ta = el('textarea'); ta.rows = 1; ta.placeholder = 'Type a message...'; ta.setAttribute('aria-label', 'Type a message'); ta.maxLength = 1000;
  var bClip = el('button', 'ib', I.clip); bClip.type = 'button'; bClip.setAttribute('aria-label', 'Attach an image');
  var bEmo = el('button', 'ib', I.smile); bEmo.type = 'button'; bEmo.setAttribute('aria-label', 'Add emoji');
  var file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.hidden = true;
  field.appendChild(ta); field.appendChild(bClip); field.appendChild(bEmo); field.appendChild(file);
  var bSend = el('button', 'send', I.send); bSend.type = 'button'; bSend.setAttribute('aria-label', 'Send message');
  comp.appendChild(emo); comp.appendChild(field); comp.appendChild(bSend);
  chat.appendChild(msgsEl); chat.appendChild(typing); chat.appendChild(comp);
  panel.appendChild(chat);
  w.appendChild(panel);

  /* ---------- state ---------- */
  var msgs = {};          // cid -> message
  var stop = null;        // listener stop fn
  var opened = false;
  var openedAt = Date.now();
  var renderQ = false;
  function seenKey() { return 'vlc_seen_' + (session && session.id); }

  function addMsg(m) {
    if (!m || !m.cid || msgs[m.cid]) { if (m && msgs[m.cid] && m.pending === false) msgs[m.cid].pending = false; return; }
    msgs[m.cid] = m;
    if (m.from === 'agent') {
      typing.classList.remove('on');
      if (!opened) { updateBadge(); }
      else LS.set(seenKey(), String(Date.now()));
    }
    scheduleRender();
  }
  function scheduleRender() { if (renderQ) return; renderQ = true; requestAnimationFrame(function () { renderQ = false; render(); }); }

  function updateBadge() {
    var seen = +LS.get(seenKey()) || 0, n = 0;
    Object.keys(msgs).forEach(function (k) { var m = msgs[k]; if (m.from === 'agent' && m.ts > seen) n++; });
    badge.textContent = n > 9 ? '9+' : n; badge.classList.toggle('on', n > 0); fab.classList.toggle('loop', n > 0);
  }

  function row(m) {
    var me = m.from === 'user';
    var r = el('div', 'row ' + (me ? 'me' : 'them'));
    if (!me) r.appendChild(avatar(true));
    var b = el('div', 'bub');
    if (m.img) { var im = el('img'); im.src = m.img; im.alt = 'Attached image'; b.appendChild(im); }
    if (m.text) b.appendChild(document.createTextNode(m.text));
    var meta = el('div', 'meta'); meta.appendChild(document.createTextNode(fmt(m.ts)));
    if (me) meta.insertAdjacentHTML('beforeend', m.pending ? I.one : I.two);
    b.appendChild(meta); r.appendChild(b);
    return r;
  }

  function greeting() {
    var first = session && session.type === 'user' ? String(session.name || '').split(' ')[0] : '';
    return first
      ? { from: 'agent', ts: openedAt, text: 'Welcome back, ' + first + ' \uD83D\uDC4B\nHow can we help you today?' }
      : { from: 'agent', ts: openedAt, text: 'Hello! \uD83D\uDC4B\nThanks for contacting VELANTIS. How can we help you today?' };
  }

  var forceEnd = false;
  function render() {
    var list = Object.keys(msgs).map(function (k) { return msgs[k]; }).sort(function (a, b) { return a.ts - b.ts; });
    var prevTop = msgsEl.scrollTop, nearBottom = nearEnd();
    msgsEl.textContent = '';
    var g = greeting(); if (list.length) g.ts = Math.min(g.ts, list[0].ts - 1);
    msgsEl.appendChild(row(g));
    list.forEach(function (m) { msgsEl.appendChild(row(m)); });
    // Rebuilding the list throws the scroll position away, so restore it at once (no sliding): stay at the newest message if the person was there, otherwise stay exactly where they were reading.
    if (nearBottom || forceEnd || list.length < 3) jumpEnd(); else setTop(prevTop);
    forceEnd = false;
  }
  // Scroll helpers. The message list has "scroll-behavior:smooth", so these switch it off for a moment to move INSTANTLY, like WhatsApp does when a chat opens.
  function setTop(y) { msgsEl.style.scrollBehavior = 'auto'; msgsEl.scrollTop = y; msgsEl.style.scrollBehavior = ''; }
  function jumpEnd() { setTop(msgsEl.scrollHeight); }
  function nearEnd() { return msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight < 120; }

  /* ---------- session flow ---------- */
  function showChat() {
    gate.classList.add('off'); chat.classList.add('on');
    if (!stop) { stop = T.listen(session, addMsg); }
    render();
    LS.set(seenKey(), String(Date.now())); badge.classList.remove('on');
    // Only mouse/desktop users get the cursor placed for them. On phones and tablets the keyboard opens when the person TAPS the message box.
    setTimeout(function () { if (!touchLike()) ta.focus({ preventScroll: true }); }, 280);
  }
  function startGuest() {
    session = { id: 'g_' + rid(), type: 'guest', name: 'Guest ' + Math.floor(1000 + Math.random() * 9000), email: '' };
    LS.set('vlc_session', JSON.stringify(session));
    showChat();
  }

  function touchLike() { return mq.matches || matchMedia('(pointer:coarse)').matches; }

  // While the full-screen chat is open on a phone the website behind it is frozen (no scrolling, nothing peeking through)
  var lockY = 0, locked = false;
  function lockPage() {
    if (locked || !mq.matches) return; locked = true;
    var d = document.documentElement, b = document.body;
    lockY = window.pageYOffset || d.scrollTop || 0;
    b.style.position = 'fixed'; b.style.top = (-lockY) + 'px'; b.style.left = '0'; b.style.right = '0'; b.style.width = '100%'; d.style.overflow = 'hidden';
    if (window.lenis && window.lenis.stop) window.lenis.stop();
  }
  function unlockPage() {
    if (!locked) return; locked = false;
    var d = document.documentElement, b = document.body;
    b.style.position = ''; b.style.top = ''; b.style.left = ''; b.style.right = ''; b.style.width = ''; d.style.overflow = '';
    d.style.scrollBehavior = 'auto'; window.scrollTo(0, lockY); d.style.scrollBehavior = '';
    if (window.lenis) { if (window.lenis.scrollTo) window.lenis.scrollTo(lockY, { immediate: true }); if (window.lenis.start) window.lenis.start(); }
  }

  function openPanel() {
    opened = true; session = resolveSession();
    scrim.classList.add('on'); lockPage();
    panel.classList.add('open'); fab.classList.add('open'); fab.setAttribute('aria-expanded', 'true'); fab.setAttribute('aria-label', 'Close live chat');
    syncViewport();
    if (session) { showChat(); landOnNewest(); } else { gate.classList.remove('off'); chat.classList.remove('on'); }
  }
  // Like WhatsApp: every time the chat opens it is already showing the newest message, no scrolling to watch.
  // (Done now, again next frame, and once more if a photo finishes loading and changes the height.)
  function landOnNewest() {
    jumpEnd(); requestAnimationFrame(jumpEnd);
    var until = Date.now() + 1500;
    Array.prototype.forEach.call(msgsEl.querySelectorAll('img'), function (im) { if (!im.complete) im.addEventListener('load', function () { if (Date.now() < until) jumpEnd(); }, { once: true }); });
  }
  function closePanel() {
    opened = false; panel.classList.remove('open'); fab.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-label', 'Open live chat'); emo.classList.remove('on');
    scrim.classList.remove('on'); unlockPage();
    if (session) LS.set(seenKey(), String(Date.now()));
    fab.focus({ preventScroll: true });
  }

  /* ---------- sending ---------- */
  function send(text, img) {
    text = (text || '').trim(); if (!text && !img) return;
    if (!session) return;
    forceEnd = true; // the person just sent something: show it (jump to the newest message)
    var m = { cid: rid(), from: 'user', text: text, ts: Date.now(), name: session.name };
    if (img) m.img = img;
    m.pending = true; addMsg(m);
    var payload = Object.assign({}, m); delete payload.pending;
    T.send(session, payload).then(function () { m.pending = false; scheduleRender(); demoReply(text, !!img); })
      .catch(function () { m.pending = false; addMsg({ cid: rid(), from: 'agent', ts: Date.now(), text: 'Message could not be sent. Please check your connection and try again.' }); });
  }
  function submit() {
    var v = ta.value; if (!v.trim()) return;
    ta.value = ''; autosize(); emo.classList.remove('on'); send(v); if (!ta.readOnly) ta.focus();
  }
  function autosize() { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 110) + 'px'; }

  /* demo auto-replies (only when no live backend is configured) */
  function demoReply(text, hasImg) {
    if (T.mode !== 'local' || !CFG.demoReplies) return;
    var t = text.toLowerCase(), a;
    if (/deliver|ship|abuja|lagos|nigeria|location/.test(t)) a = 'Yes! We deliver to Abuja and across Nigeria. \uD83D\uDE9A';
    else if (/order|track/.test(t)) a = 'Sure! Please share your order number.';
    else if (/pay|price|cost|discount|transfer|card/.test(t)) a = 'Payments are secure. A team member will confirm pricing and payment options with you shortly.';
    else if (/auth|genuine|original|warrant/.test(t)) a = 'Every VELANTIS timepiece is 100% authentic and comes with a warranty.';
    else if (/hi|hello|hey/.test(t)) a = 'Hello! \uD83D\uDC4B How can we help you today?';
    else a = hasImg ? 'Thanks for the image! We will take a look.' : 'Thanks for your message! A member of our team will reply shortly.';
    setTimeout(function () { var at = nearEnd(); typing.classList.add('on'); if (at) jumpEnd(); }, 500);
    setTimeout(function () {
      // ONE reply object with ONE id. It used to be added twice with two different ids (once to the screen, once through the storage channel that talks back to the page), which showed every reply twice.
      var reply = { cid: 'a' + rid(), from: 'agent', ts: Date.now(), text: a };
      addMsg(reply);
      if (T.mode === 'local') Local.send(session, reply); // saved for page reloads / other tabs; the page ignores it when it comes back because the id is the same
    }, 1900);
  }

  /* image attach: downscale to keep messages small */
  function attach(f) {
    if (!f || !/^image\//.test(f.type)) return;
    var rd = new FileReader();
    rd.onload = function () {
      var im = new Image();
      im.onload = function () {
        var max = 800, s = Math.min(1, max / Math.max(im.width, im.height));
        var c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        send(ta.value, c.toDataURL('image/jpeg', 0.72)); ta.value = ''; autosize();
      };
      im.src = rd.result;
    };
    rd.readAsDataURL(f);
  }

  /* mobile keyboard: keep panel exactly as tall as the visible viewport */
  function syncViewport() {
    var vv = window.visualViewport;
    // Measure BEFORE the panel is resized: was the person already looking at the newest message? (Only then may we keep them pinned to the bottom.)
    var wasAtEnd = !opened || nearEnd();
    // The site shows phones at 95% (html{zoom:.95} in style.css) and that zoom also shrinks this fixed panel, which is what left a strip of the page
    // showing under the chat. Divide by the page zoom so the panel always fills the real screen, whatever the zoom is set to.
    var z = parseFloat(getComputedStyle(document.documentElement).zoom); if (!(z > 0)) z = 1;
    panel.style.setProperty('--vh', ((vv ? vv.height : window.innerHeight) / z) + 'px');
    panel.style.setProperty('--vt', ((vv ? vv.offsetTop : 0) / z) + 'px');
    // Only re-pin to the newest message when the person was already there (e.g. the keyboard just opened). If they scrolled up to read older messages, leave them where they are,
    // otherwise every viewport event (keyboard, address bar, visualViewport scroll) snapped the list back to the bottom and older messages could not be reached.
    if (opened && root.activeElement === ta && wasAtEnd) jumpEnd();
  }
  if (window.visualViewport) { visualViewport.addEventListener('resize', syncViewport); visualViewport.addEventListener('scroll', function () { if (opened) syncViewport(); }); }
  window.addEventListener('orientationchange', function () { setTimeout(syncViewport, 250); });
  window.addEventListener('resize', function () { if (opened) syncViewport(); });

  /* ---------- movable chat button ---------- */
  // Desktop (mouse): PRESS AND HOLD THE LEFT MOUSE BUTTON on the button and drag, or DOUBLE-CLICK it to pick it up (it follows the pointer; click anywhere, or press Esc, to put it down).
  // Touch screens: press and hold the button, then drag it anywhere. When let go it slides to the nearest side (left or right, never the middle); the height stays where it was dropped.
  // The spot is remembered on this device. The normal spot (bottom-right) is used until someone moves it. On desktop the chat window opens on the same side as the button.
  var POS_KEY = 'vlc_fab_pos';
  var pos = json(LS.get(POS_KEY));
  if (!pos || (pos.s !== 'l' && pos.s !== 'r') || !isFinite(pos.b)) pos = null;
  var press = null, suppressClick = false, moveMode = false, lastPtr = '';
  var probe = el('div'); probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)'; wF.appendChild(probe);
  function pageZoom() { var z = parseFloat(getComputedStyle(document.documentElement).zoom); return z > 0 ? z : 1; }
  function safeBottom() { return parseFloat(getComputedStyle(probe).paddingBottom) || 0; }
  function floorB() { return mq.matches ? (fab.classList.contains('lift') ? 96 : 14) : 20; } // never lower than the normal spot (keeps it above the phone's bottom bar)
  function clampB(b) { var min = floorB(), max = window.innerHeight / pageZoom() - (fab.offsetHeight || 66) - 80 - safeBottom(); return Math.max(min, Math.min(b, Math.max(min, max))); } // and never up under the site header
  function applyPos() {
    if (!pos || fab.classList.contains('inline')) { fab.classList.remove('l'); fab.style.bottom = ''; panel.classList.remove('left'); return; }
    fab.classList.toggle('l', pos.s === 'l'); panel.classList.toggle('left', pos.s === 'l');
    fab.style.bottom = 'calc(' + clampB(pos.b) + 'px + env(safe-area-inset-bottom, 0px))';
  }
  function startDrag() {
    if (!press) return;
    var r = fab.getBoundingClientRect(), z = pageZoom();
    press.active = true; suppressClick = true;
    press.ox = press.x0 - r.left; press.oy = press.y0 - r.top; press.w = r.width; press.h = r.height;
    fab.classList.add('drag');
    fab.style.right = 'auto'; fab.style.bottom = 'auto'; fab.style.left = (r.left / z) + 'px'; fab.style.top = (r.top / z) + 'px';
    try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) {}
  }
  function dropFab() {
    var z = pageZoom(), r = fab.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    pos = { s: cx < window.innerWidth / 2 ? 'l' : 'r', b: clampB((window.innerHeight - cy) / z - (fab.offsetHeight || 66) / 2 - safeBottom()) };
    LS.set(POS_KEY, JSON.stringify(pos));
    fab.classList.remove('drag'); fab.style.left = ''; fab.style.top = ''; fab.style.right = '';
    applyPos();
    // slide from where it was dropped to its final spot
    var r2 = fab.getBoundingClientRect();
    fab.style.transition = 'none';
    fab.style.transform = 'translate(' + ((cx - (r2.left + r2.width / 2)) / z) + 'px,' + ((cy - (r2.top + r2.height / 2)) / z) + 'px)';
    void fab.offsetWidth;
    fab.style.transition = 'transform .28s cubic-bezier(.2,.8,.2,1)'; fab.style.transform = '';
    setTimeout(function () { fab.style.transition = ''; suppressClick = false; }, 400);
  }
  function endPress(e) {
    if (!press || (e && e.pointerId !== undefined && e.pointerId !== press.id)) return;
    var p = press; press = null; clearTimeout(p.timer);
    try { fab.releasePointerCapture(p.id); } catch (err) {}
    if (p.active) dropFab();
  }
  fab.addEventListener('pointerdown', function (e) {
    lastPtr = e.pointerType;
    var mouse = e.pointerType === 'mouse';
    if ((mouse && e.button !== 0) || opened || fab.classList.contains('inline') || press) return; // mouse: left button only (a quick click still opens the chat)
    press = { id: e.pointerId, x0: e.clientX, y0: e.clientY, active: false, mouse: mouse, timer: setTimeout(startDrag, 450) };
    try { fab.setPointerCapture(e.pointerId); } catch (err) {}
  });
  fab.addEventListener('pointermove', function (e) {
    if (!press || e.pointerId !== press.id) return;
    if (!press.active) { // moved before the hold finished
      var th = press.mouse ? 6 : 10;
      if (Math.abs(e.clientX - press.x0) > th || Math.abs(e.clientY - press.y0) > th) {
        if (press.mouse) { clearTimeout(press.timer); startDrag(); return; } // mouse held down + moved = start dragging straight away
        var p = press; press = null; clearTimeout(p.timer); try { fab.releasePointerCapture(p.id); } catch (err) {} }
      return;
    }
    moveFab(e);
  });
  function moveFab(e) {
    var z = pageZoom(), x = Math.max(0, Math.min(e.clientX - press.ox, window.innerWidth - press.w)), y = Math.max(0, Math.min(e.clientY - press.oy, window.innerHeight - press.h));
    fab.style.left = (x / z) + 'px'; fab.style.top = (y / z) + 'px';
  }
  // Double-click (desktop): the button sticks to the pointer until you click anywhere (or press Esc).
  function onFollow(e) { if (press && press.active) moveFab(e); }
  function onDropClick(e) { e.preventDefault(); e.stopPropagation(); endMove(); }
  function onDropKey(e) { if (e.key === 'Escape') endMove(); }
  function endMove() {
    if (!moveMode) return;
    moveMode = false; press = null;
    window.removeEventListener('pointermove', onFollow, true);
    window.removeEventListener('click', onDropClick, true);
    window.removeEventListener('keydown', onDropKey, true);
    dropFab();
  }
  fab.addEventListener('dblclick', function (e) {
    if (lastPtr === 'touch' || lastPtr === 'pen' || fab.classList.contains('inline') || moveMode) return;
    if (opened) closePanel(); // the two clicks of the double-click opened it; put it away again
    press = { id: null, x0: e.clientX, y0: e.clientY, active: false, mouse: true };
    startDrag(); moveMode = true;
    window.addEventListener('pointermove', onFollow, true);
    window.addEventListener('click', onDropClick, true);
    window.addEventListener('keydown', onDropKey, true);
  });
  fab.addEventListener('pointerup', endPress);
  fab.addEventListener('pointercancel', endPress);
  fab.addEventListener('lostpointercapture', endPress);
  fab.addEventListener('contextmenu', function (e) { if (press) e.preventDefault(); }); // phones show a menu on long-press; not while holding the button
  window.addEventListener('resize', function () { if (!(press && press.active)) applyPos(); });

  /* ---------- events ---------- */
  fab.addEventListener('click', function (e) { if (e.detail > 1) return; /* 2nd click of a double-click */ if (suppressClick) { suppressClick = false; return; } if (opened) closePanel(); else openPanel(); });
  bClose.addEventListener('click', closePanel);
  bMin.addEventListener('click', closePanel);
  gate.addEventListener('click', function (e) {
    var a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'guest') startGuest();
    else { var sep = CFG.loginUrl.indexOf('?') > -1 ? '&' : '?'; location.href = CFG.loginUrl + sep + 'redirect=' + encodeURIComponent(location.pathname + location.search); }
  });
  bSend.addEventListener('click', submit);
  bBack.addEventListener('click', closePanel);
  // the keyboard opens/closes a moment after focus changes, so re-measure the visible screen a few times
  function settle() { [0, 120, 300, 600].forEach(function (ms) { setTimeout(syncViewport, ms); }); }
  ta.addEventListener('focus', settle); ta.addEventListener('blur', settle);
  ta.addEventListener('input', autosize);
  // Touch screens: when the person drags the message list to read, put the keyboard away (like Messenger/Telegram). Otherwise the message box stays focused behind the scrolling and the keyboard fights the scroll / pops back up.
  // It only listens (passive), never blocks scrolling, and only acts while the message box is focused. Tapping the message box or sending a message brings the keyboard back as before.
  var dragY = null;
  msgsEl.addEventListener('touchstart', function (e) { dragY = e.touches.length === 1 ? e.touches[0].clientY : null; }, { passive: true });
  msgsEl.addEventListener('touchmove', function (e) {
    if (dragY == null || root.activeElement !== ta) return;
    if (Math.abs(e.touches[0].clientY - dragY) > 10) { dragY = null; ta.blur(); }
  }, { passive: true });
  msgsEl.addEventListener('touchend', function () { dragY = null; }, { passive: true });
  msgsEl.addEventListener('touchcancel', function () { dragY = null; }, { passive: true });
  // Keyboard only on purpose: on touch screens the message box stays read-only (nothing can pop the keyboard up while you scroll). A real tap on the box unlocks it and the keyboard opens as normal; it locks again when it loses focus.
  function lockBox() { ta.readOnly = touchLike() && root.activeElement !== ta; }
  ta.addEventListener('mousedown', function () { ta.readOnly = false; });
  ta.addEventListener('blur', function () { if (touchLike()) ta.readOnly = true; });
  bSend.addEventListener('mousedown', function (e) { e.preventDefault(); }); // tapping Send must not pull focus off the message box, so the keyboard stays exactly as it was
  ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
  bEmo.addEventListener('click', function () { emo.classList.toggle('on'); });
  emo.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; ta.value += b.textContent; if (!touchLike()) ta.focus(); autosize(); });
  bClip.addEventListener('click', function () { file.click(); });
  file.addEventListener('change', function () { attach(file.files[0]); file.value = ''; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && opened) closePanel(); });
  window.addEventListener('storage', function (e) { if (e.key === CFG.userKey || e.key === 'vlc_session') { var was = session && session.id; session = resolveSession(); if (opened && (session ? session.id : null) !== was) { if (stop) { stop(); stop = null; } msgs = {}; if (session) showChat(); else { gate.classList.remove('off'); chat.classList.remove('on'); } } } });

  /* ---------- mount ---------- */
  var mq = window.matchMedia('(max-width:520px)');
  function place() {
    var slot = document.getElementById('velantis-chat-slot') || document.querySelector('[data-livechat-slot]');
    if (mq.matches && slot) {            // mobile + slot found: button sits in the page and scrolls with it
      if (hostF.parentNode !== slot) slot.appendChild(hostF);
      fab.classList.add('inline'); fab.classList.remove('lift');
    } else {                             // desktop (floating), or mobile fallback lifted above the bottom nav
      if (hostF.parentNode !== document.body) document.body.appendChild(hostF);
      fab.classList.remove('inline'); fab.classList.toggle('lift', mq.matches);
    }
    lockBox();
    applyPos();
  }
  if (mq.addEventListener) mq.addEventListener('change', place); else if (mq.addListener) mq.addListener(place);
  function onWidth() { if (!mq.matches) { unlockPage(); scrim.classList.remove('on'); } else if (opened) { scrim.classList.add('on'); lockPage(); syncViewport(); } }
  if (mq.addEventListener) mq.addEventListener('change', onWidth); else if (mq.addListener) mq.addListener(onWidth);
  function mount() {
    document.body.appendChild(host);
    place();
    fab.classList.add('pulse');
    // Background listener so the unread badge works before the chat is opened
    if (session) { stop = T.listen(session, addMsg); updateBadge(); }
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  /* tiny public API:  VelantisChat.open() / .close() \u2014 handy for a "Chat with us" link */
  window.VelantisChat = { open: openPanel, close: closePanel };
})();