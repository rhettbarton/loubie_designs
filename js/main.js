async function loadPhotos(view) {
  const res = await fetch('photos.json');
  const photos = await res.json();

  if (view === 'featured') {
    const featured = photos.filter(p => p.featured);
    renderGallery('featured-gallery', featured);
  } else if (view === 'portfolio') {
    const container = document.getElementById('portfolio-container');
    const categories = [...new Set(photos.map(p => p.category))];

    categories.forEach(cat => {
      const section = document.createElement('section');
      section.innerHTML = `<h2>${cat}</h2><div class="gallery"></div>`;
      const gallery = section.querySelector('.gallery');
      photos
        .filter(p => p.category === cat)
        .forEach(photo => gallery.appendChild(createPhotoCard(photo)));
      container.appendChild(section);
    });
  }
}

function renderGallery(id, photos) {
  const gallery = document.getElementById(id);
  photos.forEach(photo => gallery.appendChild(createPhotoCard(photo)));
}

function createPhotoCard(photo) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.innerHTML = `
    <img src="${photo.url}" alt="${photo.label}" />
    <div class="label">${photo.label}</div>
  `;
  card.onclick = () => showLightbox(photo);
  return card;
}

function createLightbox() {
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <img id="lightbox-image" />
      <div class="lightbox-info">
        <h3 id="lightbox-label"></h3>
        <p id="lightbox-description"></p>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  lightbox.addEventListener('click', e => {
    if (e.target.id === 'lightbox' || e.key === 'Escape') {
      lightbox.style.display = 'none';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      lightbox.style.display = 'none';
    }
  });
}

function showLightbox(photo) {
  const lightbox = document.getElementById('lightbox');
  document.getElementById('lightbox-image').src = photo.url;
  document.getElementById('lightbox-label').textContent = photo.label;
  document.getElementById('lightbox-description').textContent = photo.description;
  lightbox.style.display = 'flex';
}

// Add this to the end of your script to create the lightbox on page load
createLightbox();
document.body.style.overflow = 'hidden';
lightbox.style.display = 'none';
document.body.style.overflow = '';
