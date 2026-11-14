interface HeroBannerProps {
  compact?: boolean;
}

export function HeroBanner({ compact = false }: HeroBannerProps) {
  return (
    <header
      className={`w-full rounded-2xl bg-gradient-to-br from-[#1D4ED8] via-[#4338CA] to-[#6D28D9] text-center text-white shadow-md ${
        compact ? 'px-5 py-4' : 'px-5 py-6 sm:px-8 sm:py-7'
      }`}
    >
      <div
        aria-hidden="true"
        className={`flex items-center justify-center gap-2 ${compact ? 'text-lg' : 'text-2xl sm:text-3xl'}`}
      >
        <span>🏆</span>
        <span>⭐</span>
        <span>🎯</span>
      </div>

      <h1
        className={`font-display font-extrabold tracking-tight uppercase ${
          compact ? 'mt-1 text-xl sm:text-2xl' : 'mt-2 text-2xl sm:text-4xl'
        }`}
      >
        <span className="block text-white">ĐẤU TRƯỜNG</span>
        <span className="block text-[#FDE047]">SIÊU TRÍ NHỚ</span>
      </h1>

      {!compact ? (
        <p key="hero-subtitle" className="mt-2 text-sm font-medium text-blue-100 sm:text-base">
          Nhanh tay – Nhanh trí – Chinh phục bảng nhân chia!
        </p>
      ) : null}
    </header>
  );
}
