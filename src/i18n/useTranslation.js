import { useLocale } from './LocaleContext.jsx';

export const useTranslation = () => {
    const { t, locale } = useLocale();
    return { t, locale };
};
