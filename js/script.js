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


// function openLightbox(imageSrc) {
//     const lightbox = document.getElementById('lightbox');
//     const img = document.getElementById('lightbox-img');
//     img.src = imageSrc;
//     lightbox.style.display = 'flex';
//   }
  
//   function closeLightbox() {
//     document.getElementById('lightbox').style.display = 'none';
//   }
  
  // // Load and render gallery
  // fetch('photos.json')
  //   .then(res => res.json())
  //   .then(data => {
  //     const gallery = document.getElementById('gallery');
  //     data.forEach(item => {
  //       const div = document.createElement('div');
  //       div.className = 'thumbnail';
  //       div.onclick = () => openLightbox(item.src);
  
  //       div.innerHTML = `
  //         <img src="${item.src}" alt="${item.label}">
  //         <span>${item.label}</span>
  //       `;
  //       gallery.appendChild(div);
  //     });
  //   });
  