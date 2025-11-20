import emailIcon from '../../static/email-icon.svg';
import treeIcon from '../../static/christmas-tree-90s.svg';
import santaIcon from '../../static/santa-90s.svg';
import starIcon from '../../static/star-bullet.svg';

export function Footer90s() {
  const visitorCount = Math.floor(Math.random() * 9000) + 1000;
  
  return (
    <div style={{ 
      background: '#000080', 
      borderTop: '3px solid #000', 
      padding: '8px 12px',
      marginTop: '0',
      textAlign: 'center',
      color: '#FFFF00',
      fontSize: '11px',
      fontFamily: 'Arial, Helvetica, sans-serif',
      flexShrink: 0
    }}>
      <div className="container mx-auto">
        <p className="mb-2" style={{ color: '#00FFFF' }}>
          <img src={starIcon} alt="*" className="blink-90s" style={{ display: 'inline', height: '12px', marginRight: '4px' }} /> Best viewed in <strong>Netscape Navigator 4.0</strong> or <strong>Internet Explorer 4.0</strong> <img src={starIcon} alt="*" className="blink-90s" style={{ display: 'inline', height: '12px', marginLeft: '4px' }} />
        </p>
        <p className="mb-2" style={{ fontSize: '12px', color: '#FFFFFF' }}>
          <img src={emailIcon} alt="Email" style={{ display: 'inline', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
          Optimized for 800x600 resolution
        </p>
        <div style={{ 
          background: '#C0C0C0', 
          border: '2px inset #999', 
          padding: '8px', 
          margin: '8px auto',
          maxWidth: '300px',
          color: '#000',
          fontWeight: 'bold'
        }}>
          <span className="blink-90s" style={{ color: '#FF0000' }}>●</span> You are visitor #{visitorCount.toLocaleString()} <span className="blink-90s" style={{ color: '#FF0000' }}>●</span>
        </div>
        <p style={{ fontSize: '10px', color: '#CCCCCC' }}>
          © {new Date().getFullYear()} Secret Santa Generator | Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <p style={{ fontSize: '12px', marginTop: '8px', color: '#00FF00' }}>
          <img src={treeIcon} alt="Tree" className="blink-90s" style={{ display: 'inline', height: '20px', marginRight: '8px', verticalAlign: 'middle' }} /> MERRY CHRISTMAS! <img src={santaIcon} alt="Santa" className="blink-90s" style={{ display: 'inline', height: '20px', marginLeft: '8px', verticalAlign: 'middle' }} />
        </p>
      </div>
    </div>
  );
}
