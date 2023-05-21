import { useEffect, useRef } from 'react';

type SearchInput = {
  value: string;

  setValue: (value: string) => void;
};

export default function Search({ value, setValue }: SearchInput) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div className="form-group">
      <input
        className="form-control input-field"
        type="text"
        placeholder="Paste user profile link here..."
        ref={inputRef}
        defaultValue={value}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            setValue(e.currentTarget.value);
          }
        }}
        onBlur={(e) => {
          e.currentTarget.value = value;
        }}
      />
    </div>
  );
}
