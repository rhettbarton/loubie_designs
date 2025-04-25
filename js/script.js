document.addEventListener('DOMContentLoaded', () => {
  loadPhotos();
  setupLightboxClose();
});

function loadPhotos() {
  fetch('photos.json')
    .then(response => response.json())
    .then(photos => {
      const gallery = document.getElementById('gallery');
      gallery.innerHTML = '';

      // Group photos by category
      const categories = {};
      photos.forEach(photo => {
        const category = photo.category || 'Uncategorized';
        if (!categories[category]) categories[category] = [];
        categories[category].push(photo);
      });

      // Render each category section
      for (const category in categories) {
        const header = document.createElement('h2');
        header.textContent = category;
        gallery.appendChild(header);

        const container = document.createElement('div');
        container.className = 'category-container';

        categories[category].forEach(photo => {
          const card = createPhotoCard(photo);
          container.appendChild(card);
        });

        gallery.appendChild(container);
      }
    })
    .catch(err => console.error('Failed to load photos.json:', err));
}

function createPhotoCard(photo) {
  const card = document.createElement('div');
  card.className = 'photo-card';

  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = photo.label || 'Photo';

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = photo.label || '';

  card.appendChild(img);
  card.appendChild(label);

  card.addEventListener('click', () => showLightbox(photo));

  return card;
}

function showLightbox(photo) {
  const lightbox = document.getElementById('lightbox');
  const content = lightbox.querySelector('.lightbox-content');

  content.innerHTML = `
    <img class="lightbox-image" src="${photo.src}" alt="${photo.label}">
    <div class="lightbox-info">
      <h3>${photo.label || ''}</h3>
      <p>${photo.description || ''}</p>
    </div>
  `;

  lightbox.style.display = 'flex';
}

function setupLightboxClose() {
  const lightbox = document.getElementById('lightbox');
  lightbox.addEventListener('click', () => {
    lightbox.style.display = 'none';
  });
}
