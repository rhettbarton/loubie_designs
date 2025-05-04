// import { useEffect, useState } from 'react';

// function About() {
//   const [aboutPhotos, setAboutPhotos] = useState([]);

//   useEffect(() => {
//     fetch('/photos.json')
//       .then(res => res.json())
//       .then(data => setAboutPhotos(data.filter(photo => photo.category === 'about')));
//   }, []);

//   return (
//     <div className="about-container">
//       <div className="about-text">Your paragraph here...</div>
//       <div className="about-photo">
//         {aboutPhotos[0] && <img src={aboutPhotos[0].url} alt="About" />}
//       </div>
//     </div>
//   );
// }

// export default About;

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
