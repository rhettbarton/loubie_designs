import products from '../data/photos.json';

function Portfolio() {
  return (
    <div className="portfolio">
      {products.map((item, index) => (
        <div key={index} className="product-card">
          <img src={item.src} alt={item.label} />
          <h3>{item.label}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export default Portfolio;
