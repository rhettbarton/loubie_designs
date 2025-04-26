document.addEventListener('DOMContentLoaded', loadPortfolio);

async function loadPortfolio() {
  try {
    const response = await fetch('photos.json');
    const photos = await response.json();
    const portfolio = photos.filter(photo => photo.portfolio);

    const grid = document.getElementById('portfolio-grid');
    const grouped = {};

    // Group photos by category
    portfolio.forEach(photo => {
      const category = photo.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(photo);
    });

    // Build the grouped sections
    Object.keys(grouped).forEach(category => {
      const section = document.createElement('section');
      section.className = 'portfolio-category';

      const heading = document.createElement('h2');
      heading.textContent = category;
      section.appendChild(heading);

      const sectionGrid = document.createElement('div');
      sectionGrid.className = 'portfolio-grid';

      grouped[category].forEach(photo => {
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.onclick = () => openLightbox(photo.src, photo.description);

        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.label || 'Quilted item';

        const label = document.createElement('label');
        label.textContent = photo.label || 'Untitled';

        item.appendChild(img);
        item.appendChild(label);
        sectionGrid.appendChild(item);
      });

      section.appendChild(sectionGrid);
      grid.appendChild(section);
    });

  } catch (error) {
    console.error('Error loading portfolio photos:', error);
  }
}

function openLightbox(imageSrc, imageDesc) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    img.src = imageSrc;
    caption.textContent = imageDesc || '';
    lightbox.style.display = 'flex';
  }
  
  function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
  }