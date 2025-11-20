import { Link } from 'react-router-dom';
import newGif from '../../static/new-gif.svg';
import santaIcon from '../../static/santa-90s.svg';
import treeIcon from '../../static/christmas-tree-90s.svg';

export function NavBar90s() {
  return (
    <div className="nav-90s py-2 px-4 sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img src={santaIcon} alt="Santa" style={{ height: '32px', width: '32px' }} />
          <Link to="/" style={{ color: '#FFFF00', fontWeight: 'bold', fontSize: '18px', fontFamily: 'Arial, Helvetica, sans-serif', textDecoration: 'none', textShadow: '2px 2px 0 #000' }}>
            SECRET SANTA GENERATOR
          </Link>
          <img src={treeIcon} alt="Tree" style={{ height: '32px', width: '32px' }} />
        </div>
        
        <div className="flex flex-wrap gap-1 items-center">
          <Link to="/" className="nav-section">
            🏠 Home
          </Link>
          <a href="https://github.com/gazdik/secretsanta" target="_blank" rel="noopener noreferrer" className="nav-section">
            💾 GitHub
          </a>
          <span className="nav-section" style={{ background: '#FF0000', color: '#FFFF00' }}>
            ⭐ FREE!
            <img src={newGif} alt="NEW" style={{ display: 'inline', height: '12px', marginLeft: '4px' }} />
          </span>
        </div>
      </div>
    </div>
  );
}
