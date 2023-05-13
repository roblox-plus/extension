const updateVoteTitle = (
  upvoteSpan: Element | null,
  downvoteSpan: Element | null
) => {
  const upvoteCount = Number(upvoteSpan?.getAttribute('title'));
  const downvoteCount = Number(downvoteSpan?.getAttribute('title'));
  if (
    isNaN(upvoteCount) ||
    isNaN(downvoteCount) ||
    upvoteCount + downvoteCount < 1
  ) {
    return;
  }

  upvoteSpan?.setAttribute('title', upvoteCount.toLocaleString());
  downvoteSpan?.setAttribute('title', downvoteCount.toLocaleString());

  const percentage =
    downvoteCount < 1
      ? 100
      : (100 / (upvoteCount + downvoteCount)) * upvoteCount;

  if (upvoteSpan?.parentElement?.parentElement) {
    const percentageSpan = document.createElement('span');
    percentageSpan.classList.add('count-middle');
    percentageSpan.setAttribute(
      'title',
      `${
        percentage === 100 ? 100 : percentage.toFixed(3)
      }% of players recommend this game`
    );
    percentageSpan.innerText = `${Math.floor(percentage)}%`;

    upvoteSpan.closest('.vote-summary')?.prepend(percentageSpan);
  }
};

export default updateVoteTitle;
