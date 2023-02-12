import TranslationResource from '../types/translationResource';
import { BatchedPromise } from '../utils/batchedPromise';
import { getAuthenticatedUser } from './usersService';

const getUserLocale = BatchedPromise<string>(
  {
    maxBatchSize: 1,
    cacheDuration: 2 * 60 * 1000,
    backgroundServiceKey: 'localizationService.getUserLocale',
  },
  async (userIds) => {
    // user id taken in as a cache buster
    const response = await fetch(
      `https://locale.roblox.com/v1/locales/user-locale`
    );

    if (!response.ok) {
      console.warn(
        'Failed to fetch user locale - defaulting to English.',
        response.status
      );

      return ['en_us'];
    }

    const result = await response.json();
    return [result.supportedLocale.locale];
  }
);

const getTranslationResources = BatchedPromise<TranslationResource[]>(
  {
    maxBatchSize: 1,
    cacheDuration: 24 * 60 * 60 * 1000,
    backgroundServiceKey: 'localizationService.getTranslationResources',
  },
  async (locales) => {
    // user id taken in as a cache buster
    const response = await fetch(
      `https://translations.roblox.com/v1/translations?consumerType=Web`
    );

    if (!response.ok) {
      throw new Error(`Failed to load user locale (${response.status})`);
    }

    const result = await response.json();
    const resourcesUrl =
      result.data.find((r: any) => r.locale === locales[0]) ||
      result.data.find((r: any) => r.locale === 'en_us');
    const resources = await fetch(resourcesUrl.url);
    const resourcesJson = await resources.json();

    return [
      resourcesJson.contents.map((r: any) => {
        return {
          namespace: r.namespace,
          key: r.key,
          value: r.translation || r.english,
        };
      }),
    ];
  }
);

const getTranslationResource = async (
  namespace: string,
  key: string
): Promise<string> => {
  const authenticatedUser = await getAuthenticatedUser();
  const locale = await getUserLocale(authenticatedUser?.id ?? 0);
  const translationResources = await getTranslationResources(locale);
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

export { getTranslationResource };
