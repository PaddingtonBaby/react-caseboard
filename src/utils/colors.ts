export const PRESET_CARD_COLORS = [
  '#fef3c7',
  '#bbf7d0',
  '#bfdbfe',
  '#fecdd3',
  '#ddd6fe',
  '#fed7aa',
] as const;

export type PresetCardColor = (typeof PRESET_CARD_COLORS)[number];

export const isValidHex = (color: string | undefined): color is string =>
  typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color);

const hexLuminance = (hex: string): number => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const linearize = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
};

export const isDarkColor = (hex: string): boolean => hexLuminance(hex) < 0.35;

export const lightenHex = (hex: string, amount: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `#${mix(r).toString(16).padStart(2, '0')}${mix(g).toString(16).padStart(2, '0')}${mix(b).toString(16).padStart(2, '0')}`;
};
