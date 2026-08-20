const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const timeElements = document.querySelectorAll('.live-time');
const updateTime = () => {
  if (!timeElements.length) return;
  const currentTime = new Intl.DateTimeFormat('en-IE', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Dublin'
  }).format(new Date());
  timeElements.forEach(element => { element.textContent = currentTime; });
};
updateTime();
setInterval(updateTime, 30000);
const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = new Date().getFullYear();

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.home-nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('is-open', !open);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}));

const marquee = document.querySelector('.image-marquee');
const marqueeTrack = marquee?.querySelector('.marquee-track');
if (marquee && marqueeTrack) {
  let marqueePosition = 0;
  let dragStartX = 0;
  let dragStartPosition = 0;
  let isDragging = false;
  let resumeAt = 0;
  let previousFrameTime = performance.now();

  const cycleWidth = () => marqueeTrack.scrollWidth / 2;
  const renderMarquee = () => {
    const width = cycleWidth();
    if (!width) return;
    marquee.scrollLeft = ((marqueePosition % width) + width) % width;
  };
  const pauseBriefly = (duration = 700) => { resumeAt = performance.now() + duration; };

  marquee.addEventListener('pointerdown', event => {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartPosition = marqueePosition;
    marquee.classList.add('is-dragging');
    marquee.setPointerCapture(event.pointerId);
  });
  marquee.addEventListener('pointermove', event => {
    if (!isDragging) return;
    marqueePosition = dragStartPosition - (event.clientX - dragStartX);
    renderMarquee();
  });
  const finishDrag = event => {
    if (!isDragging) return;
    isDragging = false;
    marquee.classList.remove('is-dragging');
    if (marquee.hasPointerCapture(event.pointerId)) marquee.releasePointerCapture(event.pointerId);
    pauseBriefly();
  };
  marquee.addEventListener('pointerup', finishDrag);
  marquee.addEventListener('pointercancel', finishDrag);
  marquee.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    marqueePosition += event.key === 'ArrowRight' ? 120 : -120;
    renderMarquee();
    pauseBriefly(1200);
  });

  const moveMarquee = frameTime => {
    const elapsed = Math.min(frameTime - previousFrameTime, 50);
    previousFrameTime = frameTime;
    if (!reducedMotion && !isDragging && frameTime >= resumeAt) {
      marqueePosition += elapsed * cycleWidth() / 34000;
      renderMarquee();
    }
    requestAnimationFrame(moveMarquee);
  };
  requestAnimationFrame(moveMarquee);
  window.addEventListener('resize', renderMarquee);
}

const reveals = document.querySelectorAll('.reveal');
if (reducedMotion) {
  reveals.forEach(element => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  reveals.forEach(element => observer.observe(element));
}

const showLinkedCampaign = ({ fromPageLoad = false } = {}) => {
  if (!document.body.classList.contains('portfolio-v2') || !window.location.hash) return;
  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (!target) return;
  target.querySelector('.case-topline')?.classList.add('is-visible');
  const moveToTarget = () => {
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    target.classList.remove('is-linked');
    void target.offsetWidth;
    target.classList.add('is-linked');
    window.setTimeout(() => target.classList.remove('is-linked'), 1400);
  };
  if (fromPageLoad && !reducedMotion) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    requestAnimationFrame(() => requestAnimationFrame(moveToTarget));
  } else {
    moveToTarget();
  }
};
window.addEventListener('hashchange', () => showLinkedCampaign());
window.addEventListener('load', () => showLinkedCampaign({ fromPageLoad: true }), { once: true });

if (!reducedMotion) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const drawer = document.querySelector('.contact-drawer');
const scrim = document.querySelector('.contact-scrim');
const closeButton = document.querySelector('.contact-close');
let lastFocus = null;
const openContact = event => {
  lastFocus = event.currentTarget;
  scrim.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add('is-open');
    scrim.classList.add('is-open');
  });
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
  closeButton.focus();
};
const closeContact = () => {
  drawer.classList.remove('is-open');
  scrim.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
  setTimeout(() => { scrim.hidden = true; }, reducedMotion ? 0 : 450);
  lastFocus?.focus();
};
document.querySelectorAll('.contact-open').forEach(button => button.addEventListener('click', openContact));
closeButton?.addEventListener('click', closeContact);
scrim?.addEventListener('click', closeContact);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && drawer?.classList.contains('is-open')) closeContact();
});
