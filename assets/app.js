/* =========================================================================
   Friends & Foils — shared behavior for every page.
   1) Email capture -> Buttondown (buttondown.com/friendsandfoils)
   2) Holo card tilt (home hero only; no-ops elsewhere)
   3) Mobile nav toggle
   Leave CONFIG.ACTION empty to run capture in demo mode (shows success,
   sends nothing).
   ========================================================================= */

/* ---- 1) Email capture ------------------------------------------------ */
const CONFIG = {
  ACTION: "https://buttondown.com/api/emails/embed-subscribe/friendsandfoils",
  EMAIL_FIELD: "email",             // Buttondown expects "email"
  VENDOR_FIELD: "tag",              // Buttondown tag field; value set below
  VENDOR_VALUE: "vendor-interest",  // tag applied when the vendor box is checked
  BOT_FIELD: ""                     // Buttondown needs no bot field
};

function wireCapture(form){
  const success = form.querySelector('.success');
  const emailInput = form.querySelector('input[type=email]');
  if(!emailInput) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const email = (emailInput.value || '').trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if(!ok){ emailInput.focus(); emailInput.style.color = '#ff8c8c'; return; }
    emailInput.style.color = '';
    const vendorEl = form.querySelector('input[name=vendor]');
    const vendor = vendorEl && vendorEl.checked;
    if(CONFIG.ACTION){
      // Hidden iframe swallows the cross-origin response so the POST is silent
      // and the in-page success message can show instead of navigating away.
      if(!document.querySelector('iframe[name=ff_sink]')){
        const f = document.createElement('iframe');
        f.name = 'ff_sink'; f.style.display = 'none'; f.title = 'hidden';
        document.body.appendChild(f);
      }
      const real = document.createElement('form');
      real.action = CONFIG.ACTION; real.method = 'POST'; real.target = 'ff_sink';
      real.style.display = 'none';
      const add = function(n,v){ if(!n) return; const i=document.createElement('input'); i.name=n; i.value=v; real.appendChild(i); };
      add(CONFIG.EMAIL_FIELD, email);
      if(vendor) add(CONFIG.VENDOR_FIELD, CONFIG.VENDOR_VALUE);
      if(CONFIG.BOT_FIELD) add(CONFIG.BOT_FIELD, '');
      document.body.appendChild(real);
      real.submit();
    }
    if(success) success.classList.add('show');
    emailInput.value = '';
    if(vendorEl) vendorEl.checked = false;
  });
}
document.querySelectorAll('form.capture').forEach(wireCapture);

/* ---- 2) Holo card ---------------------------------------------------- */
(function(){
  const holo = document.getElementById('holo');
  if(!holo) return;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!finePointer || reduce) return;
  const stage = holo.parentElement;
  const shine = holo.querySelector('.shine');
  const sheen = holo.querySelector('.foilsheen');
  function move(e){
    const r = holo.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * 16;
    const ry = (px - 0.5) * 18;
    holo.style.transform = 'rotateX('+rx+'deg) rotateY('+ry+'deg)';
    const mx = (px*100).toFixed(1)+'%', my = (py*100).toFixed(1)+'%';
    if(shine){ shine.style.setProperty('--mx', mx); shine.style.setProperty('--my', my); }
    if(sheen) sheen.style.backgroundPosition = mx+' '+my;
  }
  function reset(){ holo.style.transform = 'rotateX(0) rotateY(0)'; }
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerleave', reset);
})();

/* ---- 3) Mobile nav --------------------------------------------------- */
(function(){
  const btn = document.getElementById('menuBtn');
  const links = document.getElementById('navlinks');
  if(!btn || !links) return;
  btn.addEventListener('click', function(){
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Close the menu after tapping a link
  links.addEventListener('click', function(e){
    if(e.target.closest('a')){ links.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
  });
})();
