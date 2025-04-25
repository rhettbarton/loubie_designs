document.addEventListener('DOMContentLoaded', loadPortfolio);

async function loadPortfolio() {
  try {
    const response = await fetch('photos.json');
    const photos = await response.json();

    const grid = document.getElementById('portfolio-grid');

    photos.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'portfolio-item';
      item.onclick = () => openLightbox(photo.src);

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.label || 'Quilted item';

      const label = document.createElement('label');
      label.textContent = photo.label || 'Untitled';

      item.appendChild(img);
      item.appendChild(label);
      grid.appendChild(item);
    });
  } catch (error) {
    console.error('Error loading portfolio photos:', error);
  }
}

function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = imageSrc;
    lightbox.style.display = 'flex';
  }
  
  function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
  }