import { CaretRight } from '@phosphor-icons/react';

interface AccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function Accordion({ title, isOpen, onToggle, children, action }: AccordionProps) {
  return <>
    <div 
      onClick={onToggle}
      className="w-full text-left mb-3 cursor-pointer"
      style={{
        background: '#008080',
        border: '3px ridge #FFFFFF',
        padding: '6px 12px',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.5)',
        fontFamily: 'Arial, Helvetica, sans-serif'
      }}
    >
      <div className="flex items-center justify-between" style={{ color: '#FFFF00' }}>
        <h2 className="text-base font-bold uppercase" style={{ letterSpacing: '0.5px' }}>
          {isOpen ? '▼' : '►'} {title}
        </h2>
        <div className="flex items-center gap-2">
          {action}
        </div>
      </div>
    </div>

    <div className={`${isOpen ? 'flex-1' : 'flex-0'} transition-[flex] h-0 duration-300 ease-in-out overflow-y-scroll`}>
      <div className="pb-2">
        {children}
      </div>
    </div>
  </>;
}