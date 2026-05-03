

export function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-3xl p-5 md:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 ${className}`} style={style}>
      {children}
    </div>
  );
}
