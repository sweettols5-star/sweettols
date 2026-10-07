/** wa.me link; the number is stored however the owner typed it. */
export function whatsappUrl(number: string, text = ''): string {
  let d = number.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = `212${d.slice(1)}`;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
