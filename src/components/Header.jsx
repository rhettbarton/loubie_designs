import { Link } from 'react-router-dom';
import './Header.css'; // Create this CSS file or integrate into main styles

function Header() {
  return (
    <header className="site-header">
      <div className="logo-title">
        <img src="/logos/Loubie Designs Circle Green Background.png" alt="Site Logo" className="site-logo" />
        <h1 className="site-title">Loubie Designs</h1>
      </div>
      <nav className="site-nav">
        <Link to="/">About</Link>
        <Link to="/events">Events</Link>
        <Link to="/portfolio">Portfolio</Link>
      </nav>
    </header>
  );
}

export default Header;
