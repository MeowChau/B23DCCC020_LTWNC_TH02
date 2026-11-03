import type { SVGProps } from 'react';

const paths = {
  dumbbell: 'M3 9v6m4-9v12m10-12v12m4-9v6M7 12h10',
  library: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  saved: 'M6 3h12v18l-6-4-6 4V3Z',
  routines: 'M9 5h12M9 12h12M9 19h12M3 5h.01M3 12h.01M3 19h.01',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  clock: 'M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  play: 'm8 5 11 7-11 7V5Z',
  pause: 'M9 5v14M15 5v14',
  previous: 'M5 5v14m14-14L8 12l11 7V5Z',
  next: 'M19 5v14M5 5l11 7-11 7V5Z',
  plus: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  edit: 'm15 4 5 5M3 21l5-1L21 7a2 2 0 0 0-4-4L4 16l-1 5Z',
  moon: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
  sun: 'M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
} as const;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: keyof typeof paths;
}

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={paths[name]} />
    </svg>
  );
}
