(() => {
  'use strict';

  const sections = [
    ['studentServicesBox', 1],
    ['userBox', 2],
    ['learningSourceBox', 3],
    ['activityBox', 4],
    ['FBpostBox', 5],
    ['cliproomBox', 6],
    ['learningBaseModule', 7]
  ];
  const storageKey = 'adminSectionSpacingV1';
  const step = 4;
  const maxGap = 40;

  function readSpacing() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch (_) {
      return {};
    }
  }

  function saveSpacing(value) {
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch (_) {}
  }

  function initialize() {
    const spacing = readSpacing();

    sections.forEach(([id, number]) => {
      const section = document.getElementById(id);
      if (!section || section.dataset.adminSectionReady === '1') return;

      section.dataset.adminSection = String(number);
      section.dataset.adminSectionReady = '1';

      const spacer = document.createElement('div');
      spacer.className = 'admin-section-spacer';
      spacer.dataset.adminSectionSpacer = String(number);
      spacer.setAttribute('aria-hidden', 'true');
      section.before(spacer);

      const marker = document.createElement('div');
      marker.className = 'admin-section-marker';
      marker.setAttribute('aria-label', `SECTION ${number} ปรับช่องว่าง`);
      marker.innerHTML = `
        <button class="admin-section-gap-button admin-section-gap-minus" type="button" aria-label="ลดช่องว่าง SECTION ${number}">−</button>
        <span class="admin-section-marker-title">SECTION</span>
        <strong class="admin-section-marker-number">${number}</strong>
        <button class="admin-section-gap-button admin-section-gap-plus" type="button" aria-label="เพิ่มช่องว่าง SECTION ${number}">+</button>`;
      section.prepend(marker);

      let gap = Math.max(0, Math.min(maxGap, Number(spacing[number]) || 0));
      const applyGap = () => spacer.style.setProperty('--admin-section-gap', `${gap}px`);
      applyGap();

      marker.querySelector('.admin-section-gap-minus').addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        gap = Math.max(0, gap - step);
        spacing[number] = gap;
        applyGap();
        saveSpacing(spacing);
      });

      marker.querySelector('.admin-section-gap-plus').addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        gap = Math.min(maxGap, gap + step);
        spacing[number] = gap;
        applyGap();
        saveSpacing(spacing);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
