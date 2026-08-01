
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGrowBadgeClass(text: string | number | undefined | null, siblingText: string | number | undefined | null, threshold: number = 14): string {
  const len = text !== undefined && text !== null ? String(text).length : 0;
  const siblingLen = siblingText !== undefined && siblingText !== null ? String(siblingText).length : 0;
  const isShort = len > 0 && len <= threshold;
  const siblingIsShort = siblingLen <= threshold;

  // Only let this badge grow to fill the card's width when its sibling is
  // short (or absent) AND this one isn't itself short — otherwise keep the
  // normal compact, capped-at-50% look so two short/long badges don't look odd.
  if (siblingIsShort && !isShort) {
    return 'flex-1 max-w-full min-w-0';
  }
  return 'flex-none max-w-[50%] min-w-0';
}

export function getInitials(name: string | undefined): string {
  if (!name) return '';
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  if (nameParts.length === 0) return '';
  return nameParts[0].substring(0, 1).toUpperCase();
}

export function slugify(text: string): string {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars except for Arabic letters
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export const programTypes = [
    { value: 'work', label: 'عقد عمل', icon: 'FileSignature', color: '#00897B' },
    { value: 'study', label: 'دراسة', icon: 'BookOpen', color: '#8E24AA' },
    { value: 'seasonal', label: 'عمل موسمي', icon: 'Leaf', color: '#43A047' },
    { value: 'training', label: 'تدريب', icon: 'Award', color: '#FB8C00' },
    { value: 'volunteer', label: 'تطوع', icon: 'Handshake', color: '#d946ef' },
    { value: 'crafts', label: 'المهن اليدوية والحرفية', icon: 'Hammer', color: '#6D4C41' },
    { value: 'health', label: 'خدمات صحية ورعاية', icon: 'Stethoscope', color: '#E53935' },
    { value: 'tech', label: 'التقنية والمكتبي', icon: 'Laptop', color: '#1E88E5' },
    { value: 'transport', label: 'النقل والخدمات', icon: 'Truck', color: '#F4511E' },
    { value: 'hospitality', label: 'الضيافة والتجارة', icon: 'ShoppingCart', color: '#546E7A' },
    { value: 'education', label: 'التعليم', icon: 'School', color: '#3949AB' },
    { value: 'agriculture', label: 'الفلاحة والزراعة', icon: 'Sprout', color: '#7CB342' },
    { value: 'livestock', label: 'العمل في المزارع', icon: 'Home', color: '#8d6e63' },
    { value: 'beauty', label: 'الحلاقة والتجميل', icon: 'Scissors', color: '#ec4899' },
];

export function getProgramTypeDetails(programType: string) {
    const details = programTypes.find(p => p.value === programType);
    if (details) {
        return details;
    }
    // Handle custom program types
    return { value: programType, label: programType, icon: 'Plane', color: '#0ea5e9' };
}
