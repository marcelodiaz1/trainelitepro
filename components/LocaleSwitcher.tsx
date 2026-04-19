'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function LocaleSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  if (!pathname) return null;

  const switchLanguage = (newLocale: string) => {
    // 1. Split the path into segments
    const segments = pathname.split('/')
    
    // 2. The locale is always at index 1 because the path starts with /
    // Example: /en/pricing -> ["", "en", "pricing"]
    segments[1] = newLocale
    
    // 3. Join them back together
    const newPath = segments.join('/')
    
    // 4. Use router.push to navigate to the clean absolute path
    router.push(newPath)
  }

  // To highlight the active button, we find the locale from the URL
  const currentLocale = pathname.split('/')[1]

  return (
    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
      {['en', 'es', 'zh'].map((lang) => (
        <button
          key={lang}
          onClick={() => switchLanguage(lang)}
          className={`px-3 py-1 text-xs font-bold rounded-lg uppercase transition-all ${
            currentLocale === lang 
              ? "bg-[#ff6b1a] text-white" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}