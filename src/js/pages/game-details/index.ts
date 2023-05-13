import { addBadgeAwardedDates } from './badgeAwardDates';
import updateVoteTitle from './vote-percentage';
import './premium-notice';
import '../../../css/pages/game-details.scss';

setInterval(async () => {
  try {
    updateVoteTitle(
      document.querySelector('#vote-up-text'),
      document.querySelector('#vote-down-text')
    );
  } catch (e) {
    console.error(e);
  }

  try {
    await addBadgeAwardedDates();
  } catch (e) {
    console.error(e);
  }
}, 500);
