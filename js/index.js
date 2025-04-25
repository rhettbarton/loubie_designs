document.addEventListener('DOMContentLoaded', loadFeaturedPhotos);

async function loadFeaturedPhotos() {
  try {
    const response = await fetch('photos.json');
    const photos = await response.json();
    const featured = photos.filter(photo => photo.featured);

    const reel = document.getElementById('featured-reel');
    featured.forEach(photo => {
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.label || 'Quilted item';
      img.className = 'featured-photo';

      reel.appendChild(img);
    });
  } catch (error) {
    console.error('Error loading featured photos:', error);
  }
}