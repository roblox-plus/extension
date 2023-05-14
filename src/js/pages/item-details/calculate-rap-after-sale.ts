const calculateRecentAveragePriceAfterSale = (
  currentAveragePrice: number,
  priceToSellFor: number
): number => {
  if (currentAveragePrice === priceToSellFor) {
    return currentAveragePrice;
  }

  if (currentAveragePrice <= 0) {
    return priceToSellFor;
  }

  return (currentAveragePrice > priceToSellFor ? Math.floor : Math.ceil)(
    currentAveragePrice * 0.9 + priceToSellFor * 0.1
  );
};

export default calculateRecentAveragePriceAfterSale;
