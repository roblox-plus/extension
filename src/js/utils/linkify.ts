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

const getIdFromUrl = (url: URL): number => {
  const match =
    url.pathname.match(
      /^\/(badges|games|game-pass|groups|catalog|library|users)\/(\d+)\//i
    ) || [];
  // Returns NaN if the URL doesn't match.
  return Number(match[2]);
};

export { getCatalogLink, getLibraryLink, getIdFromUrl };
