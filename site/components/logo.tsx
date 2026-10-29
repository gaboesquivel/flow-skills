export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="flow-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9ea6f8" />
          <stop offset="0.55" stopColor="#c6a8f6" />
          <stop offset="1" stopColor="#f0a6cf" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#flow-mark-bg)" />
      <path d="M16 5.5 26.5 16 16 26.5 5.5 16Z" fill="#17121f" />
      <path d="M16 10.5 21.5 16 16 21.5 10.5 16Z" fill="#c9b8ff" />
      <path d="M16 13.6 18.4 16 16 18.4 13.6 16Z" fill="#17121f" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={compact ? "size-5" : "size-8"} />
      <span className="headline text-[1.45rem] leading-none text-fg">
        flow <span className="font-bold text-violet">/</span>
      </span>
    </span>
  );
}
