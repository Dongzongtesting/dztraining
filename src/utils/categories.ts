export interface CourseCategory {
  id: string; // unique code/slug, e.g., 'internal'
  nameZh: string;
  nameEn: string;
}

export const DEFAULT_CATEGORIES: CourseCategory[] = [
  { id: 'internal', nameZh: '内部培训', nameEn: 'Internal Training' },
  { id: 'external', nameZh: '外部培训', nameEn: 'External Training' },
  { id: 'seminar', nameZh: '研讨座谈会', nameEn: 'Seminar' },
  { id: 'workshop', nameZh: '工作坊及研习班', nameEn: 'Workshop' },
  { id: 'conference', nameZh: '学术会议', nameEn: 'Conference' },
  { id: 'online', nameZh: '线上自学 / MOOC 自主修读', nameEn: 'Online Course' }
];

export function getCategories(): CourseCategory[] {
  const stored = localStorage.getItem('dz_training_categories');
  if (!stored) {
    localStorage.setItem('dz_training_categories', JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: CourseCategory[]) {
  localStorage.setItem('dz_training_categories', JSON.stringify(categories));
}

export function getCategoryLabel(id: string, lang: 'zh' | 'en'): string {
  const categories = getCategories();
  const match = categories.find(c => c.id.toLowerCase() === id.toLowerCase());
  if (match) {
    return lang === 'zh' ? match.nameZh : match.nameEn;
  }
  // Fallback to capitalizing first letter of code
  return id ? id.charAt(0).toUpperCase() + id.slice(1) : '';
}
