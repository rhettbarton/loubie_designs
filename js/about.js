document.addEventListener('DOMContentLoaded', loadAboutPhotos);

async function loadAboutPhotos() {
  try {
    const response = await fetch('photos.json');
    const photos = await response.json();
    const aboutSection = document.getElementById('about-photos');

    const aboutPhotos = photos.filter(photo => photo.about);

    aboutPhotos.forEach(photo => {
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.label || 'About photo';
      aboutSection.appendChild(img);
    });
  } catch (err) {
    console.error('Failed to load about photos:', err);
  }
}
