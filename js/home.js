const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const timeElement = document.querySelector('.live-time');
const updateTime = () => {
  if (!timeElement) return;
  timeElement.textContent = new Intl.DateTimeFormat('en-IE', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Dublin'
  }).format(new Date());
};
updateTime();
setInterval(updateTime, 30000);
document.getElementById('year').textContent = new Date().getFullYear();

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

const preview = document.querySelector('.project-preview');
const projectColors = {
  staycity: ['#f2a65a', '#5b4a8b'],
  kerrygold: ['#f5c84c', '#0a5f3c'],
  'burger-king': ['#ed6a3a', '#7c1f2b'],
  bmw: ['#58a5d8', '#152330']
};
document.querySelectorAll('.project-row').forEach(row => {
  row.addEventListener('pointerenter', () => {
    if (!preview) return;
    const colors = projectColors[row.dataset.project];
    preview.style.setProperty('--preview-one', colors[0]);
    preview.style.setProperty('--preview-two', colors[1]);
    preview.querySelector('span').textContent = `${row.querySelector('.project-name').textContent} image`;
    preview.classList.add('is-active');
  });
  row.addEventListener('pointermove', event => {
    if (!preview || window.innerWidth < 900) return;
    preview.style.left = `${Math.min(event.clientX + 34, window.innerWidth - 360)}px`;
    preview.style.top = `${Math.min(event.clientY + 28, window.innerHeight - 250)}px`;
  });
  row.addEventListener('pointerleave', () => preview?.classList.remove('is-active'));
});

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
  if (event.key === 'Escape' && drawer.classList.contains('is-open')) closeContact();
});
