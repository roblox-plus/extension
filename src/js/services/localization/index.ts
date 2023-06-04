import { addListener, sendMessage } from '@tix-factory/extension-messaging';
import TranslationResource from '../../types/translationResource';

const englishLocale = 'en_us';
const messageDestination = 'localizationService.getTranslationResources';
let translationResourceCache: TranslationResource[] = [];
let localeCache: string = '';

// Gets the locale for the authenticated user.
const getAuthenticatedUserLocale = async (): Promise<string> => {
  if (localeCache) {
    return localeCache;
  }

  try {
    const response = await fetch(
      `https://locale.roblox.com/v1/locales/user-locale`
    );

    if (!response.ok) {
      console.warn(
        'Failed to fetch user locale - defaulting to English.',
        response.status
      );

      return (localeCache = englishLocale);
    }

    const result = await response.json();
    return (localeCache = result.supportedLocale.locale);
  } catch (e) {
    console.warn(
      'Unhandled error loading user locale - defaulting to English.',
      e
    );

    return (localeCache = englishLocale);
  }
};

// Fetches all the translation resources for the authenticated user.
const getTranslationResources = async (): Promise<TranslationResource[]> => {
  if (translationResourceCache.length > 0) {
    return translationResourceCache;
  }

  return (translationResourceCache = await sendMessage(messageDestination, {}));
};

// Fetches an individual translation resource.
const getTranslationResource = async (
  namespace: string,
  key: string
): Promise<string> => {
  const translationResources = await getTranslationResources();
  const resource = translationResources.find(
    (r: any) => r.namespace === namespace && r.key === key
  );

  if (!resource) {
    console.warn(
      `No translation resource available.\n\tNamespace: ${namespace}\n\tKey: ${key}`
    );
  }

  return resource?.value || '';
};

const getTranslationResourceWithFallback = async (
  namespace: string,
  key: string,
  defaultValue: string
) => {
  try {
    const value = await getTranslationResource(namespace, key);
    if (!value) {
      return defaultValue;
    }

    return value;
  } catch (e) {
    console.warn('Failed to load translation resource', namespace, key, e);
    return defaultValue;
  }
};

// Listener to ensure these always happen in the background, for strongest caching potential.
addListener(
  messageDestination,
  async () => {
    if (translationResourceCache.length > 0) {
      return translationResourceCache;
    }

    const locale = await getAuthenticatedUserLocale();
    const response = await fetch(
      `https://translations.roblox.com/v1/translations?consumerType=Web`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load translation resources (${response.status})`
      );
    }

    const result = await response.json();
    const resourcesUrl =
      result.data.find((r: any) => r.locale === locale) ||
      result.data.find((r: any) => r.locale === englishLocale);

    if (!resourcesUrl) {
      throw new Error(
        `Failed to find translation resources for locale (${locale})`
      );
    }

    const resources = await fetch(resourcesUrl.url);
    const resourcesJson = await resources.json();
    return (translationResourceCache = resourcesJson.contents.map((r: any) => {
      return {
        namespace: r.namespace,
        key: r.key,
        value: r.translation || r.english,
      };
    }));
  },
  {
    // Ensure that multiple requests for this information can't be processed at once.
    levelOfParallelism: 1,
  }
);

export { getTranslationResource, getTranslationResourceWithFallback };
