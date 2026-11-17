/* Willis Hazell — prototype behaviour. No dependencies. */
(function () {
  'use strict';
  var D = window.WH_DATA || { projects: [], sectors: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var slugify = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Responsive image markup: name-800.webp / name-{max}.webp */
  function img(name, maxW, sizes, alt, eager) {
    if (!name) return '';
    var widths = [800, maxW].filter(function (w, i, a) { return w <= maxW && a.indexOf(w) === i; });
    if (maxW < 800) widths = [maxW];
    var srcset = widths.map(function (w) { return 'assets/img/' + name + '-' + w + '.webp ' + w + 'w'; }).join(', ');
    return '<img src="assets/img/' + name + '-' + widths[widths.length - 1] + '.webp" srcset="' + srcset + '" sizes="' + sizes + '" alt="' + esc(alt) + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async">';
  }
  /* Licensed project photography (js/photography.js, window.WH_PHOTOS keyed by project slug).
     Everything falls back to today's behaviour when WH_PHOTOS or a project's entry is absent. */
  var PH = window.WH_PHOTOS || {};
  var photosFor = function (slug) { return Object.prototype.hasOwnProperty.call(PH, slug) && PH[slug] && PH[slug].length ? PH[slug] : null; };
  /* Concept preview: when licensed photography is loaded, only projects with an image are listed (case studies,
     plus projects with a WH_PHOTOS entry). Used by the Projects archive and the homepage sector counts.
     Without WH_PHOTOS every project is listed, as before. */
  var listedProjects = window.WH_PHOTOS ? D.projects.filter(function (p) { return p.image || photosFor(p.slug); }) : D.projects;
  /* Sibling of img(): srcset from the photo's own widths array; width/height reserve its aspect ratio */
  function photoImg(ph, sizes) {
    var srcset = ph.widths.map(function (w) { return 'assets/img/' + ph.name + '-' + w + '.webp ' + w + 'w'; }).join(', ');
    var src = ph.widths.filter(function (w) { return w <= 1600; }).pop() || ph.widths[0];
    return '<img src="assets/img/' + ph.name + '-' + src + '.webp" srcset="' + srcset + '" sizes="' + sizes + '" width="' + ph.w + '" height="' + ph.h +
      '" alt="' + esc(ph.alt) + '" loading="lazy" decoding="async">';
  }
  /* The manifest's credit wording, with the licence linked (CC BY / CC BY-SA requirement) and the Commons source linked */
  function photoCredit(ph) {
    var t = esc(ph.credit), lic = esc(ph.licence);
    if (ph.licenceUrl && t.indexOf(lic) > -1) t = t.replace(lic, '<a href="' + esc(ph.licenceUrl) + '" rel="license noopener" target="_blank">' + lic + '<span class="visually-hidden"> (opens in a new tab)</span></a>');
    if (ph.source && t.indexOf('Wikimedia Commons') > -1) t = t.replace('Wikimedia Commons', '<a href="' + esc(ph.source) + '" rel="noopener" target="_blank">Wikimedia Commons<span class="visually-hidden"> (opens in a new tab)</span></a>');
    return t;
  }
  var MONTHS_PH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  /* "Under construction, June 2026" for construction-stage photos */
  function photoPhase(ph) {
    if (!/^construction/i.test(ph.phase || '')) return '';
    var d = /^(\d{4})-(\d{2})/.exec(ph.dateTaken || '');
    return 'Under construction' + (d ? ', ' + MONTHS_PH[+d[2] - 1] + ' ' + d[1] : '');
  }
  function creditTag(p) {
    if (p.credit === 'willis-hazell') return '<span class="credit wh">Willis Hazell</span>';
    if (p.credit === 'experience') return '<span class="credit">Team experience</span>';
    return '<span class="credit tbc">Credit to confirm</span>';
  }
  function projectUrl(p) { return 'project.html?p=' + encodeURIComponent(p.slug); }
  /* SERV-009b: services whose records list this case study (reverse of the service -> project relationship).
     Labelled "Related services" so it does not stand in for the project's confirmed services, which stay hidden until supplied. */
  function csServices(p) {
    var list = ((window.WH_SERVICES || {}).services || []).filter(function (s) {
      return s.status === 'published' && (s.projects || []).some(function (x) { return x.slug === p.slug; });
    }).sort(function (a, b) { return a.order - b.order; });
    if (!list.length) return '';
    return '<div class="cs-svcs"><h2 class="label">Related services</h2><p>' + list.map(function (s) { return '<a class="inline-link" href="service.html?s=' + encodeURIComponent(s.slug) + '">' + esc(s.name) + '</a>'; }).join(' · ') +
      '</p><p class="caption">Linked from the key inputs listed for this project.</p></div>';
  }

  /* Header: transparent over the hero, solid after it; mobile menu */
  var header = $('.site-header');
  if (header) {
    var hero = $('.hero');
    if (hero) {
      header.classList.add('over-hero');
      var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > hero.offsetHeight - 90); };
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
    var btn = $('.menu-btn', header);
    if (btn) {
      btn.addEventListener('click', function () {
        var open = header.classList.toggle('menu-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? 'Close' : 'Menu';
        document.body.style.overflow = open ? 'hidden' : '';
      });
      /* While the menu is open, Tab and Shift+Tab cycle only through the logo, the Menu/Close button and the menu items */
      var menuFocusables = function () {
        return $$('a[href], button', header).filter(function (el) { return el.offsetParent !== null || getComputedStyle(el).position === 'fixed'; });
      };
      document.addEventListener('keydown', function (e) {
        if (!header.classList.contains('menu-open')) return;
        if (e.key === 'Escape') { btn.click(); btn.focus(); return; }
        if (e.key !== 'Tab') return;
        var f = menuFocusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1], i = f.indexOf(document.activeElement);
        if (i < 0) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
        else if (e.shiftKey && i === 0) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); first.focus(); }
      });
    }
  }

  /* SERV-001: Services dropdown (disclosure). Desktop only; the mobile menu lists the pages inline */
  $$('.nav-group').forEach(function (g) {
    var b = $('.nav-sub-btn', g);
    if (!b) return;
    var hoverMq = window.matchMedia ? window.matchMedia('(hover: hover) and (min-width: 901px)') : { matches: false };
    var set = function (open) { g.classList.toggle('open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    /* A pointer that has just opened the menu by hovering would otherwise close it again with its click */
    var hoverOpenedAt = 0;
    b.addEventListener('click', function () {
      if (Date.now() - hoverOpenedAt < 800) { set(true); return; }
      set(!g.classList.contains('open'));
    });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && g.classList.contains('open')) { e.stopPropagation(); set(false); b.focus(); }
    });
    g.addEventListener('focusout', function (e) { if (!g.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', function (e) { if (!g.contains(e.target)) set(false); });
    g.addEventListener('mouseenter', function () { if (hoverMq.matches && !g.classList.contains('open')) { hoverOpenedAt = Date.now(); set(true); } });
    g.addEventListener('mouseleave', function () { if (hoverMq.matches) set(false); });
  });

  /* Hero video pause (WCAG 2.2.2) */
  var video = $('.hero video'), pause = $('.pause');
  if (video && pause) {
    var setState = function () {
      var paused = video.paused;
      pause.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
      pause.innerHTML = paused
        ? '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3.5 2 12 7 3.5 12Z"/></svg>'
        : '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.6"><path d="M4.5 2v10M9.5 2v10"/></svg>';
    };
    /* Only attach the video where it is shown: wide screens with motion allowed */
    var wantsVideo = !reduced && window.matchMedia('(min-width:701px)').matches;
    if (wantsVideo) {
      video.src = video.getAttribute('data-src');
      video.addEventListener('playing', function () { video.classList.add('is-playing'); });
      var pr0 = video.play(); if (pr0 && pr0.catch) pr0.catch(function () {});
    }
    pause.addEventListener('click', function () { if (video.paused) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); } else video.pause(); });
    video.addEventListener('play', setState); video.addEventListener('pause', setState); setState();
  }

  /* Sector counts + hover image */
  $$('[data-sector-count]').forEach(function (el) {
    var n = listedProjects.filter(function (p) { return p.sector === el.getAttribute('data-sector-count'); }).length;
    el.textContent = n ? n + (n === 1 ? ' project' : ' projects') : 'Projects to follow';
  });
  var sectorImg = $('.sector-image img');
  if (sectorImg) $$('.sector-list a[data-img]').forEach(function (a) {
    var show = function () { sectorImg.src = 'assets/img/' + a.getAttribute('data-img') + '-800.webp'; sectorImg.alt = a.getAttribute('data-alt') || ''; };
    a.addEventListener('mouseenter', show); a.addEventListener('focus', show);
  });

  /* ---------- Projects archive ---------- */
  var archive = $('#archive');
  if (archive) {
    var form = $('#filters-form'), list = $('#results'), countEl = $('#count'), chips = $('#chips'), clearBtn = $('#clear'), moreWrap = $('#more');
    var PAGE = 18, shown = PAGE;
    var AP = listedProjects;
    var emptyHeading = $('#empty h2'), emptyHeadingDefault = emptyHeading.textContent;
    var sectorsInUse = D.sectors.filter(function (s) { return AP.some(function (p) { return p.sector === s; }); });
    var TYPES = [{ id: 'case-studies', label: 'Case studies', test: function (p) { return p.caseStudy; } },
                 { id: 'experience-list', label: 'Experience list', test: function (p) { return !p.caseStudy; } }];

    $('#opt-sector').innerHTML = sectorsInUse.map(function (s) {
      var n = AP.filter(function (p) { return p.sector === s; }).length;
      return '<label class="opt"><input type="checkbox" name="sector" value="' + slugify(s) + '"> ' + esc(s) + ' <span class="n">(' + n + ')</span></label>';
    }).join('');
    $('#opt-type').innerHTML = TYPES.map(function (t) {
      var n = AP.filter(t.test).length;
      return '<label class="opt"><input type="checkbox" name="type" value="' + t.id + '"> ' + t.label + ' <span class="n">(' + n + ')</span></label>';
    }).join('');

    var readState = function () {
      var q = new URLSearchParams(location.search);
      return { sector: q.getAll('sector'), type: q.getAll('type'), q: q.get('q') || '' };
    };
    var applyStateToForm = function (st) {
      $$('input[name=sector]', form).forEach(function (i) { i.checked = st.sector.indexOf(i.value) > -1; });
      $$('input[name=type]', form).forEach(function (i) { i.checked = st.type.indexOf(i.value) > -1; });
      $('#q').value = st.q;
    };
    var formState = function () {
      return {
        sector: $$('input[name=sector]:checked', form).map(function (i) { return i.value; }),
        type: $$('input[name=type]:checked', form).map(function (i) { return i.value; }),
        q: $('#q').value.trim()
      };
    };
    var toQuery = function (st) {
      var q = new URLSearchParams();
      st.sector.forEach(function (v) { q.append('sector', v); });
      st.type.forEach(function (v) { q.append('type', v); });
      if (st.q) q.set('q', st.q);
      var s = q.toString(); return s ? '?' + s : location.pathname.split('/').pop();
    };
    var matches = function (p, st) {
      if (st.sector.length && st.sector.indexOf(slugify(p.sector)) < 0) return false;
      if (st.type.length && !TYPES.some(function (t) { return st.type.indexOf(t.id) > -1 && t.test(p); })) return false;
      if (st.q) {
        var hay = [p.name, p.detail, p.client, p.location, p.summary, p.sector].concat(p.keyInputs || []).join(' ').toLowerCase();
        return st.q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
      }
      return true;
    };
    var card = function (p, i) {
      if (p.caseStudy) {
        var wide = i === 0 && p.imageMaxW >= 1400;
        return '<li' + (wide ? ' class="wide"' : '') + '><a href="' + projectUrl(p) + '">' +
          '<div class="frame ' + (wide ? 'ratio-169' : 'ratio-45') + '">' + img(p.image, p.imageMaxW, wide ? '(max-width:620px) 100vw, 66vw' : '(max-width:620px) 100vw, 33vw', '') + '</div>' +
          '<div class="card-text"><h3 class="title-project">' + esc(p.name) + '</h3><p class="body-small">' + esc(p.summary) + '</p>' +
          '<p class="label">' + esc(p.sector) + ' · ' + esc(p.location) + '</p>' + creditTag(p) + '</div></a></li>';
      }
      var text = '<p class="label">' + esc(p.sector) + '</p><h3 class="title-project">' + esc(p.name) + '</h3>' +
        (p.detail ? '<p class="body-small">' + esc(p.detail.charAt(0).toUpperCase() + p.detail.slice(1)) + '</p>' : '') + creditTag(p);
      /* DESIGN-006: photo cards lead with the title (like case-study cards) so titles line up across a row */
      var ptext = '<h3 class="title-project">' + esc(p.name) + '</h3>' +
        (p.detail ? '<p class="body-small">' + esc(p.detail.charAt(0).toUpperCase() + p.detail.slice(1)) + '</p>' : '') + '<p class="label">' + esc(p.sector) + '</p>' + creditTag(p);
      /* Projects without a detail page: the first licensed photo becomes the card thumbnail (no link, no new page) */
      var ph = !p.image && photosFor(p.slug);
      if (ph) return '<li><div class="photo-card"><div class="frame ratio-45">' + photoImg(ph[0], '(max-width:620px) calc(100vw - 32px), (max-width:900px) 45vw, 320px') + '</div>' +
        '<div class="card-text">' + ptext + '</div><p class="photo-credit">' + (photoPhase(ph[0]) ? '<span class="photo-phase">' + photoPhase(ph[0]) + '.</span> ' : '') + photoCredit(ph[0]) + '</p></div></li>';
      return '<li><div class="typo-card">' + text + '</div></li>';
    };
    var render = function (st) {
      var res = AP.filter(function (p) { return matches(p, st); });
      res.sort(function (a, b) { return (b.caseStudy ? 1 : 0) - (a.caseStudy ? 1 : 0); });
      countEl.textContent = res.length + (res.length === 1 ? ' project' : ' projects');
      var tags = [];
      st.sector.forEach(function (v) { tags.push({ k: 'sector', v: v, l: (D.sectors.filter(function (s) { return slugify(s) === v; })[0] || v) }); });
      st.type.forEach(function (v) { tags.push({ k: 'type', v: v, l: (TYPES.filter(function (t) { return t.id === v; })[0] || { label: v }).label }); });
      if (st.q) tags.push({ k: 'q', v: st.q, l: '“' + st.q + '”' });
      chips.innerHTML = tags.map(function (t) { return '<span class="chip">' + esc(t.l) + '<button type="button" data-k="' + t.k + '" data-v="' + esc(t.v) + '" aria-label="Remove filter: ' + esc(t.l) + '">×</button></span>'; }).join('');
      clearBtn.hidden = !tags.length;
      var toggleCount = $('#filter-count'); if (toggleCount) toggleCount.textContent = tags.length ? ' (' + tags.length + ')' : '';
      var applyBtn = $('#apply'); if (applyBtn) applyBtn.textContent = 'Show ' + res.length + ' projects';
      if (!res.length) {
        list.innerHTML = '';
        /* Selected sectors that have no projects at all (e.g. Event Overlay): say "to follow" rather than "no match" */
        var emptySectors = st.sector.map(function (v) { return D.sectors.filter(function (s) { return slugify(s) === v; })[0]; })
          .filter(function (s) { return s && !AP.some(function (p) { return p.sector === s; }); });
        emptyHeading.textContent = st.sector.length && emptySectors.length === st.sector.length ? emptySectors.join(' and ') + ' projects to follow' : emptyHeadingDefault;
        $('#empty-concept').hidden = !window.WH_PHOTOS;
        $('#empty').hidden = false; moreWrap.hidden = true; return;
      }
      $('#empty').hidden = true;
      list.innerHTML = res.slice(0, shown).map(card).join('');
      moreWrap.hidden = res.length <= shown;
      $('#more-btn').textContent = 'Show more (' + (res.length - shown) + ' remaining)';
    };
    var update = function (push) {
      var st = formState(); shown = PAGE;
      var url = toQuery(st);
      if (push) history.pushState(st, '', url); else history.replaceState(st, '', url);
      render(st);
    };
    var init = readState(); applyStateToForm(init); render(init);
    form.addEventListener('change', function () { update(true); });
    var t; $('#q').addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { update(false); }, 200); });
    form.addEventListener('submit', function (e) { e.preventDefault(); update(true); });
    window.addEventListener('popstate', function () { var st = readState(); applyStateToForm(st); shown = PAGE; render(st); });
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var k = b.getAttribute('data-k'), v = b.getAttribute('data-v');
      if (k === 'q') $('#q').value = ''; else $$('input[name=' + k + ']', form).forEach(function (i) { if (i.value === v) i.checked = false; });
      update(true); countEl.focus();
    });
    var clearAll = function () { form.reset(); $('#q').value = ''; update(true); countEl.focus(); };
    clearBtn.addEventListener('click', clearAll);
    $('#empty-clear').addEventListener('click', clearAll);
    $('#more-btn').addEventListener('click', function () { shown += PAGE; render(formState()); });
    /* Mobile filter sheet */
    var panel = $('.filters'), toggle = $('#filter-toggle');
    var closeSheet = function () { panel.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; toggle.focus(); };
    toggle.addEventListener('click', function () { panel.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; $('input', panel).focus(); });
    $('#sheet-close').addEventListener('click', closeSheet);
    $('#apply').addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) closeSheet(); });
  }

  /* ---------- Case study ---------- */
  var heroPending = false;
  var cs = $('#case-study');
  if (cs) {
    var param = new URLSearchParams(location.search).get('p');
    var slug = param || 'racecourse-ground-kop-stand';
    var studies = D.projects.filter(function (p) { return p.caseStudy; });
    var p = studies.filter(function (x) { return x.slug === slug; })[0] || (param ? null : studies[0]);
    if (!p) {
      /* A ?p= value that matches no case study: show a not-found state, no lightbox */
      document.title = 'Project not found — Willis Hazell Engineers';
      cs.innerHTML = '<div class="wrap page-head"><p class="crumbs"><a href="projects.html">Projects</a></p>' +
        '<h1 class="heading-page">Project not found</h1>' +
        '<p class="body-small" style="margin:16px 0 8px">This case study may have moved or is not yet published.</p>' +
        '<a class="tl" href="projects.html">View all projects →</a></div>';
    } else {
      var idx = studies.indexOf(p), next = studies[(idx + 1) % studies.length];
      document.title = p.name + ' — Willis Hazell Engineers';
      var meta = [['Client', p.client], ['Location', p.location], ['Sector', p.sector], ['Capacity', p.capacity],
                  ['Architect', null], ['Services', null], ['Willis Hazell’s role', null], ['Completion', null]];
      var related = listedProjects.filter(function (x) { return x.sector === p.sector && x.slug !== p.slug; }).slice(0, 6);
      /* Low-resolution images (< 1400px wide) are shown inset beside the title, never stretched full-bleed */
      var inset = p.imageMaxW < 1400;
      var heroHtml = '<div class="cs-hero' + (inset ? ' inset' : '') + '"><button type="button" data-lightbox aria-label="View image full screen: ' + esc(p.name) + '"><div class="frame"' + (inset ? ' style="--native:' + p.imageMaxW + 'px"' : '') + '>' +
          img(p.image, p.imageMaxW, inset ? '(max-width:700px) 100vw, ' + p.imageMaxW + 'px' : '100vw', p.caption.split('. Image')[0], true) + '</div></button>' +
          '<p class="caption' + (inset ? '' : ' wrap') + '" style="margin-top:10px">' + esc(p.caption) + '</p></div>';
      /* Gallery: licensed photos (manifest order) replace the placeholder slots; without photos the slots stay as they were */
      var gal = photosFor(p.slug);
      var galleryHtml = gal
        ? '<div class="photo-gallery">' + gal.map(function (ph, n) {
            var phase = photoPhase(ph);
            return '<figure><button type="button" data-gallery="' + n + '" aria-label="View image full screen: ' + esc(ph.alt) + '"><div class="frame ratio-32">' +
              photoImg(ph, '(max-width:620px) calc(100vw - 32px), (max-width:1100px) 45vw, 240px') + '</div></button>' +
              '<figcaption class="photo-credit">' + (phase ? '<span class="photo-phase">' + phase + '.</span> ' : '') + photoCredit(ph) + '</figcaption></figure>';
          }).join('') + '</div><p class="caption" style="margin-top:14px">Photographs from Wikimedia Commons, used under the licences credited. They show the venue; they are not Willis Hazell photographs and do not confirm its role on the project.</p>'
        : '<div class="gallery-slots"><div class="slot">Construction photograph</div><div class="slot">Structural detail</div><div class="slot">Completed interior</div></div>' +
          '<p class="caption" style="margin-top:10px">Gallery images to be supplied with usage rights.</p>';
      var titleHtml = '<div class="cs-title"><div><p class="crumbs"><a href="projects.html">Projects</a> / <a href="projects.html?sector=' + slugify(p.sector) + '">' + esc(p.sector) + '</a></p>' +
          '<h1 class="heading-page">' + esc(p.name) + '</h1><p class="intro" style="margin-top:16px;max-width:820px">' + esc(p.summary) + '</p></div></div>';
      cs.innerHTML =
        (inset ? '<div class="wrap"><div class="cs-inset">' + titleHtml + heroHtml + '</div>'
               : heroHtml + '<div class="wrap">' + titleHtml) +
          '<div class="credit-banner" role="note"><span class="credit tbc" style="flex:none">Credit to confirm</span><p>Demo content. Before publication this will state either “Willis Hazell Engineers: [role], [stages]” or that the project was delivered by a team member at a previous practice.</p></div>' +
        '<div class="cs-body"><div><h2 class="label" style="margin-bottom:14px">Project facts</h2><dl class="md">' +
          meta.filter(function (m) { return m[1]; }).map(function (m) { return '<div><dt>' + m[0] + '</dt><dd>' + esc(m[1]) + '</dd></div>'; }).join('') +
          '</dl><p class="caption" style="margin-top:12px">Architect, services, role and completion are hidden until supplied.</p>' + csServices(p) + '</div>' +
          '<div class="prose"><h2>Key inputs</h2><ul class="inputs">' + p.keyInputs.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul>' +
          '<h2>The engineering challenge</h2><p class="tbc">[To be written with the project team: the site, structure and constraints that made this project demanding.]</p>' +
          '<h2>Our contribution</h2><p class="tbc">[To be written with the project team: what Willis Hazell designed, decided or changed, with figures where possible.]</p>' +
          '<h2>Gallery</h2>' + galleryHtml + '</div></div>' +
        (related.length ? '<section class="sec-compact" aria-labelledby="rel-h"><div class="sec-head rule-top"><h2 id="rel-h" class="heading-section">More ' + esc(p.sector.toLowerCase()) + '</h2><a class="tl" href="projects.html?sector=' + slugify(p.sector) + '">All ' + esc(p.sector.toLowerCase()) + ' →</a></div>' +
          '<ul class="results" style="padding-top:0">' + related.map(card2).join('') + '</ul></section>' : '') +
        '<a class="next-project" href="' + projectUrl(next) + '"><span class="label">Next case study</span><span class="heading-section">' + esc(next.name) + ' →</span></a></div>';
      function card2(x) {
        if (x.caseStudy) return '<li><a href="' + projectUrl(x) + '"><div class="frame ratio-32">' + img(x.image, x.imageMaxW, '(max-width:620px) 100vw, 33vw', '') + '</div><div class="card-text"><h3 class="title-project">' + esc(x.name) + '</h3>' + creditTag(x) + '</div></a></li>';
        var rText = '<h3 class="title-project">' + esc(x.name) + '</h3>' + (x.detail ? '<p class="body-small">' + esc(x.detail.charAt(0).toUpperCase() + x.detail.slice(1)) + '</p>' : '') + creditTag(x);
        var rph = !x.image && photosFor(x.slug);
        if (rph) return '<li><div class="photo-card"><div class="frame ratio-32">' + photoImg(rph[0], '(max-width:620px) calc(100vw - 32px), (max-width:900px) 45vw, 320px') + '</div>' +
          '<div class="card-text">' + rText + '</div><p class="photo-credit">' + (photoPhase(rph[0]) ? '<span class="photo-phase">' + photoPhase(rph[0]) + '.</span> ' : '') + photoCredit(rph[0]) + '</p></div></li>';
        return '<li><div class="typo-card">' + rText + '</div></li>';
      }
      /* PERF-002: inset hero images have no reserved height, so stay pending until the hero image is ready */
      var heroImg = $('.cs-hero img', cs);
      if (heroImg && !heroImg.complete) {
        heroPending = true;
        var release = function () { document.documentElement.classList.remove('js-pending'); };
        heroImg.addEventListener('load', release); heroImg.addEventListener('error', release); setTimeout(release, 2000);
      }
      /* Lightbox */
      var lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb), lastFocus;
      var showLb = function (src, alt, cap) { lastFocus = document.activeElement; lbImg.src = src; lbImg.alt = alt; lbCap.textContent = cap; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); $('.close', lb).focus(); document.body.style.overflow = 'hidden'; };
      var openLb = function () { showLb('assets/img/' + p.image + '-' + p.imageMaxW + '.webp', p.name, p.caption); };
      var closeLb = function () { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
      $('[data-lightbox]', cs).addEventListener('click', openLb);
      /* Gallery photos open in the same lightbox; the caption carries the phase and the credit */
      $$('[data-gallery]', cs).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var ph = gal[+btn.getAttribute('data-gallery')], phase = photoPhase(ph);
          showLb('assets/img/' + ph.name + '-' + ph.maxW + '.webp', ph.alt, (phase ? phase + '. ' : '') + ph.credit);
        });
      });
      $('.close', lb).addEventListener('click', closeLb);
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
      document.addEventListener('keydown', function (e) { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'Tab') { e.preventDefault(); $('.close', lb).focus(); } });
    }
  }

  /* Featured cards on home, from data */
  $$('[data-project]').forEach(function (el) {
    var p = D.projects.filter(function (x) { return x.slug === el.getAttribute('data-project'); })[0]; if (!p) return;
    el.setAttribute('href', projectUrl(p));
    var f = $('.frame', el); if (f && !f.innerHTML.trim()) f.innerHTML = img(p.image, p.imageMaxW, el.getAttribute('data-sizes') || '50vw', '');
    var c = $('[data-credit]', el); if (c) c.outerHTML = creditTag(p);
  });

  /* ---------- News & Careers (sample editorial collections in js/editorial.js) ---------- */
  var E = window.WH_EDITORIAL || { articles: [], jobs: [], authors: {}, newsCategories: [] };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var fmtDate = function (iso) { var d = String(iso).split('-'); return +d[2] + ' ' + MONTHS[+d[1] - 1] + ' ' + d[0]; };
  var QS = new URLSearchParams(location.search);
  /* "Today" for vacancy logic. ?asof=YYYY-MM-DD previews another date (prototype review aid) */
  var asof = /^\d{4}-\d{2}-\d{2}$/.test(QS.get('asof') || '') ? QS.get('asof') : null;
  var today = asof || (function () { var n = new Date(); return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2); })();
  var sampleTag = '<span class="credit tbc">Sample</span>';
  var articles = E.articles.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  var articleUrl = function (a) { return 'article.html?a=' + encodeURIComponent(a.slug); };
  var catUrl = function (c) { return 'news.html?category=' + slugify(c); };
  var jobState = function (j) {
    if (j.status === 'draft') return 'draft';
    if (j.status === 'closed') return 'closed';
    if (!j.publishAt || j.publishAt > today) return 'scheduled';
    if (j.closing && j.closing < today) return 'expired';
    return 'open';
  };
  var openJobs = E.jobs.filter(function (j) { return jobState(j) === 'open'; })
    .sort(function (a, b) { return a.closing < b.closing ? -1 : 1; });
  var jobUrl = function (j) { return 'job.html?r=' + encodeURIComponent(j.slug) + (asof ? '&asof=' + asof : ''); };
  var articleFrame = function (a, ratio, sizes, eager) {
    if (a.image) return '<div class="frame ' + ratio + '">' + img(a.image.name, a.image.maxW, sizes, '', eager) + '</div>';
    return '<div class="frame ' + ratio + ' slot-frame"><span>Image to be supplied</span></div>';
  };
  var richText = function (blocks) {
    return (blocks || []).map(function (b) {
      if (b[0] === 'h2') return '<h2>' + esc(b[1]) + '</h2>';
      if (b[0] === 'ph') return '<p class="tbc">' + esc(b[1]) + '</p>';
      if (b[0] === 'figure') return '<figure class="slot article-figure">' + esc(b[1]) + '</figure>';
      return '<p>' + esc(b[1]) + '</p>';
    }).join('');
  };
  var setMeta = function (title, desc) {
    document.title = title + ' — Willis Hazell Engineers';
    var m = $('meta[name="description"]'); if (m && desc) m.setAttribute('content', desc);
  };
  var jsonLd = function (obj) {
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(obj); document.head.appendChild(s);
  };
  var notFound = function (el, crumbHref, crumb, h, text, linkText) {
    setMeta(h, text);
    el.innerHTML = '<div class="wrap page-head"><p class="crumbs"><a href="' + crumbHref + '">' + crumb + '</a></p>' +
      '<h1 class="heading-page">' + h + '</h1><p class="body-small" style="margin:16px 0 8px">' + text + '</p>' +
      '<a class="tl" href="' + crumbHref + '">' + linkText + ' →</a></div>';
  };

  /* Home: three most recent articles; careers prompt only while a role is open */
  var homeNews = $('#home-news');
  if (homeNews) {
    homeNews.innerHTML = articles.slice(0, 3).map(function (a) {
      return '<li><a href="' + articleUrl(a) + '">' + articleFrame(a, 'ratio-32', '(max-width:760px) 100vw, 30vw') +
        '<div class="card-text"><p class="label">' + esc(a.category) + ' · ' + fmtDate(a.date) + '</p><h3 class="title-project">' + esc(a.title) + '</h3>' + sampleTag + '</div></a></li>';
    }).join('');
    var hc = $('#home-careers');
    if (hc && openJobs.length) {
      hc.innerHTML = '<p class="label">Careers</p><p class="title-project">We are recruiting: ' + openJobs.map(function (j) { return esc(j.title); }).join(', ') + '.</p>' + sampleTag + '<a class="tl" href="careers.html">View vacancies →</a>';
      hc.hidden = false;
    }
  }

  /* News index: featured story, category filter in the query string, show more */
  var newsList = $('#news-list');
  if (newsList) {
    var NEWS_PAGE = 8, newsShown = NEWS_PAGE;
    var cats = E.newsCategories;
    var readCat = function () { var c = new URLSearchParams(location.search).get('category'); return cats.filter(function (x) { return slugify(x) === c; })[0] || null; };
    var newsRow = function (a) {
      return '<li><a class="news-row" href="' + articleUrl(a) + '">' + articleFrame(a, 'ratio-32', '(max-width:620px) 100vw, 240px') +
        '<div><p class="label">' + esc(a.category) + ' · <time datetime="' + a.date + '">' + fmtDate(a.date) + '</time></p>' +
        '<h3 class="title-project">' + esc(a.title) + '</h3><p class="body-small">' + esc(a.summary) + '</p>' + sampleTag + '</div></a></li>';
    };
    var renderNews = function () {
      var cat = readCat();
      $$('.cats a').forEach(function (l) {
        var c = new URL(l.href).searchParams.get('category');
        if ((cat ? slugify(cat) : null) === c) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current');
      });
      setMeta(cat ? cat + ' — News' : 'News & Insights', cat ? cat + ' from Willis Hazell Engineers.' : null);
      var list = cat ? articles.filter(function (a) { return a.category === cat; }) : articles;
      var feat = !cat ? (list.filter(function (a) { return a.featured; })[0] || list[0]) : null;
      $('#news-featured').innerHTML = feat ? '<a class="news-feature" href="' + articleUrl(feat) + '">' + articleFrame(feat, 'ratio-32', '(max-width:900px) 100vw, 58vw', true) +
        '<div><p class="label">Featured · ' + esc(feat.category) + '</p><h2 class="heading-section">' + esc(feat.title) + '</h2>' +
        '<p class="body-small">' + esc(feat.summary) + '</p><p class="caption"><time datetime="' + feat.date + '">' + fmtDate(feat.date) + '</time> · ' + esc((E.authors[feat.author] || {}).name || '') + '</p>' + sampleTag + '</div></a>' : '';
      var rest = list.filter(function (a) { return a !== feat; });
      newsList.innerHTML = rest.slice(0, newsShown).map(newsRow).join('');
      $('#news-empty').hidden = list.length > 0;
      $('#news-more').hidden = rest.length <= newsShown;
      $('#news-more-btn').textContent = 'Show more (' + (rest.length - newsShown) + ' remaining)';
      $('#news-count').textContent = list.length + (list.length === 1 ? ' article' : ' articles') + (cat ? ' in ' + cat : '');
    };
    $('.cats').addEventListener('click', function (e) {
      var l = e.target.closest('a'); if (!l || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); history.pushState(null, '', l.getAttribute('href')); newsShown = NEWS_PAGE; renderNews();
    });
    window.addEventListener('popstate', function () { newsShown = NEWS_PAGE; renderNews(); });
    $('#news-more-btn').addEventListener('click', function () { newsShown += NEWS_PAGE; renderNews(); });
    renderNews();
  }

  /* Article template */
  var art = $('#article');
  if (art) {
    var a = articles.filter(function (x) { return x.slug === QS.get('a'); })[0];
    if (!a) notFound(art, 'news.html', 'News', 'Article not found', 'This article may have moved or is not yet published.', 'View all news');
    else {
      setMeta(a.title, a.summary);
      var au = E.authors[a.author] || { name: '', url: 'about.html' };
      var here = location.href.split('#')[0];
      var relP = (a.relatedProjects || []).map(function (s) { return D.projects.filter(function (p) { return p.slug === s; })[0]; }).filter(Boolean);
      var relA = articles.filter(function (x) { return x !== a && x.category === a.category; })
        .concat(articles.filter(function (x) { return x !== a && x.category !== a.category; })).slice(0, 3);
      art.innerHTML =
        '<div class="wrap article-head"><p class="crumbs"><a href="news.html">News</a> / <a href="' + catUrl(a.category) + '">' + esc(a.category) + '</a></p>' +
          '<h1 class="heading-page">' + esc(a.title) + '</h1><p class="intro">' + esc(a.summary) + '</p>' +
          '<p class="article-meta"><time datetime="' + a.date + '">' + fmtDate(a.date) + '</time><span>By <a class="inline-link" href="' + au.url + '">' + esc(au.name) + '</a></span>' + sampleTag + '</p></div>' +
        '<div class="wrap article-hero">' + (a.image
          ? '<figure>' + articleFrame(a, 'ratio-169', '(max-width:1440px) 100vw, 1312px', true) + '<figcaption class="caption">' + esc(a.image.alt) + '. Image from willishazell.com; credit to confirm.</figcaption></figure>'
          : '<div class="frame ratio-219 slot-frame"><span>Hero image to be supplied</span></div>') + '</div>' +
        '<div class="wrap article-body"><aside class="article-aside">' +
          '<div class="author-card"><p class="label">Author</p><p><a class="inline-link" href="' + au.url + '">' + esc(au.name) + '</a><br><span class="body-small">' + esc(au.role || '') + '</span></p></div>' +
          '<div class="share"><p class="label">Share</p><ul>' +
            '<li><a href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(here) + '" target="_blank" rel="noopener">LinkedIn<span class="visually-hidden"> (opens in a new tab)</span></a></li>' +
            '<li><a href="mailto:?subject=' + encodeURIComponent(a.title) + '&amp;body=' + encodeURIComponent(here) + '">Email</a></li>' +
            '<li><button type="button" id="copy-link">Copy link</button> <span class="caption" role="status" id="copy-status"></span></li></ul>' +
            (a.linkedin ? '<p><a class="inline-link" href="' + esc(a.linkedin) + '">View the LinkedIn post</a></p>' : '') + '</div>' +
        '</aside><div class="prose article-prose">' + richText(a.body) + '</div></div>' +
        (relP.length ? '<section class="wrap sec-compact" aria-labelledby="relp-h"><div class="sec-head rule-top"><h2 class="heading-section" id="relp-h">Related projects</h2></div>' +
          '<ul class="results" style="padding-top:0">' + relP.map(function (p) {
            return '<li><a href="' + projectUrl(p) + '"><div class="frame ratio-32">' + img(p.image, p.imageMaxW, '(max-width:620px) 100vw, 33vw', '') + '</div><div class="card-text"><h3 class="title-project">' + esc(p.name) + '</h3>' + creditTag(p) + '</div></a></li>';
          }).join('') + '</ul></section>' : '') +
        (relA.length ? '<section class="wrap sec-compact" style="padding-top:0" aria-labelledby="rela-h"><div class="sec-head rule-top"><h2 class="heading-section" id="rela-h">More news</h2><a class="tl" href="news.html">All news →</a></div>' +
          '<ul class="news-list">' + relA.map(function (x) {
            return '<li><a class="news-row" href="' + articleUrl(x) + '">' + articleFrame(x, 'ratio-32', '(max-width:620px) 100vw, 240px') + '<div><p class="label">' + esc(x.category) + ' · ' + fmtDate(x.date) + '</p><h3 class="title-project">' + esc(x.title) + '</h3>' + sampleTag + '</div></a></li>';
          }).join('') + '</ul></section>' : '');
      var copyBtn = $('#copy-link'), copyStatus = $('#copy-status');
      copyBtn.addEventListener('click', function () {
        var done = function (ok) { copyStatus.textContent = ok ? 'Link copied' : 'Copy failed: ' + here; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(here).then(function () { done(true); }, function () { done(false); });
        else done(false);
      });
      jsonLd({ '@context': 'https://schema.org', '@type': 'NewsArticle', headline: a.title, datePublished: a.date, description: a.summary,
        author: { '@type': 'Person', name: au.name }, publisher: { '@type': 'Organization', name: 'Willis Hazell Engineers' } });
    }
  }

  /* Careers: open vacancies only (published, publication date reached, closing date not passed) */
  var vacList = $('#vacancies');
  if (vacList) {
    vacList.innerHTML = openJobs.map(function (j) {
      return '<li><a class="vac" href="' + jobUrl(j) + '"><h3 class="title-project">' + esc(j.title) + '</h3>' +
        '<p class="vac-meta"><span>' + esc(j.location) + '</span><span>' + esc(j.type) + '</span><span>Closes <time datetime="' + j.closing + '">' + fmtDate(j.closing) + '</time></span></p>' +
        '<p class="body-small">' + esc(j.summary) + '</p><span class="vac-go">View role →</span>' + sampleTag + '</a></li>';
    }).join('');
    $('#vac-count').textContent = (openJobs.length ? openJobs.length + (openJobs.length === 1 ? ' open role' : ' open roles') : 'No open roles') + (asof ? ' · previewing ' + fmtDate(asof) : '');
    $('#vac-empty').hidden = openJobs.length > 0;
  }

  /* Job details + application form */
  var jobEl = $('#job');
  if (jobEl) {
    var j = E.jobs.filter(function (x) { return x.slug === QS.get('r'); })[0];
    var js = j ? jobState(j) : null;
    if (!j || js === 'draft' || js === 'scheduled') notFound(jobEl, 'careers.html', 'Careers', 'Vacancy not found', 'This role is not available. It may not be published yet, or the address may be wrong.', 'View open vacancies');
    else if (js === 'expired' || js === 'closed') {
      setMeta(j.title + ' (closed)', 'This vacancy has closed.');
      jobEl.innerHTML = '<div class="wrap page-head"><p class="crumbs"><a href="careers.html">Careers</a></p><h1 class="heading-page">' + esc(j.title) + '</h1>' +
        '<p class="intro" style="margin-top:16px">This vacancy has closed' + (j.closing ? ' (closing date ' + fmtDate(j.closing) + ')' : '') + '.</p>' +
        '<p class="body-small" style="margin:16px 0 8px">Applications are no longer being accepted for this role.</p><a class="tl" href="careers.html">View open vacancies →</a></div>';
    } else {
      setMeta(j.title, j.summary);
      var facts = [['Location', j.location], ['Employment type', j.type], ['Salary', j.salary], ['Closing date', fmtDate(j.closing)]];
      jobEl.innerHTML =
        '<div class="wrap page-head"><p class="crumbs"><a href="careers.html">Careers</a></p><h1 class="heading-page">' + esc(j.title) + '</h1>' +
          '<p class="intro">' + esc(j.summary) + '</p><p style="margin-top:20px">' + sampleTag + '</p></div>' +
        '<div class="wrap cs-body" style="padding-top:0"><div><h2 class="label" style="margin-bottom:14px">Role details</h2><dl class="md">' +
          facts.filter(function (f) { return f[1]; }).map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') +
          '</dl><p style="margin-top:24px"><a class="btn" href="#apply-h" style="display:inline-flex;align-items:center;text-decoration:none">Apply for this role</a></p></div>' +
          '<div class="prose"><h2>About the role</h2>' + richText(j.description) +
          '<h2>Requirements</h2>' + (j.requirements.length ? '<ul class="inputs" style="columns:1">' + j.requirements.map(function (r) { return '<li class="tbc-text">' + esc(r) + '</li>'; }).join('') + '</ul>' : '<p class="tbc">[Requirements to be supplied.]</p>') +
          '<h2>Benefits</h2>' + (j.benefits ? '<p>' + esc(j.benefits) + '</p>' : '<p class="tbc">[Benefits to be supplied by Willis Hazell.]</p>') +
          '<h2>How to apply</h2><p>' + esc(j.howToApply) + '</p></div></div>' +
        '<section class="wrap sec-compact apply" aria-labelledby="apply-h" style="padding-top:0"><div class="rule-top" style="padding-top:28px"><h2 class="heading-section" id="apply-h" tabindex="-1">Apply for this role</h2>' +
          '<p class="credit-note">Prototype: nothing is sent or stored. In production the form posts to [form service to confirm] and notifies [recipient to confirm]; applications are kept for [retention period to confirm].</p>' +
          '<div id="apply-wrap"><form id="apply-form" class="form" novalidate>' +
            '<div class="error-summary" id="err-summary" tabindex="-1" hidden><h3>There is a problem</h3><ul></ul></div>' +
            field('ap-name', 'Full name', '<input id="ap-name" name="name" type="text" autocomplete="name" required>') +
            field('ap-email', 'Email', '<input id="ap-email" name="email" type="email" autocomplete="email" required>') +
            field('ap-phone', 'Phone', '<input id="ap-phone" name="phone" type="tel" autocomplete="tel" required>') +
            field('ap-role', 'Role', '<input id="ap-role" name="role" type="text" readonly value="' + esc(j.title) + '">') +
            field('ap-cv', 'CV', '<input id="ap-cv" name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required>', 'PDF or Word document, up to 10MB.') +
            field('ap-note', 'Cover note (optional)', '<textarea id="ap-note" name="note" rows="6"></textarea>') +
            '<div class="field" id="f-ap-consent"><label class="check"><input id="ap-consent" name="consent" type="checkbox" required aria-describedby="ap-consent-err"> I agree to Willis Hazell Engineers processing my application under its privacy notice [to follow].</label><p class="field-error" id="ap-consent-err" hidden></p></div>' +
            '<button class="btn" type="submit">Send application</button>' +
          '</form></div></div></section>';
      jsonLd({ '@context': 'https://schema.org', '@type': 'JobPosting', title: j.title, description: j.summary, datePosted: j.publishAt, validThrough: j.closing,
        employmentType: 'FULL_TIME', hiringOrganization: { '@type': 'Organization', name: 'Willis Hazell Engineers', sameAs: 'https://www.willishazell.com/' } });

      var formEl = $('#apply-form'), summary = $('#err-summary');
      var MAX = 10 * 1024 * 1024, OK_EXT = /\.(pdf|docx?)$/i;
      var setErr = function (id, msg) {
        var input = $('#' + id), e = $('#' + id + '-err');
        e.textContent = msg || ''; e.hidden = !msg;
        if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      };
      formEl.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var errs = [];
        var check = function (id, msg) { setErr(id, msg); if (msg) errs.push([id, msg]); };
        var v = function (id) { return $('#' + id).value.trim(); };
        check('ap-name', v('ap-name') ? '' : 'Enter your full name');
        check('ap-email', !v('ap-email') ? 'Enter your email address' : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('ap-email')) ? '' : 'Enter an email address in the correct format, like name@example.com'));
        check('ap-phone', !v('ap-phone') ? 'Enter your phone number' : (/^[+()\d\s-]{7,}$/.test(v('ap-phone')) ? '' : 'Enter a phone number, like 07700 900 123'));
        var file = $('#ap-cv').files[0];
        check('ap-cv', !file ? 'Attach your CV' : !OK_EXT.test(file.name) ? 'Your CV must be a PDF or Word document' : file.size > MAX ? 'Your CV must be 10MB or smaller' : '');
        check('ap-consent', $('#ap-consent').checked ? '' : 'Confirm that you agree to the privacy notice');
        if (errs.length) {
          $('ul', summary).innerHTML = errs.map(function (x) { return '<li><a href="#' + x[0] + '">' + esc(x[1]) + '</a></li>'; }).join('');
          summary.hidden = false; summary.focus(); return;
        }
        summary.hidden = true;
        $('#apply-wrap').innerHTML = '<div class="success" role="status"><h3 class="title-project" id="ap-done" tabindex="-1">Application received</h3>' +
          '<p class="body-small">Thank you. In production you would receive a confirmation email at ' + esc(v('ap-email')) + ', and the team would be notified.</p>' +
          '<p class="caption">Prototype: nothing was sent or stored.</p><a class="tl" href="careers.html">Back to careers →</a></div>';
        $('#ap-done').focus();
      });
      summary.addEventListener('click', function (e) { var l = e.target.closest('a'); if (!l) return; e.preventDefault(); $(l.getAttribute('href')).focus(); });
    }
  }
  function field(id, label, control, hint) {
    return '<div class="field" id="f-' + id + '"><label for="' + id + '">' + label + '</label>' +
      (hint ? '<p class="hint" id="' + id + '-hint">' + hint + '</p>' : '') +
      '<p class="field-error" id="' + id + '-err" hidden></p>' + control.replace('<input ', '<input aria-describedby="' + (hint ? id + '-hint ' : '') + id + '-err" ').replace('<textarea ', '<textarea aria-describedby="' + id + '-err" ') + '</div>';
  }

  /* ---------- Services (js/services.js) ---------- */
  var SVC = window.WH_SERVICES || { principles: [], services: [] };
  /* Only published records exist as far as the site is concerned (drafts such as an unconfirmed service stay hidden) */
  var services = SVC.services.filter(function (s) { return s.status === 'published'; })
    .sort(function (a, b) { return a.order - b.order; });
  var svcBySlug = function (slug) { return services.filter(function (s) { return s.slug === slug; })[0]; };
  var svcUrl = function (s) { return 'service.html?s=' + encodeURIComponent(s.slug); };
  /* Images narrower than 1000px are shown at native size or smaller, never stretched (DESIGN-003 logic) */
  var svcFigure = function (s, sizes, eager, ratio) {
    var i = s.image; if (!i) return '';
    var native = i.maxW < 1000;
    return '<figure class="svc-fig' + (native ? ' svc-native" style="--native:' + i.maxW + 'px' : '') + '">' +
      '<div class="frame"' + (native ? ' style="aspect-ratio:' + i.w + '/' + i.h + ';background:none"' : (ratio ? ' style="aspect-ratio:' + ratio + '"' : '')) + '>' +
      img(i.name, i.maxW, native ? '(max-width:900px) 100vw, ' + i.maxW + 'px' : sizes, i.alt, eager) + '</div>' +
      '<figcaption class="caption">' + esc(i.credit) + '</figcaption></figure>';
  };
  var principlesHtml = function (head, id) {
    return '<section class="sec-compact wrap" aria-labelledby="' + id + '"><div class="sec-head" style="padding-top:0"><h2 class="heading-section" id="' + id + '">' + head + '</h2><a class="tl" href="about.html">How we work →</a></div>' +
      '<ol class="svc-principles">' + SVC.principles.map(function (p, n) {
        return '<li><p class="svc-num">0' + (n + 1) + '</p><h3>' + esc(p.title) + '</h3><p class="body-small">' + esc(p.text) + '</p></li>';
      }).join('') + '</ol></section>';
  };
  var contactBand = function (h, subject) {
    var q = subject ? '?subject=' + encodeURIComponent(subject) : '';
    return '<section class="on-dark sec" aria-labelledby="svc-contact-h"><div class="wrap contact-band">' +
      '<h2 class="display-hero svc-contact-h" id="svc-contact-h">' + h + '</h2><div class="people-contacts">' +
      '<p><strong style="font-weight:500">Martin Willis</strong><br><a href="tel:+447825362748">07825 362 748</a><br><a href="mailto:Martin@willishazell.com' + q + '">Martin@willishazell.com</a></p>' +
      '<p><strong style="font-weight:500">Rob Hazell</strong><br><a href="tel:+447786440846">07786 440 846</a><br><a href="mailto:Rob@willishazell.com' + q + '">Rob@willishazell.com</a></p>' +
      '</div></div></section>';
  };

  /* SERV-009a: project cards reuse the archive card; evidence lists the key inputs that link the project to the service */
  var svcCard = function (p, evidence) {
    return '<li><a href="' + projectUrl(p) + '"><div class="frame ratio-32">' + img(p.image, p.imageMaxW, '(max-width:620px) 100vw, (max-width:900px) 50vw, 33vw', '') + '</div>' +
      '<div class="card-text"><h3 class="title-project">' + esc(p.name) + '</h3><p class="label">' + esc(p.sector) + ' · ' + esc(p.location) + '</p>' +
      (evidence ? '<p class="svc-evid">Listed inputs: ' + esc(evidence.join(', ')) + '</p>' : '') + creditTag(p) + '</div></a></li>';
  };
  var projBySlug = function (slug) { return D.projects.filter(function (p) { return p.slug === slug; })[0]; };

  /* Services overview: services.html (layout C, directory) and services-alt.html (layout A, editorial index).
     Both render from the same records; sections are filled in by renderOverviewExtras (sectors, projects). */
  var ov = $('#svc-overview');
  if (ov) {
    var layout = ov.getAttribute('data-layout');
    var capsList = function (s, cls) { return '<ul class="' + cls + '">' + s.capabilities.map(function (c) { return '<li>' + esc(c.title) + '</li>'; }).join('') + '</ul>'; };
    var main = '';
    if (layout === 'c') {
      var first = services[0] && services[0].image;
      main = '<section class="wrap sec-compact" style="padding-top:0" aria-label="Service directory"><div class="c-index"><ul class="c-list">' +
        services.map(function (s, n) {
          var i = s.image;
          return '<li class="c-item"' + (i ? ' data-img="' + i.name + '-' + i.maxW + '" data-alt="' + esc(i.alt) + '" data-cap="' + esc(i.credit) + '"' : '') + '>' +
            (i ? '<div class="c-thumb"><div class="frame">' + img(i.name, i.maxW, '(max-width:900px) 100vw, 1px', '', false) + '</div></div>' : '') +
            '<p class="svc-num">0' + (n + 1) + '</p><h2 class="c-title"><a href="' + svcUrl(s) + '">' + esc(s.name) + '</a></h2><span class="c-go" aria-hidden="true">→</span>' +
            '<p class="c-sum">' + esc(s.summary) + '</p>' + capsList(s, 'c-caps') + '</li>';
        }).join('') + '</ul>' +
        (first ? '<figure class="c-photo"><div class="frame">' + img(first.name, first.maxW, '(max-width:900px) 1px, 36vw', first.alt, true) + '</div><figcaption class="caption" id="c-photo-cap">' + esc(first.credit) + '</figcaption></figure>' : '') +
        '</div></section>';
    } else {
      main = services.map(function (s, n) {
        return '<section class="wrap" aria-labelledby="a-' + s.slug + '"><div class="a-svc' + (n % 2 ? ' flip' : '') + '">' +
          '<div class="a-text"><p class="svc-num">0' + (n + 1) + '</p><h2 class="heading-section" id="a-' + s.slug + '"><a href="' + svcUrl(s) + '">' + esc(s.name) + '</a></h2>' +
          '<p class="a-sum">' + esc(s.summary) + '</p>' + capsList(s, 'a-caps') + '<p><a class="tl" href="' + svcUrl(s) + '">' + esc(s.name) + ' →</a></p></div>' +
          '<div class="a-media">' + svcFigure(s, '(max-width:900px) 100vw, 50vw', n === 0, '4/3') + '</div></div></section>';
      }).join('');
    }
    ov.innerHTML = main + principlesHtml('How the disciplines work together', 'svc-pr-h') +
      '<div id="svc-ov-extra"></div>' + contactBand('Talk to us early about your venue.');
    /* SERV-008: where the services apply. A mark only where a case study's key inputs show the service in that sector */
    var ovExtra = $('#svc-ov-extra');
    var secNames = (D.sectors || []).filter(function (x) { return x !== 'Other'; });
    ovExtra.insertAdjacentHTML('beforeend', '<section class="sec-compact wrap" style="padding-top:0" aria-labelledby="svc-mx-h"><div class="sec-head rule-top"><h2 class="heading-section" id="svc-mx-h">Where our services apply</h2></div>' +
      '<table class="svc-matrix"><caption class="caption">“Listed” means the current willishazell.com case studies list inputs from that service on a project in that sector. Project credits are being confirmed.</caption>' +
      '<thead><tr><th scope="col">Sector</th>' + services.map(function (s) { return '<th scope="col"><a href="' + svcUrl(s) + '">' + esc(s.name) + '</a></th>'; }).join('') + '</tr></thead><tbody>' +
      secNames.map(function (x) {
        var any = services.some(function (s) { return (s.sectors || []).indexOf(x) > -1; });
        var cells = any ? services.map(function (s) {
          return '<td data-h="' + esc(s.name) + '">' + ((s.sectors || []).indexOf(x) > -1 ? '<span class="svc-mark">Listed</span>' : '<span class="svc-nomark"><span aria-hidden="true">—</span><span class="visually-hidden">Not listed</span></span>') + '</td>';
        }).join('') : '<td colspan="' + services.length + '" data-h="All services"><span class="svc-nomark">Relationships to be confirmed with Willis Hazell</span></td>';
        return '<tr><th scope="row"><a href="projects.html?sector=' + slugify(x) + '">' + esc(x) + '</a></th>' + cells + '</tr>';
      }).join('') + '</tbody></table></section>');

    var sel = (SVC.selected || []).map(projBySlug).filter(Boolean);
    if (sel.length) ovExtra.insertAdjacentHTML('beforeend', '<section class="sec-compact wrap" style="padding-top:0" aria-labelledby="svc-sel-h"><div class="sec-head rule-top"><h2 class="heading-section" id="svc-sel-h">Selected case studies</h2><a class="tl" href="projects.html">All projects →</a></div>' +
      '<ul class="results svc-three" style="padding-top:0">' + sel.map(function (p) { return svcCard(p); }).join('') + '</ul></section>');

    /* Layout C: the photograph beside the directory follows the hovered or focused service (as the homepage Sectors band) */
    var photo = $('.c-photo img'), photoCap = $('#c-photo-cap');
    if (photo) $$('.c-item[data-img]').forEach(function (li) {
      var show = function () {
        if (photo.getAttribute('data-cur') === li.getAttribute('data-img')) return;
        photo.setAttribute('data-cur', li.getAttribute('data-img'));
        photo.removeAttribute('srcset'); photo.removeAttribute('sizes');
        photo.src = 'assets/img/' + li.getAttribute('data-img') + '.webp'; photo.alt = li.getAttribute('data-alt');
        photoCap.textContent = li.getAttribute('data-cap');
      };
      li.addEventListener('mouseenter', show); li.addEventListener('focusin', show);
    });
  }

  /* Service template: service.html?s=<slug> */
  var svcEl = $('#service');
  if (svcEl) {
    var sv = svcBySlug(QS.get('s'));
    if (!sv) notFound(svcEl, 'services.html', 'Services', 'Service not found', 'This service page may have moved or is not published.', 'View all services');
    else {
      /* SERV-011: per-service SEO title and description from the record's editable seo fields */
      setMeta(sv.seo && sv.seo.title || sv.name, sv.seo && sv.seo.description || sv.summary);
      var rel = (sv.related || []).map(svcBySlug).filter(Boolean);
      var glance = [];
      /* SERV-008: sectors link to the filtered Projects archive until sector landing pages exist */
      if (sv.sectors && sv.sectors.length) glance.push(['Sectors', sv.sectors.map(function (x) { return '<a href="projects.html?sector=' + slugify(x) + '">' + esc(x) + '</a>'; }).join(' · ')]);
      if (rel.length) glance.push(['Related services', rel.map(function (r) { return '<a href="' + svcUrl(r) + '">' + esc(r.name) + '</a>'; }).join(' · ')]);
      glance.push(['Contact', '<a href="#svc-contact-h">Martin Willis · Rob Hazell</a>']);
      var caps = sv.capabilities.map(function (c, n) {
        var link = c.service && svcBySlug(c.service);
        return '<li><span class="svc-num">' + ('0' + (n + 1)).slice(-2) + '</span><span class="t">' +
          (link ? '<a href="' + svcUrl(link) + '">' + esc(c.title) + ' →</a><span class="x">See ' + esc(link.name) + '</span>' : esc(c.title)) + '</span></li>';
      }).join('');
      svcEl.innerHTML =
        '<div class="wrap s-open"><div><p class="crumbs"><a href="services.html">Services</a></p><h1 class="heading-page">' + esc(sv.name) + '</h1>' +
          '<p class="intro">' + esc(sv.summary) + '</p></div>' + svcFigure(sv, '(max-width:900px) 100vw, 40vw', true, '4/3') + '</div>' +
        '<div class="wrap s-body"><div><h2 class="label" style="margin-bottom:14px">At a glance</h2><dl class="md" id="svc-glance">' +
          glance.map(function (g) { return '<div><dt>' + g[0] + '</dt><dd>' + g[1] + '</dd></div>'; }).join('') + '</dl></div>' +
          '<div class="prose"><h2>About the service</h2>' + richText(sv.intro) + '</div></div>' +
        '<section class="sec-compact wrap" style="padding-top:0" aria-labelledby="svc-cap-h"><div class="sec-head" style="padding-top:0"><h2 class="heading-section" id="svc-cap-h">What the service includes</h2>' +
          '<p class="caption" style="margin:0">' + esc(sv.capsSource || 'As listed on willishazell.com') + '</p></div><ol class="s-caps">' + caps + '</ol></section>' +
        (sv.topics ? '<section class="sec-compact wrap" style="padding-top:0" aria-labelledby="svc-top-h"><div class="sec-head rule-top"><h2 class="heading-section" id="svc-top-h">What the service covers</h2></div><div class="rows" style="border-top:0">' +
          sv.topics.map(function (t) { return '<div class="row"><h3 class="title-project">' + esc(t.title) + '</h3><p class="body-small tbc-text" style="margin:0">' + esc(t.text) + '</p></div>'; }).join('') + '</div></section>' : '') +
        principlesHtml('Our approach', 'svc-appr-h') +
        '<div id="svc-extra"></div>' +
        (rel.length ? '<section class="sec-compact wrap" style="padding-top:0" aria-labelledby="svc-rel-h"><h2 class="label" id="svc-rel-h" style="margin-bottom:16px">Related services</h2><ul class="rel-svcs">' +
          rel.map(function (r) { return '<li><a href="' + svcUrl(r) + '">' + esc(r.name) + '<span>' + esc(r.summary) + '</span></a></li>'; }).join('') + '</ul></section>' : '') +
        contactBand('Talk to Martin or Rob about ' + esc(sv.name.toLowerCase().replace('&', 'and')) + '.', sv.name.replace('&', 'and') + ' enquiry');
      var extra = $('#svc-extra');
      var rp = (sv.projects || []).map(function (x) { var p = projBySlug(x.slug); return p && { p: p, ev: x.evidence }; }).filter(Boolean);
      if (rp.length) extra.insertAdjacentHTML('beforeend', '<section class="sec-compact wrap" style="padding-top:0" aria-labelledby="svc-rp-h"><div class="sec-head rule-top"><h2 class="heading-section" id="svc-rp-h">Related projects</h2><a class="tl" href="projects.html">All projects →</a></div>' +
        '<p class="credit-note" style="margin:0 0 8px">Case studies where the current website lists inputs from this service. Willis Hazell’s role on each project is being confirmed.</p>' +
        '<ul class="results svc-three">' + rp.map(function (x) { return svcCard(x.p, x.ev); }).join('') + '</ul></section>');
      /* Related insight: a linked News article (sample articles keep their Sample tag) */
      var insight = sv.article && articles.filter(function (x) { return x.slug === sv.article; })[0];
      if (insight) extra.insertAdjacentHTML('beforeend', '<section class="sec-compact wrap" style="padding-top:0" aria-labelledby="svc-ins-h"><div class="sec-head rule-top"><h2 class="heading-section" id="svc-ins-h">Related insight</h2><a class="tl" href="' + catUrl(insight.category) + '">All ' + esc(insight.category.toLowerCase()) + ' →</a></div>' +
        '<ul class="news-list"><li><a class="news-row" href="' + articleUrl(insight) + '">' + articleFrame(insight, 'ratio-32', '(max-width:620px) 100vw, 240px') +
        '<div><p class="label">' + esc(insight.category) + ' · <time datetime="' + insight.date + '">' + fmtDate(insight.date) + '</time></p><h3 class="title-project">' + esc(insight.title) + '</h3><p class="body-small">' + esc(insight.summary) + '</p>' + sampleTag + '</div></a></li></ul></section>');
    }
  }

  /* PERF-002: rendering done; release the space and visibility held while the page was pending */
  if (!heroPending) document.documentElement.classList.remove('js-pending');
})();
