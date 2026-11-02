/**
 * One list drives both navbars. `mobile` marks the five that fit the bottom
 * bar; the rest are reached from the menu.
 */
export const NAV_ITEMS = [
  { to: '/', label: 'Beranda', de: 'Start', icon: 'home', mobile: true, end: true },
  { to: '/vokabeln', label: 'Kosakata', de: 'Vokabeln', icon: 'cards', mobile: true },
  { to: '/artikel', label: 'Artikel', de: 'der/die/das', icon: 'tag', mobile: true },
  { to: '/konjugation', label: 'Konjugasi', de: 'Konjugation', icon: 'verb' },
  { to: '/grammatik', label: 'Tata bahasa', de: 'Grammatik', icon: 'book' },
  { to: '/hoeren', label: 'Mendengar', de: 'Hören', icon: 'ear' },
  { to: '/quiz', label: 'Kuis', de: 'Quiz', icon: 'quiz', mobile: true },
  { to: '/fortschritt', label: 'Progres', de: 'Fortschritt', icon: 'chart', mobile: true },
]
