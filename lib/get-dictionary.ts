const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
  es: () => import('@/dictionaries/es.json').then((m) => m.default),
  zh: () => import('@/dictionaries/zh.json').then((m) => m.default),
}

// 1. Definimos un tipo basado en las llaves de nuestro objeto
type Locale = keyof typeof dictionaries;

// 2. Usamos ese tipo para que acepte 'en', 'es' y 'zh'
export const getDictionary = async (locale: Locale) => {
  // Verificación de seguridad por si llega un locale que no existe
  if (!dictionaries[locale]) {
    return dictionaries.en(); 
  }
  
  return dictionaries[locale]();
}
