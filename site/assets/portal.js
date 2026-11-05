async function loadStudios() {
  const container = document.querySelector('#studios');
  try {
    const response = await fetch('/studios.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('Directory unavailable');
    const studios = await response.json();
    container.replaceChildren();
    for (const studio of studios) {
      const card = document.createElement('article'); card.className = 'card';
      const icon = document.createElement('div'); icon.className = 'studio-icon'; icon.textContent = '◇'; icon.setAttribute('aria-hidden', 'true');
      const title = document.createElement('h3'); title.textContent = studio.name;
      const description = document.createElement('p'); description.textContent = studio.description;
      card.append(icon, title, description);
      if (studio.path && /^\/studios\/[a-zA-Z0-9_./-]+$/.test(studio.path) && !studio.path.includes('..')) {
        const link = document.createElement('a'); link.href = studio.path; link.textContent = 'Open studio ↗'; card.append(link);
      } else {
        const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = 'Preparing for the team'; card.append(badge);
      }
      container.append(card);
    }
  } catch {
    container.textContent = 'The studio directory is unavailable. Refresh this page or contact your SignFab administrator.';
  }
}
loadStudios();
