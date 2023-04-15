type TranslationResource = {
  // The namespace the translation resource belongs to.
  namespace: string;

  // The translation resource key.
  key: string;

  // The actual translated string.
  value: string;
};

export default TranslationResource;
