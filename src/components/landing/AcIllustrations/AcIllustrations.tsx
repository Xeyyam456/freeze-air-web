import type { AcIllustrationProps } from "@/types/site";
// Kondisioner növlərinin sadə illüstrasiyaları (marka yox, növ)
const INK = "#06192B";
const ICE = "#CFE8F3";
const COLD = "#00A3D9";

// Divar tipli split (daxili blok)
export function SplitUnit({ className }: AcIllustrationProps) {
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="Divar tipli split kondisioner">
      <rect x="10" y="22" width="220" height="64" rx="18" fill="#fff" stroke={INK} strokeWidth="2.5" />
      <path d="M22 70 H218" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="30" y="74" width="180" height="6" rx="3" fill={ICE} />
      <circle cx="196" cy="42" r="3" fill={COLD} />
      <rect x="160" y="38" width="26" height="8" rx="2" fill={ICE} />
      <path d="M50 96 q20 8 40 0 M110 100 q20 8 40 0 M80 110 q20 8 40 0" stroke={COLD} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// Kaset tipli (tavana quraşdırılan, aşağıdan görünüş)
export function CassetteUnit({ className }: AcIllustrationProps) {
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="Kaset tipli kondisioner">
      <rect x="70" y="10" width="100" height="100" rx="12" fill="#fff" stroke={INK} strokeWidth="2.5" />
      <rect x="96" y="36" width="48" height="48" rx="6" fill={ICE} stroke={INK} strokeWidth="2" />
      {[44, 52, 60, 68, 76].map((y) => <path key={y} d={`M102 ${y} H138`} stroke={INK} strokeWidth="1.5" opacity="0.5" />)}
      <rect x="82" y="20" width="76" height="8" rx="4" fill={COLD} opacity="0.8" />
      <rect x="82" y="92" width="76" height="8" rx="4" fill={COLD} opacity="0.8" />
      <rect x="78" y="34" width="8" height="52" rx="4" fill={COLD} opacity="0.8" />
      <rect x="154" y="34" width="8" height="52" rx="4" fill={COLD} opacity="0.8" />
    </svg>
  );
}

// Döşəmə-tavan tipli
export function FloorCeilingUnit({ className }: AcIllustrationProps) {
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="Döşəmə-tavan tipli kondisioner">
      <rect x="14" y="30" width="212" height="56" rx="10" fill="#fff" stroke={INK} strokeWidth="2.5" />
      <rect x="28" y="66" width="184" height="12" rx="4" fill={ICE} stroke={INK} strokeWidth="1.5" />
      {[44, 68, 92, 116, 140, 164, 188].map((x) => <path key={x} d={`M${x} 68 V76`} stroke={INK} strokeWidth="1.5" opacity="0.5" />)}
      <circle cx="200" cy="46" r="3" fill={COLD} />
      <path d="M60 98 q20 8 40 0 M140 98 q20 8 40 0" stroke={COLD} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// Kanal tipli (tavan arxasında gizli blok + barmaqlıq)
export function DuctedUnit({ className }: AcIllustrationProps) {
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="Kanal tipli kondisioner">
      <path d="M10 30 H230" stroke={INK} strokeWidth="2.5" strokeDasharray="6 6" opacity="0.4" />
      <rect x="40" y="8" width="110" height="44" rx="6" fill="#fff" stroke={INK} strokeWidth="2.5" />
      <path d="M150 22 H200 V60" stroke={INK} strokeWidth="10" fill="none" strokeLinejoin="round" opacity="0.15" />
      <path d="M150 22 H200 V60" stroke={INK} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <rect x="176" y="60" width="48" height="16" rx="3" fill={ICE} stroke={INK} strokeWidth="2" />
      {[184, 192, 200, 208, 216].map((x) => <path key={x} d={`M${x} 63 V73`} stroke={INK} strokeWidth="1.5" opacity="0.6" />)}
      <path d="M186 88 q14 6 28 0 M180 100 q20 8 40 0" stroke={COLD} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// Xarici blok
export function OutdoorUnit({ className }: AcIllustrationProps) {
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="Kondisionerin xarici bloku">
      <rect x="50" y="12" width="140" height="92" rx="10" fill="#fff" stroke={INK} strokeWidth="2.5" />
      <circle cx="104" cy="58" r="32" fill={ICE} stroke={INK} strokeWidth="2.5" />
      <circle cx="104" cy="58" r="22" fill="none" stroke={INK} strokeWidth="1.5" opacity="0.4" />
      <path d="M104 58 l12 -16 M104 58 l14 12 M104 58 l-18 4" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="104" cy="58" r="4" fill={INK} />
      {[24, 34, 44, 54, 64, 74, 84].map((y) => <path key={y} d={`M148 ${y} H178`} stroke={INK} strokeWidth="1.5" opacity="0.5" />)}
      <rect x="60" y="104" width="16" height="8" rx="2" fill={INK} />
      <rect x="164" y="104" width="16" height="8" rx="2" fill={INK} />
    </svg>
  );
}

export const AC_ILLUSTRATION = {
  split: SplitUnit,
  cassette: CassetteUnit,
  floor: FloorCeilingUnit,
  ducted: DuctedUnit,
  outdoor: OutdoorUnit,
};
