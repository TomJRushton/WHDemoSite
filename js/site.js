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
  function creditTag(p) {
    if (p.credit === 'willis-hazell') return '<span class="credit wh">Willis Hazell</span>';
    if (p.credit === 'experience') return '<span class="credit">Team experience</span>';
    return '<span class="credit tbc">Credit to confirm</span>';
  }
  function projectUrl(p) { return 'project.html?p=' + encodeURIComponent(p.slug); }

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
    if (btn) btn.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && header.classList.contains('menu-open')) btn.click(); });
  }

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
    var n = D.projects.filter(function (p) { return p.sector === el.getAttribute('data-sector-count'); }).length;
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
    var sectorsInUse = D.sectors.filter(function (s) { return D.projects.some(function (p) { return p.sector === s; }); });
    var TYPES = [{ id: 'case-studies', label: 'Case studies', test: function (p) { return p.caseStudy; } },
                 { id: 'experience-list', label: 'Experience list', test: function (p) { return !p.caseStudy; } }];

    $('#opt-sector').innerHTML = sectorsInUse.map(function (s) {
      var n = D.projects.filter(function (p) { return p.sector === s; }).length;
      return '<label class="opt"><input type="checkbox" name="sector" value="' + slugify(s) + '"> ' + esc(s) + ' <span class="n">(' + n + ')</span></label>';
    }).join('');
    $('#opt-type').innerHTML = TYPES.map(function (t) {
      var n = D.projects.filter(t.test).length;
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
      return '<li><div class="typo-card"><p class="label">' + esc(p.sector) + '</p><h3 class="title-project">' + esc(p.name) + '</h3>' +
        (p.detail ? '<p class="body-small">' + esc(p.detail.charAt(0).toUpperCase() + p.detail.slice(1)) + '</p>' : '') + creditTag(p) + '</div></li>';
    };
    var render = function (st) {
      var res = D.projects.filter(function (p) { return matches(p, st); });
      res.sort(function (a, b) { return (b.caseStudy ? 1 : 0) - (a.caseStudy ? 1 : 0); });
      countEl.textContent = res.length + (res.length === 1 ? ' project' : ' projects');
      var tags = [];
      st.sector.forEach(function (v) { tags.push({ k: 'sector', v: v, l: (sectorsInUse.filter(function (s) { return slugify(s) === v; })[0] || v) }); });
      st.type.forEach(function (v) { tags.push({ k: 'type', v: v, l: (TYPES.filter(function (t) { return t.id === v; })[0] || { label: v }).label }); });
      if (st.q) tags.push({ k: 'q', v: st.q, l: '“' + st.q + '”' });
      chips.innerHTML = tags.map(function (t) { return '<span class="chip">' + esc(t.l) + '<button type="button" data-k="' + t.k + '" data-v="' + esc(t.v) + '" aria-label="Remove filter: ' + esc(t.l) + '">×</button></span>'; }).join('');
      clearBtn.hidden = !tags.length;
      var toggleCount = $('#filter-count'); if (toggleCount) toggleCount.textContent = tags.length ? ' (' + tags.length + ')' : '';
      var applyBtn = $('#apply'); if (applyBtn) applyBtn.textContent = 'Show ' + res.length + ' projects';
      if (!res.length) {
        list.innerHTML = '';
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
      var related = D.projects.filter(function (x) { return x.sector === p.sector && x.slug !== p.slug; }).slice(0, 6);
      /* Low-resolution images (< 1400px wide) are shown inset beside the title, never stretched full-bleed */
      var inset = p.imageMaxW < 1400;
      var heroHtml = '<div class="cs-hero' + (inset ? ' inset' : '') + '"><button type="button" data-lightbox aria-label="View image full screen: ' + esc(p.name) + '"><div class="frame"' + (inset ? ' style="--native:' + p.imageMaxW + 'px"' : '') + '>' +
          img(p.image, p.imageMaxW, inset ? '(max-width:700px) 100vw, ' + p.imageMaxW + 'px' : '100vw', p.caption.split('. Image')[0], true) + '</div></button>' +
          '<p class="caption' + (inset ? '' : ' wrap') + '" style="margin-top:10px">' + esc(p.caption) + '</p></div>';
      var titleHtml = '<div class="cs-title"><div><p class="crumbs"><a href="projects.html">Projects</a> / <a href="projects.html?sector=' + slugify(p.sector) + '">' + esc(p.sector) + '</a></p>' +
          '<h1 class="heading-page">' + esc(p.name) + '</h1><p class="intro" style="margin-top:16px;max-width:820px">' + esc(p.summary) + '</p></div></div>';
      cs.innerHTML =
        (inset ? '<div class="wrap"><div class="cs-inset">' + titleHtml + heroHtml + '</div>'
               : heroHtml + '<div class="wrap">' + titleHtml) +
          '<div class="credit-banner" role="note"><span class="credit tbc" style="flex:none">Credit to confirm</span><p>Demo content. Before publication this will state either “Willis Hazell Engineers: [role], [stages]” or that the project was delivered by a team member at a previous practice.</p></div>' +
        '<div class="cs-body"><div><h2 class="label" style="margin-bottom:14px">Project facts</h2><dl class="md">' +
          meta.filter(function (m) { return m[1]; }).map(function (m) { return '<div><dt>' + m[0] + '</dt><dd>' + esc(m[1]) + '</dd></div>'; }).join('') +
          '</dl><p class="caption" style="margin-top:12px">Architect, services, role and completion are hidden until supplied.</p></div>' +
          '<div class="prose"><h2>Key inputs</h2><ul class="inputs">' + p.keyInputs.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul>' +
          '<h2>The engineering challenge</h2><p class="tbc">[To be written with the project team: the site, structure and constraints that made this project demanding.]</p>' +
          '<h2>Our contribution</h2><p class="tbc">[To be written with the project team: what Willis Hazell designed, decided or changed, with figures where possible.]</p>' +
          '<h2>Gallery</h2><div class="gallery-slots"><div class="slot">Construction photograph</div><div class="slot">Structural detail</div><div class="slot">Completed interior</div></div>' +
          '<p class="caption" style="margin-top:10px">Gallery images to be supplied with usage rights.</p></div></div>' +
        (related.length ? '<section class="sec-compact" aria-labelledby="rel-h"><div class="sec-head rule-top"><h2 id="rel-h" class="heading-section">More ' + esc(p.sector.toLowerCase()) + '</h2><a class="tl" href="projects.html?sector=' + slugify(p.sector) + '">All ' + esc(p.sector.toLowerCase()) + ' →</a></div>' +
          '<ul class="results" style="padding-top:0">' + related.map(card2).join('') + '</ul></section>' : '') +
        '<a class="next-project" href="' + projectUrl(next) + '"><span class="label">Next case study</span><span class="heading-section">' + esc(next.name) + ' →</span></a></div>';
      function card2(x) {
        if (x.caseStudy) return '<li><a href="' + projectUrl(x) + '"><div class="frame ratio-32">' + img(x.image, x.imageMaxW, '(max-width:620px) 100vw, 33vw', '') + '</div><div class="card-text"><h3 class="title-project">' + esc(x.name) + '</h3>' + creditTag(x) + '</div></a></li>';
        return '<li><div class="typo-card"><h3 class="title-project">' + esc(x.name) + '</h3>' + (x.detail ? '<p class="body-small">' + esc(x.detail.charAt(0).toUpperCase() + x.detail.slice(1)) + '</p>' : '') + creditTag(x) + '</div></li>';
      }
      /* Lightbox */
      var lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb), lastFocus;
      var openLb = function () { lastFocus = document.activeElement; lbImg.src = 'assets/img/' + p.image + '-' + p.imageMaxW + '.webp'; lbImg.alt = p.name; lbCap.textContent = p.caption; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); $('.close', lb).focus(); document.body.style.overflow = 'hidden'; };
      var closeLb = function () { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
      $('[data-lightbox]', cs).addEventListener('click', openLb);
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
})();
