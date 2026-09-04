export type Language = 'en' | 'ta';

export const getProductName = (product: any, language: Language = 'en'): string => {
  if (!product) return '';
  if (language === 'ta' && product.name_ta) return product.name_ta;
  if (product.name_en) return product.name_en;
  return product.name || '';
};

export const getCategoryName = (category: any, language: Language = 'en'): string => {
  if (!category) return '';
  if (language === 'ta' && category.name_ta) return category.name_ta;
  if (category.name_en) return category.name_en;
  return category.name || '';
};

export const getProductDescription = (product: any, language: Language = 'en'): string => {
  if (!product) return '';
  if (language === 'ta' && product.description_ta) return product.description_ta;
  if (product.description_en) return product.description_en;
  return product.description || '';
};
