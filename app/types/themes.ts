export interface Theme {
  id: string;
  name: string;
  bg: string;
  card: string;
  border: string;
  text: string;
  subtext: string;
  nav: string;
}

export const themes: Theme[] = [
  {
    id: 'dark',
    name: 'Dark',
    bg: 'bg-[#0d1117]',
    card: 'bg-[#161b22]/80',
    border: 'border-[#30363d]/60',
    text: 'text-white',
    subtext: 'text-[#8b949e]',
    nav: 'bg-[#0d1117] border-[#21262d]',
  },
  {
    id: 'military',
    name: 'Military',
    bg: 'bg-zinc-900',
    card: 'bg-zinc-800/60',
    border: 'border-zinc-700/50',
    text: 'text-green-100',
    subtext: 'text-zinc-400',
    nav: 'bg-zinc-950 border-zinc-800',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    bg: 'bg-blue-950',
    card: 'bg-blue-900/40',
    border: 'border-blue-800/50',
    text: 'text-blue-50',
    subtext: 'text-blue-300',
    nav: 'bg-blue-950 border-blue-900',
  },
 {
  id: 'light',
  name: 'Light',
  bg: 'bg-slate-50',
  card: 'bg-white',
  border: 'border-emerald-200',
  text: 'text-slate-900',
  subtext: 'text-slate-500',
  nav: 'bg-white border-emerald-100 shadow-sm',
}, 
];
