enum ItemDetailsTab {
  Primary = 1,
  Resellers = 2,
  Dependencies = 3,
  Owners = 4,
}

type Tab = {
  label: string;
  value: ItemDetailsTab;
};

export type { Tab };
export default ItemDetailsTab;
