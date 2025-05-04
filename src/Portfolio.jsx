// import { useEffect, useState } from 'react';

// function Portfolio() {
//   const [photos, setPhotos] = useState([]);

//   useEffect(() => {
//     fetch('/photos.json')
//       .then(res => res.json())
//       .then(setPhotos);
//   }, []);

//   const grouped = photos.reduce((acc, photo) => {
//     acc[photo.category] = acc[photo.category] || [];
//     acc[photo.category].push(photo);
//     return acc;
//   }, {});

//   return (
//     <div className="portfolio">
//       {Object.entries(grouped).map(([category, items]) => (
//         <section key={category} className="portfolio-category">
//           <h2>{category}</h2>
//           <div className="photo-grid">
//             {items.map((photo, idx) => (
//               <div key={idx} className="photo-card">
//                 <img src={photo.url} alt={photo.label} />
//                 <div>{photo.label}</div>
//               </div>
//             ))}
//           </div>
//         </section>
//       ))}
//     </div>
//   );
// }

// export default Portfolio;


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
