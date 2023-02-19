type BannerType = 'success' | 'warning';

const getSystemFeedbackContainer = (): HTMLElement => {
  const systemFeedbackContainer = document.querySelector('.system-feedback');
  if (systemFeedbackContainer instanceof HTMLElement) {
    return systemFeedbackContainer;
  }

  const container = document.createElement('div');
  container.setAttribute('class', 'system-feedback');
  document.body.appendChild(container);

  return container;
};

const createBanner = (text: string, bannerType: BannerType) => {
  const systemFeedbackContainer = getSystemFeedbackContainer();
  const container = document.createElement('div');
  container.classList.add('alert-system-feedback');
  systemFeedbackContainer?.appendChild(container);

  const label = document.createElement('div');
  label.innerText = text;
  label.setAttribute('class', `alert alert-${bannerType}`);
  container.appendChild(label);

  return label;
};

const showBanner = (text: string, bannerType: BannerType, timeout: number) => {
  const banner = createBanner(text, bannerType);

  setTimeout(() => {
    banner.classList.remove('on');

    setTimeout(() => {
      banner.parentElement?.remove();
    }, 10 * 1000);
  }, timeout);

  setTimeout(() => {
    banner.classList.add('on');
  }, 100);
};

const showErrorBanner = (text: string, timeout: number) => {
  showBanner(text, 'warning', timeout);
};

const showSuccessBanner = (text: string, timeout: number) => {
  showBanner(text, 'success', timeout);
};

export { showErrorBanner, showSuccessBanner };
