// components/LocalizedLink.tsx
"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LocalizedLink({ href, children, ...props }: any) {
  const { lang } = useParams();
  
  const isExternal = href.startsWith('http');
  // Check if the link already includes a locale prefix (e.g., /en/ or /es/)
  const hasLocale = /^\/(en|es|zh)(\/|$)/.test(href); 

  const localizedHref = isExternal || hasLocale 
    ? href 
    : `/${lang}${href.startsWith('/') ? href : `/${href}`}`;

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
}