/* ═══════════════════════════════════════════════════════════
   ALBUM CONFIG — edit this to add/remove albums and photos
   ═══════════════════════════════════════════════════════════
   Each album:
     name    – display name shown on the card and modal
     folder  – path to the folder (relative to index.html)
     cover   – filename inside that folder used as the card cover image
     photos  – array of all filenames in that folder
═══════════════════════════════════════════════════════════ */
const ALBUMS = [
  {
    name:   'Dashain 2024',
    folder: 'images/dashain/',
    cover:  'd2.jpg',
    photos: ['d1.jpg', 'd2.jpg', 'd3.jpeg']   // ← add your filenames here
  },
  {
    name:   'Tihar 2024',
    folder: 'images/tihar/',
    cover:  '1.jpg',
    photos: ['1.jpg', '2.jpg']             // ← add your filenames here
  },
  {
    name:   'Pon-2015',
    folder: 'images/pon-2025/',
    cover:  '2.jpg',
    photos: ['1.jpg', '2.jpg', '3.jpg', '4.jpeg']
  }
];
/* ═══════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════
   VIDEO CONFIG — add/remove videos here
   ═══════════════════════════════════════════════════════════
   Each video:
     title  – label shown below the player
     file   – path to the video file (relative to index.html)
             Supports .mp4, .mov, .webm
             Tip: convert .mov to .mp4 for best browser support
═══════════════════════════════════════════════════════════ */
const VIDEOS = [
  {
    title: 'NSO Event Highlight',
    file:  'video/IMG_9689.mov'
  }
  // Add more videos like this:
  // { title: 'Dashain 2024', file: 'video/dashain.mp4' },
  // { title: 'Cultural Night', file: 'video/cultural_night.mp4' }
];
/* ═══════════════════════════════════════════════════════════ */


/* ── Carousel ── */
(function () {
  const track    = document.getElementById('carouselTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');
  const slides   = track ? track.querySelectorAll('.slide') : [];
  const total    = slides.length;
  let current    = 0;
  let timer;

  function buildDots() {
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    });
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  if (track && total > 0) {
    buildDots();
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
    });

    resetTimer();
  }
})();


/* ── Mobile hamburger ── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.querySelectorAll('span').forEach((s, i) => {
      if (open) {
        if (i === 0) s.style.transform = 'translateY(7px) rotate(45deg)';
        if (i === 1) s.style.opacity   = '0';
        if (i === 2) s.style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        s.style.transform = '';
        s.style.opacity   = '';
      }
    });
  });

  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();


/* ── Active nav link on scroll ── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  const navH     = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 56;

  function onScroll() {
    let active = '';
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= navH + 80) active = sec.id;
    });
    links.forEach(l => {
      const href = l.getAttribute('href').replace('#', '');
      l.classList.toggle('active', href === active || (active === '' && href === 'home'));
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ── Contact form ── */
(function () {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (success) {
      success.classList.add('visible');
      form.reset();
      setTimeout(() => success.classList.remove('visible'), 6000);
    }
  });
})();


