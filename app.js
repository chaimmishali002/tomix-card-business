/* toMix Card לעסקים – לוגיקת דף הנחיתה */

// כתובת ה-Web App של Google Apps Script (מכניס לגיליון + שולח מייל להדס)
var SCRIPT_URL = '';

(function () {
  // ---- כרטיס מגיב לעכבר ----
  var hero = document.getElementById('hero'),
      tilt = document.getElementById('tilt'),
      glow = document.getElementById('glow');
  if (hero && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect(),
          px = (e.clientX - r.left) / r.width,
          py = (e.clientY - r.top) / r.height;
      tilt.style.transform = 'rotateX(' + Math.round((0.5 - py) * 22) + 'deg) rotateY(' + Math.round((px - 0.5) * 28) + 'deg)';
      glow.style.left = Math.round(px * 100) + '%';
      glow.style.top = Math.round(py * 100) + '%';
    });
    hero.addEventListener('mouseleave', function () {
      tilt.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  // ---- סרטון יוטיוב (נטען רק בלחיצה) ----
  var yt = document.getElementById('yt'), ytBtn = document.getElementById('ytPlay');
  // תמונה מקדימה: יוטיוב מחזיר ריבוע אפור 120x90 כשאין רזולוציה מסוימת – יורדים רזולוציה עד שיש תמונה אמיתית
  var thumb = document.getElementById('ytThumb');
  if (thumb) {
    var sizes = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', '0'], si = 0;
    var next = function () {
      si++;
      if (si < sizes.length) thumb.src = 'https://i.ytimg.com/vi/RXbBlem-SVc/' + sizes[si] + '.jpg';
    };
    var check = function () { if (thumb.naturalWidth && thumb.naturalWidth <= 120) next(); };
    thumb.addEventListener('load', check);
    thumb.addEventListener('error', next);
    if (thumb.complete) { if (thumb.naturalWidth === 0) next(); else check(); }
  }
  if (ytBtn) {
    ytBtn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/RXbBlem-SVc?autoplay=1&rel=0&modestbranding=1';
      f.title = 'toMix Card';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      yt.innerHTML = '';
      yt.appendChild(f);
      if (window.fbq) fbq('trackCustom', 'VideoPlay');
    });
  }

  // ---- UTM ----
  var qs = new URLSearchParams(location.search);
  var utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
    var v = qs.get(k);
    try {
      if (v) sessionStorage.setItem(k, v); else v = sessionStorage.getItem(k);
    } catch (e) {}
    utm[k] = v || '';
  });

  // ---- טופס ----
  var form = document.getElementById('leadForm'),
      btn = document.getElementById('sendBtn'),
      err = document.getElementById('formErr');
  if (!form) return;

  function invalid(el, msg) {
    el.setCustomValidity(msg);
    el.reportValidity();
    el.addEventListener('input', function () { el.setCustomValidity(''); }, { once: true });
    return false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    var el = form.elements;
    var name = el.name.value.trim(),
        phone = el.phone.value.trim(),
        email = el.email.value.trim(),
        company = el.company.value.trim();

    if (name.length < 2) return invalid(el.name, 'נא למלא שם מלא');
    if (phone.replace(/\D/g, '').length < 9) return invalid(el.phone, 'נא למלא מספר טלפון תקין');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return invalid(el.email, 'נא למלא כתובת מייל תקינה');
    if (company.length < 2) return invalid(el.company, 'נא למלא שם חברה');
    if (el.website.value) return; // בוט

    var data = new URLSearchParams({
      name: name, phone: phone, email: email, company: company,
      utm_source: utm.utm_source, utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign, utm_content: utm.utm_content,
      page: location.href
    });

    btn.disabled = true;
    btn.style.opacity = '.7';
    btn.firstChild.textContent = 'שולח... ';

    function done() {
      try {
        sessionStorage.setItem('tm_lead', '1');
        sessionStorage.setItem('tm_name', name.split(' ')[0]);
      } catch (e) {}
      location.href = 'thanks.html';
    }

    if (!SCRIPT_URL) { done(); return; }

    fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: data })
      .then(done)
      .catch(function () {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.firstChild.textContent = 'שלחו לי הצעה לעובדים ';
        err.hidden = false;
      });
  });
})();
