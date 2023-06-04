import Group from '../../../types/group';
import { Thumbnail } from 'roblox';

// Group information, specifically detailed for the roblox.plus domain.
type DetailedGroup = Group & {
  // The group icon.
  thumbnail: Thumbnail;
};

export default DetailedGroup;
