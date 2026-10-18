import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'sv', 'pl', 'de'],
  defaultLocale: 'en'
});
