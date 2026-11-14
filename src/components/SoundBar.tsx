import { Volume2, VolumeX } from 'lucide-react';

interface SoundBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export function SoundBar({ isMuted, onToggleMute }: SoundBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <span aria-hidden="true">🎵</span>
        <span>Nhạc và hiệu ứng âm thanh</span>
      </div>

      <button
        type="button"
        onClick={onToggleMute}
        aria-pressed={isMuted}
        aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap shrink-0 ${
          isMuted
            ? 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
            : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
        }`}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        ) : (
          <Volume2 className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
        )}
        <span>{isMuted ? 'Tắt âm thanh' : 'Bật âm thanh'}</span>
      </button>
    </div>
  );
}
