type TabInput = {
  label: string;

  active?: boolean;

  onClick?: () => void;

  children: JSX.Element;
};

function Tab({ label, active, onClick }: TabInput) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <li className={`menu-option${active ? ' active' : ''}`}>
      <a className='menu-option-content' onClick={handleClick}>
        <span className='font-caption-header'>{label}</span>
      </a>
    </li>
  );
}

export default Tab;
