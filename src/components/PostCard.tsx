import santaIcon from '../../static/santa-90s.svg';
import treeIcon from '../../static/christmas-tree-90s.svg';

interface PostCardProps {
  children: React.ReactNode;
  className?: string;
}

export function PostCard({ children, className = "" }: PostCardProps) {
  return (
    <div className={`content-box-90s p-4 ${className}`}>
      <table className="table-90s">
        <tbody>
          <tr>
            <td style={{ background: '#FF00FF', fontWeight: 'bold', padding: '8px', borderBottom: '3px solid #000', fontFamily: 'Arial, Helvetica, sans-serif', color: '#FFFF00' }}>
              <div className="flex items-center gap-2">
                <img src={santaIcon} alt="Santa" style={{ height: '24px', width: '24px' }} />
                <span>SECRET SANTA GENERATOR</span>
                <img src={treeIcon} alt="Tree" style={{ height: '24px', width: '24px' }} />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '16px' }}>
              {children}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
