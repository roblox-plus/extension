import AssetOwnershipRecord from '../../types/asset-ownership-record';
import { getUserById } from '../users';

type OwnershipRecordsPage = {
  data: AssetOwnershipRecord[];

  nextPageCursor: string;
};

const getAssetOwners = async (
  assetId: number,
  cursor: string,
  isAscending: boolean
): Promise<OwnershipRecordsPage> => {
  const response = await fetch(
    `https://inventory.roblox.com/v2/assets/${assetId}/owners?limit=100&cursor=${cursor}&sortOrder=${
      isAscending ? 'Asc' : 'Desc'
    }`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load ownership records (${assetId}, ${cursor}, ${isAscending})`
    );
  }

  const result = await response.json();
  const ownershipRecords: AssetOwnershipRecord[] = [];

  await Promise.all(
    result.data.map(async (i: any) => {
      const record: AssetOwnershipRecord = {
        id: i.id,
        user: null,
        serialNumber: i.serialNumber || NaN,
        created: new Date(i.created),
        updated: new Date(i.updated),
      };

      ownershipRecords.push(record);

      if (i.owner) {
        record.user = await getUserById(i.owner.id);
      }
    })
  );

  return {
    nextPageCursor: result.nextPageCursor || '',
    data: ownershipRecords,
  };
};

export type { OwnershipRecordsPage };
export default getAssetOwners;
