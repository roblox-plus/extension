const getSEOLink = (id: number, name: string, path: string): URL => {
  if (!name) {
    name = 'redirect';
  } else {
    name =
      name
        .replace(/'/g, '')
        .replace(/\W+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '') || 'redirect';
  }

  return new URL(`https://www.roblox.com/${path}/${id}/${name}`);
};

const getCatalogLink = (assetId: number, assetName: string): URL => {
  return getSEOLink(assetId, assetName, 'catalog');
};

const getLibraryLink = (assetId: number, assetName: string): URL => {
  return getSEOLink(assetId, assetName, 'library');
};

export { getCatalogLink, getLibraryLink };
