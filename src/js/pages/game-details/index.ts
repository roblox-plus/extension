import { addBadgeAwardedDates } from './badgeAwardDates';
import '../../../css/pages/game-details.scss';

setInterval(async () => {
  try {
    await addBadgeAwardedDates();
  } catch (e) {
    console.error(e);
  }
}, 500);
