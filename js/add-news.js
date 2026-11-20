/* Willis Hazell: "Add a news story" demo (add-news.html).
   Shows staff how a story is added: they fill in a form, the story is saved to this browser only (localStorage key
   wh-news-draft) and drawn by the real article template in the preview frame (article.html?a=__preview).
   Publishing sets a flag that makes the story appear on the News page, the homepage and its own article URL,
   in this browser only. Nothing is sent to a server. On the live site this form would be the CMS (WordPress) editor. */
(function () {
  'use strict';
  var form = document.getElementById('ed-form');
  if (!form) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var slugify = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var D = window.WH_DATA || { projects: [] };
  var E = window.WH_EDITORIAL || { authors: {}, newsCategories: [] };
  var KEY = 'wh-news-draft';
  var today = (function () { var n = new Date(); return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2); })();

  var load = function () { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  var status = $('#ed-status');
  var save = function (d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); return true; }
    catch (e) { status.textContent = 'This browser could not save the story (storage is full or switched off). Try a smaller photo.'; return false; }
  };

  /* ---------- form options ---------- */
  var withPhotos = D.projects.filter(function (p) { return p.image; });
  $('#f-category').innerHTML = (E.newsCategories || []).map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
  $('#f-author').innerHTML = Object.keys(E.authors || {}).map(function (k) {
    var a = E.authors[k]; return '<option value="' + esc(k) + '">' + esc(a.name) + (a.role && a.role.charAt(0) !== '[' ? ', ' + esc(a.role) : '') + '</option>';
  }).join('');
  $('#ed-projects').innerHTML = D.projects.filter(function (p) { return p.caseStudy; }).map(function (p) {
    return '<label class="ed-check-line"><input type="checkbox" name="related" value="' + esc(p.slug) + '"> ' + esc(p.name) + '</label>';
  }).join('');
  var thumb = function (p) { return 'assets/img/' + p.image + '-' + Math.min(800, p.imageMaxW) + '.webp'; };
  $('#ed-library').innerHTML = withPhotos.map(function (p, i) {
    return '<label class="ed-pic"><input type="radio" name="libpic" value="' + esc(p.slug) + '"' + '>' +
      '<img src="' + thumb(p) + '" alt="" loading="lazy" decoding="async"><span>' + esc(p.name) + '</span></label>';
  }).join('');

  /* ---------- photo state ---------- */
  var photo = null; // {name,maxW} from the library or {src} uploaded, plus alt and credit
  var photoFields = $('#ed-photo-fields');
  var showPhotoFields = function () {
    photoFields.hidden = !photo;
    $$('input[name=libpic]').forEach(function (r) { r.checked = !!(photo && photo.slug === r.value); });
  };
  $('#ed-library').addEventListener('change', function (e) {
    var p = withPhotos.filter(function (x) { return x.slug === e.target.value; })[0]; if (!p) return;
    photo = { name: p.image, maxW: p.imageMaxW, slug: p.slug, alt: $('#f-alt').value, credit: $('#f-credit').value };
    $('#f-upload').value = ''; showPhotoFields(); changed();
  });
  $('#f-upload').addEventListener('change', function () {
    var file = this.files && this.files[0]; if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { status.textContent = 'Please choose a JPEG, PNG or WebP photo.'; this.value = ''; return; }
    var reader = new FileReader();
    reader.onload = function () {
      var im = new Image();
      im.onload = function () {
        var w = Math.min(1600, im.naturalWidth), h = Math.round(im.naturalHeight * w / im.naturalWidth);
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(im, 0, 0, w, h);
        photo = { src: c.toDataURL('image/jpeg', 0.8), alt: $('#f-alt').value, credit: $('#f-credit').value };
        showPhotoFields(); changed(); $('#f-alt').focus();
      };
      im.onerror = function () { status.textContent = 'That file could not be read as a photo.'; };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  $('#f-photo-remove').addEventListener('click', function () { photo = null; $('#f-upload').value = ''; showPhotoFields(); changed(); $('#f-upload').focus(); });

  /* ---------- read / write the form ---------- */
  var published = false;
  var collect = function () {
    var d = {
      title: $('#f-title').value.trim(), summary: $('#f-summary').value.trim(), body: $('#f-body').value,
      category: $('#f-category').value, author: $('#f-author').value, date: $('#f-date').value || today,
      relatedProjects: $$('input[name=related]:checked').map(function (i) { return i.value; }),
      linkedin: $('#f-linkedin').value.trim(), featured: $('#f-featured').checked, published: published
    };
    if (photo) { photo.alt = $('#f-alt').value.trim(); photo.credit = $('#f-credit').value.trim(); d.image = photo; }
    return d;
  };
  var fill = function (d) {
    d = d || {};
    $('#f-title').value = d.title || ''; $('#f-summary').value = d.summary || ''; $('#f-body').value = d.body || '';
    if (d.category) $('#f-category').value = d.category; else $('#f-category').selectedIndex = 0;
    $('#f-author').value = d.author && E.authors[d.author] ? d.author : Object.keys(E.authors)[0];
    $('#f-date').value = d.date || today;
    $$('input[name=related]').forEach(function (i) { i.checked = (d.relatedProjects || []).indexOf(i.value) > -1; });
    $('#f-linkedin').value = d.linkedin || ''; $('#f-featured').checked = d.featured !== false;
    photo = d.image && (d.image.src || d.image.name) ? d.image : null;
    $('#f-alt').value = photo ? photo.alt || '' : ''; $('#f-credit').value = photo ? photo.credit || '' : '';
    $('#f-upload').value = ''; published = !!d.published; showPhotoFields(); count();
  };
  var count = function () { var n = $('#f-summary').value.length; $('#f-summary-count').textContent = n + ' of 220 characters'; };

  var timer = null;
  var changed = function () {
    count(); clearTimeout(timer);
    timer = setTimeout(function () {
      if (save(collect())) refreshFrame();
    }, 250);
  };
  form.addEventListener('input', changed);
  form.addEventListener('change', function (e) { if (e.target.name !== 'libpic' && e.target.id !== 'f-upload') changed(); });

  /* The preview frame redraws on the browser's storage event; some browsers do not send it to a same-page frame,
     so it is also redrawn directly when the frame's script is reachable. */
  var frame = $('#ed-frame');
  var refreshFrame = function () {
    try { frame.contentWindow.dispatchEvent(new StorageEvent('storage', { key: KEY })); } catch (e) { /* frame not ready */ }
  };

  /* ---------- examples ---------- */
  var EX = {
    update: {
      title: 'Racecourse Ground Kop stand: [milestone] reached',
      summary: 'An update from site as the new Kop stand at the Racecourse Ground in Wrexham takes shape.',
      body: 'Work on the new Kop stand at the Racecourse Ground has reached [milestone], with [what has been built since the last update].\n\nWillis Hazell is the structural engineer for the stand, working with [client and contractor].\n\n## What happens next\n\n[One or two sentences on the next stage of work and when supporters will see it.]',
      category: 'Project Updates', author: 'sample-author', relatedProjects: ['racecourse-ground-kop-stand'],
      image: { name: 'wrexham-kop', maxW: 1600, slug: 'racecourse-ground-kop-stand', alt: 'The Kop stand at the Racecourse Ground, Wrexham', credit: '[Photographer]' }
    },
    appointment: {
      title: 'Willis Hazell welcomes [name] as [role]',
      summary: '[Name] joins the practice as [role], bringing [number] years of experience in [specialism].',
      body: '[Name] has joined Willis Hazell as [role]. They join from [previous employer], where they worked on [notable projects].\n\n[A short line on what they will lead or focus on at Willis Hazell.]\n\n## About [first name]\n\n[Qualifications, chartership and an interest outside work, if they are happy to share it.]',
      category: 'Appointments', author: 'sample-author', relatedProjects: []
    },
    completion: {
      title: 'Elite Performance Centre: [phase] complete',
      summary: 'The [phase] of the Elite Performance Centre is complete and in use by the club.',
      body: 'The [phase] of the Elite Performance Centre is now complete and has been handed over to [client].\n\n## Our role\n\nWillis Hazell provided [services] for the scheme, from [stage] through to completion.\n\n## The team\n\n[Client, architect and contractor, as agreed for publication.]',
      category: 'Completions', author: 'sample-author', relatedProjects: ['brighton-elite-performance-centre'],
      image: { name: 'brighton-epc', maxW: 1600, slug: 'brighton-elite-performance-centre', alt: 'The Elite Performance Centre training building', credit: '[Photographer]' }
    }
  };
  $$('[data-example]').forEach(function (b) {
    b.addEventListener('click', function () {
      var ex = JSON.parse(JSON.stringify(EX[b.getAttribute('data-example')])); ex.date = today; ex.featured = true; ex.published = false;
      fill(ex); clearErrors(); status.textContent = 'Example loaded. Change anything you like; the preview updates as you type.';
      if (save(collect())) refreshFrame();
      $('#f-title').focus();
    });
  });
  $('#ed-clear').addEventListener('click', function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    fill({}); clearErrors(); status.textContent = 'Cleared. Your story has been removed from this browser.'; refreshFrame(); $('#f-title').focus();
  });

  /* ---------- publish ---------- */
  var errBox = $('#ed-errors');
  var clearErrors = function () {
    errBox.hidden = true; errBox.innerHTML = '';
    $$('[aria-invalid]', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
    $$('.ed-err', form).forEach(function (el) { el.parentNode.removeChild(el); });
  };
  var setStatusPublished = function () {
    var d = collect(), url = 'article.html?a=' + encodeURIComponent(slugify(d.title) || 'your-story');
    status.innerHTML = '<strong>Published.</strong> In this browser, the story is now on <a class="inline-link" href="news.html">the News page</a>, ' +
      '<a class="inline-link" href="index.html">the homepage</a> and <a class="inline-link" href="' + url + '">its own page</a>. Further changes are saved as you type. ' +
      '<button type="button" class="tl" id="ed-unpublish">Remove it</button>';
    $('#ed-unpublish').addEventListener('click', function () { $('#ed-clear').click(); });
  };
  form.addEventListener('submit', function (e) {
    e.preventDefault(); clearErrors();
    var d = collect(), errs = [];
    if (!d.title) errs.push(['f-title', 'Enter a headline']);
    if (!d.summary) errs.push(['f-summary', 'Enter a summary']);
    if (photo && !photo.alt) errs.push(['f-alt', 'Describe the photo']);
    if (photo && !photo.credit) errs.push(['f-credit', 'Add a photo credit']);
    if (d.linkedin && !/^https:\/\/(www\.)?linkedin\.com\//.test(d.linkedin)) errs.push(['f-linkedin', 'The LinkedIn link should start with https://www.linkedin.com/']);
    if (errs.length) {
      errs.forEach(function (x) {
        var el = document.getElementById(x[0]); el.setAttribute('aria-invalid', 'true');
        var m = document.createElement('p'); m.className = 'ed-err'; m.id = x[0] + '-err'; m.textContent = x[1];
        el.insertAdjacentElement('afterend', m);
        el.setAttribute('aria-describedby', ((el.getAttribute('aria-describedby') || '').replace(new RegExp('\\s*' + x[0] + '-err', 'g'), '') + ' ' + x[0] + '-err').trim());
      });
      errBox.innerHTML = '<p><strong>Check ' + (errs.length === 1 ? 'one thing' : errs.length + ' things') + ' before publishing:</strong></p><ul>' +
        errs.map(function (x) { return '<li><a href="#' + x[0] + '">' + esc(x[1]) + '</a></li>'; }).join('') + '</ul>';
      errBox.hidden = false; errBox.focus(); status.textContent = '';
      return;
    }
    published = true; d.published = true;
    if (save(d)) { refreshFrame(); setStatusPublished(); }
  });

  /* ---------- preview frame size ---------- */
  var box = $('#ed-frame-box'), size = 'desktop';
  var fit = function () {
    var W = size === 'phone' ? 390 : 1280, avail = box.clientWidth, s = Math.min(1, avail / W);
    frame.style.width = W + 'px'; frame.style.height = Math.round(box.clientHeight / s) + 'px';
    frame.style.transform = 'scale(' + s + ')'; frame.style.left = Math.max(0, (avail - W * s) / 2) + 'px';
  };
  $$('.ed-toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      size = b.getAttribute('data-size');
      $$('.ed-toggle button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      fit();
    });
  });
  window.addEventListener('resize', fit);
  frame.addEventListener('load', function () {
    /* links clicked inside the preview open in the main window, not inside the frame */
    try { frame.contentDocument.addEventListener('click', function (e) { var a = e.target.closest('a[href]'); if (a && !a.target) { e.preventDefault(); window.open(a.href, '_blank', 'noopener'); } }); } catch (e) { /* ignore */ }
  });

  fill(load() || {}); fit();
  if (published) setStatusPublished();
})();
