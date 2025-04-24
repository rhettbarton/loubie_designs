function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = imageSrc;
    lightbox.style.display = 'flex';
  }
  
  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
  }
  