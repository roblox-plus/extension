import { cloneElement, Fragment, useEffect, useMemo, useState } from 'react';

type VerticalTabsInput = {
  children: JSX.Element[];
};

function VerticalTabs({ children }: VerticalTabsInput) {
  const [selectedTab, setSelectedTab] = useState<string>('');

  const tabs = useMemo<JSX.Element[]>(
    () =>
      children.map((child) => {
        // Is it a sin to clone the tabs to change their properties before rendering?
        return (
          <Fragment key={child.props.label}>
            {cloneElement(child, {
              active: child.props.label === selectedTab,
              onClick: () => setSelectedTab(child.props.label),
            })}
          </Fragment>
        );
      }),
    [selectedTab]
  );

  const tabContent = useMemo<JSX.Element>(() => {
    // Is it beautiful.. or cursed?
    for (let i = 0; i < children.length; i++) {
      if (children[i].props.label === selectedTab) {
        return children[i].props.children;
      }
    }

    return <Fragment />;
  }, [selectedTab]);

  useEffect(() => {
    setSelectedTab(children[0]?.props.label || '');
  }, []);

  return (
    <Fragment>
      <ul className='menu-vertical'>{tabs}</ul>
      <div className='tab-content rbx-tab-content'>{tabContent}</div>
    </Fragment>
  );
}

export default VerticalTabs;
