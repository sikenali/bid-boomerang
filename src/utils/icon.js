export function riToCompName(riClass) {
  const parts = riClass.replace('ri-', '').split('-');
  return 'Ri' + parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}
