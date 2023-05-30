const getBucketedDate = (date: Date, startDate: Date, endDate: Date) => {
  if (endDate.getTime() - startDate.getTime() > 8 * 24 * 60 * 60 * 1000) {
    // More than 1 week selected, bucket by day.
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // Less than 1 week selected, bucket by hour.
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours()
  );
};

export default getBucketedDate;
