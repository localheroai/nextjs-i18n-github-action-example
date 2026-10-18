import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getTranslations} from 'next-intl/server';
import Link from 'next/link';
import {routing} from '@/i18n/routing';
import './globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata() {
  const t = await getTranslations('TeamSettings');

  return {
    title: t('title')
  };
}

function languageName(locale: string) {
  return new Intl.DisplayNames([locale], {type: 'language'}).of(locale);
}

export default async function LocaleLayout({
  children
}: LayoutProps<'/[locale]'>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        <nav className="locales">
          {routing.locales.map((code) => (
            <Link
              key={code}
              href={`/${code}`}
              aria-current={code === locale ? 'page' : undefined}
            >
              {languageName(code)}
            </Link>
          ))}
        </nav>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
