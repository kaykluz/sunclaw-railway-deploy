export function SunClawIcon({ size = 32, withFace = true }: { size?: number; withFace?: boolean }) {
  return (
    <svg viewBox="10 4 100 76" fill="none" width={size} height={size * 0.75}>
      <circle cx="60" cy="54" r="26" fill="#F5A623"/>
      <path d="M44 26 C42 18, 38 13, 33 12 C28 11, 26 15, 28 19 C30 23, 34 26, 38 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="33" cy="11" r="3" fill="#E8664A"/>
      <path d="M76 26 C78 18, 82 13, 87 12 C92 11, 94 15, 92 19 C90 23, 86 26, 82 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="87" cy="11" r="3" fill="#E8664A"/>
      <line x1="30" y1="50" x2="18" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="90" y1="50" x2="102" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      {withFace && (
        <>
          <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
          <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
          <circle cx="52.2" cy="48.8" r="1.3" fill="#FFF"/>
          <circle cx="70.2" cy="48.8" r="1.3" fill="#FFF"/>
          <path d="M52 60 Q60 66 68 60" stroke="#1A1612" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </>
      )}
    </svg>
  );
}

export function SunClawFullIcon({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width={size} height={size}>
      <circle cx="60" cy="54" r="26" fill="#F5A623"/>
      <path d="M44 26 C42 18, 38 13, 33 12 C28 11, 26 15, 28 19 C30 23, 34 26, 38 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="33" cy="11" r="3" fill="#E8664A"/>
      <path d="M76 26 C78 18, 82 13, 87 12 C92 11, 94 15, 92 19 C90 23, 86 26, 82 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="87" cy="11" r="3" fill="#E8664A"/>
      <line x1="30" y1="50" x2="18" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="90" y1="50" x2="102" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="30" y1="60" x2="16" y2="64" stroke="#E8664A" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <line x1="90" y1="60" x2="104" y2="64" stroke="#E8664A" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <line x1="46" y1="78" x2="42" y2="92" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <line x1="60" y1="80" x2="60" y2="96" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <line x1="74" y1="78" x2="78" y2="92" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="52.2" cy="48.8" r="1.3" fill="#FFF"/>
      <circle cx="70.2" cy="48.8" r="1.3" fill="#FFF"/>
      <path d="M52 60 Q60 66 68 60" stroke="#1A1612" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function SunClawWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold text-[22px] tracking-tight ${className}`}>
      <span className="text-sun-gold">Sun</span><span className="text-lobster-coral">Claw</span>
    </span>
  );
}

export function SunClawLogoLockup({ iconSize = 32 }: { iconSize?: number }) {
  return (
    <a href="/" className="flex items-center gap-1.5 no-underline">
      <SunClawIcon size={iconSize} />
      <SunClawWordmark />
    </a>
  );
}