/* ── Gallery Albums ── */
(function () {
  const container   = document.getElementById('albumsContainer');
  const modal       = document.getElementById('albumModal');
  const modalTitle  = document.getElementById('albumModalTitle');
  const photosGrid  = document.getElementById('albumPhotosGrid');
  const modalClose  = document.getElementById('albumModalClose');
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lbImg');
  const lbClose     = document.getElementById('lbClose');
  const lbPrev      = document.getElementById('lbPrev');
  const lbNext      = document.getElementById('lbNext');
  const lbCounter   = document.getElementById('lbCounter');

  if (!container) return;

  let lbPhotos  = [];
  let lbCurrent = 0;

  // ── Render album cards ──────────────────────────────────
  ALBUMS.forEach((album, albumIdx) => {
    const card = document.createElement('div');
    card.className = 'album-card fade-in';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Open ' + album.name);

    const coverSrc = album.folder + album.cover;

    card.innerHTML = `
      <div class="album-cover">
        <img src="${coverSrc}" alt="${album.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'album-cover-placeholder\\'><i class=\\'fas fa-images\\'></i><span>${album.name}</span></div>'" />
        <div class="album-cover-overlay"></div>
      </div>
      <div class="album-info">
        <h4>${album.name}</h4>
        <span class="album-count">${album.photos.length} photo${album.photos.length !== 1 ? 's' : ''}</span>
      </div>
    `;

    const open = () => openAlbum(albumIdx);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    container.appendChild(card);
  });

  // ── Open album modal ────────────────────────────────────
  function openAlbum(albumIdx) {
    const album = ALBUMS[albumIdx];
    modalTitle.textContent = album.name;
    photosGrid.innerHTML = '';

    album.photos.forEach((filename, photoIdx) => {
      const src  = album.folder + filename;
      const item = document.createElement('div');
      item.className = 'album-photo-item';

      const img = document.createElement('img');
      img.src     = src;
      img.alt     = album.name + ' photo ' + (photoIdx + 1);
      img.loading = 'lazy';
      img.onerror = () => { item.style.background = 'var(--light-bg)'; img.style.display = 'none'; };

      item.appendChild(img);
      item.addEventListener('click', () => openLightbox(album, photoIdx));
      photosGrid.appendChild(item);
    });

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeAlbum() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeAlbum);
  modal.addEventListener('click', e => { if (e.target === modal) closeAlbum(); });

  // ── Lightbox ────────────────────────────────────────────
  function openLightbox(album, startIdx) {
    lbPhotos  = album.photos.map(f => album.folder + f);
    lbCurrent = startIdx;
    showLbPhoto();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lbImg.src = '';
  }

  function showLbPhoto() {
    lbImg.src = lbPhotos[lbCurrent];
    lbCounter.textContent = (lbCurrent + 1) + ' / ' + lbPhotos.length;
  }

  function lbGo(delta) {
    lbCurrent = (lbCurrent + delta + lbPhotos.length) % lbPhotos.length;
    showLbPhoto();
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click',  () => lbGo(-1));
  lbNext.addEventListener('click',  () => lbGo(+1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // Touch swipe on lightbox
  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) lbGo(diff > 0 ? 1 : -1);
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (lightbox.classList.contains('open')) {
      if (e.key === 'ArrowLeft')  lbGo(-1);
      if (e.key === 'ArrowRight') lbGo(+1);
      if (e.key === 'Escape')     closeLightbox();
      return;
    }
    if (modal.classList.contains('open') && e.key === 'Escape') {
      closeAlbum();
    }
  });
})();


/* ── Videos ── */
(function () {
  const container = document.getElementById('videosContainer');
  if (!container || !VIDEOS.length) return;

  VIDEOS.forEach(v => {
    const card = document.createElement('div');
    card.className = 'video-card fade-in';

    // Detect type for the <source> element
    const ext  = v.file.split('.').pop().toLowerCase();
    const mime = ext === 'mov' ? 'video/mp4' : ext === 'webm' ? 'video/webm' : 'video/mp4';

    card.innerHTML = `
      <div class="video-player-wrap">
        <video controls preload="metadata" playsinline>
          <source src="${v.file}" type="${mime}" />
          <source src="${v.file}" type="video/quicktime" />
          Your browser does not support this video format.
        </video>
      </div>
      <div class="video-card-title">${v.title}</div>
    `;
    container.appendChild(card);
  });
})();


/* ── Scroll entrance animations ── */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .fade-in { opacity: 0; transform: translateY(22px); transition: opacity 0.55s ease, transform 0.55s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(
    '.stat-card, .event-card, .link-card, .video-card, .album-card, .about-text, .about-stats, .contact-info, .contact-form'
  ).forEach(el => { el.classList.add('fade-in'); obs.observe(el); });
})();
