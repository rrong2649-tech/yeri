
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'neutral' | 'hacker';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "uppercase font-bold tracking-wider border-2 px-6 py-2 transition-all duration-150 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]";
  
  const variants = {
    primary: "bg-amber-600 border-amber-400 text-amber-50 hover:bg-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]",
    danger: "bg-red-900 border-red-500 text-red-100 hover:bg-red-700 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    neutral: "bg-stone-800 border-stone-600 text-stone-300 hover:bg-stone-700",
    hacker: "bg-green-900/40 border-green-500 text-green-400 font-mono hover:bg-green-800/60 backdrop-blur-sm"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Panel: React.FC<{ children: React.ReactNode, className?: string, title?: string, type?: 'game' | 'hacker' }> = ({ children, className = '', title, type = 'hacker' }) => {
  const borderClass = type === 'game' ? 'border-stone-500' : 'border-amber-600';
  const bgClass = type === 'game' ? 'bg-stone-900' : 'bg-black/90';
  const textClass = type === 'game' ? 'text-stone-400' : 'text-amber-500';

  return (
    <div className={`relative ${bgClass} border-2 ${borderClass} rounded-lg p-4 ${className} shadow-[0_0_20px_rgba(0,0,0,0.8)]`}>
      {title && (
        <div className={`absolute -top-3 left-4 ${bgClass} px-2 ${textClass} text-sm font-mono border ${borderClass}`}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

export const MonitorFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative border-[16px] border-stone-800 rounded-lg overflow-hidden shadow-2xl bg-black w-full h-full">
            <div className="absolute top-0 w-full h-full pointer-events-none z-20 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"></div>
            {children}
            {/* Monitor Brand */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-stone-600 font-bold z-30 uppercase tracking-[0.2em]">
                Earth Online
            </div>
        </div>
    )
}

export const ProgressBar: React.FC<{ value: number, label: string, color?: string }> = ({ value, label, color = "bg-amber-500" }) => {
  return (
    <div className="flex flex-col gap-1 w-full font-mono text-xs">
      <div className="flex justify-between text-stone-400 uppercase">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-4 bg-stone-800 border border-stone-600 relative overflow-hidden">
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-20">
            {[...Array(10)].map((_, i) => <div key={i} className="w-[1px] h-full bg-white"></div>)}
        </div>
        <div 
          className={`h-full ${color} transition-all duration-500`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
