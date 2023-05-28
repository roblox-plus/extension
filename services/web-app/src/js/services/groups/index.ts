import ThumbnailState from '../../enums/thumbnailState';
import Group from '../../types/group';

const getAuthenticatedUserGroups = (): Promise<Group[]> => {
  const groups: Group[] = [];
  document.querySelectorAll('#rplus-groups>meta').forEach((element) => {
    if (!(element instanceof HTMLMetaElement)) {
      return;
    }

    groups.push({
      id: Number(element.dataset.groupId),
      name: element.dataset.groupName || '',
      icon: {
        state: element.dataset.groupIcon
          ? ThumbnailState.Completed
          : ThumbnailState.Error,
        imageUrl: element.dataset.groupIcon || '',
      },
      manager: element.dataset.groupManager === 'true',
      primary: element.dataset.groupPrimary === 'true',
    });
  });

  return Promise.resolve(
    groups.sort((a, b) => {
      if (a.primary) {
        return -1;
      } else if (b.primary) {
        return 1;
      }

      return a.name < b.name ? -1 : 1;
    })
  );
};

export { getAuthenticatedUserGroups };
