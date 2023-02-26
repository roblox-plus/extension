import '../../../css/pages/games-list.scss';

const rankAttribute = 'rplus-rank-indicator';

const getTileRank = (gameTile: HTMLElement, index: number) => {
  if (gameTile.previousElementSibling instanceof HTMLElement) {
    const indicator = Number(
      gameTile.previousElementSibling.getAttribute(rankAttribute) || NaN
    );
    if (!isNaN(indicator)) {
      return indicator + 1;
    }
  }

  return index + 1;
};

const addRankIndicator = (gameTile: HTMLElement, index: number) => {
  const rank = getTileRank(gameTile, index);
  gameTile.setAttribute(rankAttribute, `${rank}`);

  const thumbnail = gameTile.querySelector('.game-card-link');
  if (thumbnail instanceof HTMLElement) {
    const rankContainer = document.createElement('div');
    rankContainer.setAttribute('class', 'rplus-rank-indicator');

    const rankIndicator = document.createElement('b');
    rankIndicator.innerText = `#${rank.toLocaleString()}`;
    rankContainer.appendChild(rankIndicator);

    thumbnail.appendChild(rankContainer);
  }
};

setInterval(() => {
  document
    .querySelectorAll('ul.game-cards.game-tile-list')
    .forEach((gameList, i) => {
      gameList
        .querySelectorAll(
          `li.list-item.game-card.game-tile:not([${rankAttribute}])`
        )
        .forEach((e, i) => {
          if (e instanceof HTMLElement) {
            addRankIndicator(e, i);
          }
        });
    });

  document
    .querySelectorAll(
      `div.grid-item-container.game-card-container:not([${rankAttribute}])`
    )
    .forEach((e, i) => {
      if (e instanceof HTMLElement) {
        addRankIndicator(e, i);
      }
    });
}, 500);
