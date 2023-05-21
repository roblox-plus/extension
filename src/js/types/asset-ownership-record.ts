import User from './user';

type AssetOwnershipRecord = {
  // A unique identifier for the ownership record.
  id: number;

  // The user that owns the item.
  user: User | null;

  // The serial number of the owned item.
  serialNumber: number;

  // When the item was first purchased.
  created: Date;

  // When the ownership record was last updated.
  updated: Date;
};

export default AssetOwnershipRecord;
