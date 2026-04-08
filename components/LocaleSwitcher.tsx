'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function LocaleSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  // Protección: si pathname es null, no renderizamos nada o usamos un valor seguro
  if (!pathname) return null;

  const segments = pathname.split('/')
  const currentLocale = segments[1] // El idioma es el primer segmento después de la barra

  const switchLanguage = (newLocale: string) => {
    const newSegments = [...segments]
    newSegments[1] = newLocale
    router.push(newSegments.join('/'))
  }

  return (
    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
      {['en', 'es', 'zh'].map((lang) => (
        <button
          key={lang}
          onClick={() => switchLanguage(lang)}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
            currentLocale === lang 
              ? "bg-[#ff6b1a] text-white" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
