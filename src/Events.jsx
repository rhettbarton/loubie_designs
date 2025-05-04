// import { useEffect, useState } from 'react';

// function Events() {
//   const [featuredPhotos, setFeaturedPhotos] = useState([]);

//   useEffect(() => {
//     fetch('/photos.json')
//       .then(res => res.json())
//       .then(data => setFeaturedPhotos(data.filter(photo => photo.featured)));
//   }, []);

//   return (
//     <div className="photo-reel">
//       {featuredPhotos.map((photo, idx) => (
//         <img key={idx} src={photo.url} alt={photo.label} className="featured-photo" />
//       ))}
//     </div>
//   );
// }

// export default Events;


import React from 'react';

function Placeholder() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>This page is under construction</h2>
      <p>More content coming soon!</p>
    </div>
  );
}

export default Placeholder;
