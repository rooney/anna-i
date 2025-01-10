import React, { forwardRef, MutableRefObject, useRef, useState } from 'react';
import css from './SearchBar.module.css'
import clsx from 'clsx';

interface SearchBarProps extends React.HTMLAttributes<HTMLFormElement> {
  placeholderText?: string;
  onSearch?: (_: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ placeholderText, className, onSubmit, onSearch, ...props }, ref) => {
    if (!ref) ref = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState<string>('');

    function focusOnSearch() {
      (ref as MutableRefObject<HTMLInputElement>).current.focus();
    }

    function submit(e: React.FormEvent<HTMLElement>) {
      e.preventDefault();
      if (onSubmit) onSubmit(e as React.FormEvent<HTMLFormElement>);
      if (onSearch) onSearch(input);
      setInput('');
    }

    return (
      <form {...props} onSubmit={submit} className={clsx(className, css.searchbar)}>
        <input ref={ref} onInput={e => setInput((e.target as HTMLInputElement).value)}
          type="text" autoComplete="off" value={input} placeholder={placeholderText}/>
        <span className={"material-symbols-outlined " + css.search} onClick={focusOnSearch}>&#xe8b6;</span>
        <span className={input ? "material-symbols-outlined " + css.send : "hidden"} onClick={submit}>&#xe163;</span>
        <span className={input ? "hidden" : "material-symbols-outlined " + css.mic}>&#xe029;</span>
        <span className={input ? "hidden" : "material-symbols-outlined " + css.camera}>&#xe412;</span>
      </form>
    );
  }
);

export default SearchBar;
