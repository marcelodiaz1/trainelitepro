import { getDictionary } from "@/lib/get-dictionary";
import EditProfileClient from "./EditProfileClient";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <EditProfileClient 
      dict={dict} 
      lang={lang} 
    />
  );
}