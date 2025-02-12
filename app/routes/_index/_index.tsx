import { useEffect, useState, useRef } from 'react';
import { useThrottle } from '@react-hook/throttle';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import { type MetaFunction } from '@remix-run/node';
import { clsx } from 'clsx';
import { SearchBar, Showcase, ShowcaseElement, Spinner } from '~/components';
import { hasScrollbarY, isDesktop, randomBetween } from '~/utils';
import { type Language, translations } from '~/locales';
import type { Chat, Product } from '~/models';
import Products from '~/models/product';
import useEvent from '@react-hook/event';
import useSize from '@react-hook/size';
import './_index.css';

export const meta: MetaFunction = () => {
  return [
    { title: "ANNA-𝒾" },
  ];
};

export default() => {
  const
    converse = useRef<HTMLElement>(null),
    [_, converseHeight] = useSize(converse),
    [lang, setLang] = useState<Language>('jp'),
    [chats, setChats] = useState<Chat[]>([]),
    [userInput, setUserInput] = useState<string>(''),
    [scrollY, setScrollY] = useThrottle<number>(283),
    [hasVScrollbar, setHasVScrollbar] = useState<boolean>(false),
    [isSubassist, setSubassist] = useState<boolean>(false),
    [isPeeking, setPeeking] = useState<boolean>(false),
    [ready, setReady] = useState<boolean>(false),
    windowWidth = useWindowWidth({fps: 1}),
    searchBar = useRef<HTMLInputElement>(null),
    showcases = useRef<ShowcaseElement[]>([]),
    addShowcase = (index: number) => (el: ShowcaseElement) => {
      showcases.current[index] = el!;
    };

  if (typeof document !== 'undefined') {
    useEvent(document.body, 'scroll', () => setScrollY(converse.current!.getBoundingClientRect().top));
  }
  useEffect(() => setSubassist(hasVScrollbar && windowWidth >= 790), [hasVScrollbar, windowWidth]);
  useEffect(() => setPeeking(isSubassist && scrollY < 50), [isSubassist, scrollY]);
  useEffect(() => setHasVScrollbar(hasScrollbarY(document.body)), [converseHeight]);
  useEffect(() => setReady(true), []);

  function focusOnSearch() {
    searchBar.current?.focus();
  }

  function scrollIntoLatest() {
    converse.current!.lastElementChild!.scrollIntoView({ behavior: 'smooth' });
  }

  function updateChats(theUpdate: (chats: Chat[]) => Chat[]) {
    setChats(theUpdate);
    setTimeout(scrollIntoLatest, 100);
  }

  function insertChats(newChats: Chat[]) {
    updateChats(chats => [...chats, ...newChats]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    send(userInput);
    setUserInput('');
  }

  function flagClicked(e: React.MouseEvent) {
    const newLang = (e.currentTarget as HTMLElement).dataset.value as Language;
    if (newLang && lang !== newLang) {
      e.currentTarget.parentElement?.removeChild(e.currentTarget);
      setLang(newLang);
      insertChats([{
        subject: `anna pop ${newLang}`, 
        matter: translations[newLang].greeting,
      }]);
      isDesktop() && focusOnSearch();
    }
  }

  function send(q: string) {
    if (!q) return;
    if (q.toLowerCase() === 'translate') {
      setLang('en');
      insertChats([ 
        { translationRequest: q }, 
        { subject: 'anna en pop', matter: translations.en.greeting }]);
      return isDesktop() && focusOnSearch();
    }

    insertChats([ 
      {subject: 'user', matter: q},
      {subject: 'anna', matter: <Spinner/>},
    ]);

    const insert_pos = chats.length + 1;
    setTimeout(() => {
      Products.lookup(q)
      .catch(error => {
        throw <>
          {translations[lang].error} &#32;
          <span className="en">({error.message})</span>
        </>
      })
      .then((products: Product[]) => {
        if (!products.length) throw translations[lang].noneFound;
        return { searchResult: products };
      })
      .catch(msg => ({ subject: `anna ${lang}`, matter: msg }))
      .then((result: Chat) => {
        updateChats(chats => [
          ...chats.slice(0, insert_pos), result, ...chats.slice(insert_pos + 1),
        ]);
      });
    }, randomBetween(1000, 3000));
  }

  return (
    <>
      <header>
        <img src="/images/penguin.png" id="assistant" className={clsx(isSubassist && "invisible")}/>
        <img src="/images/penguin.png" id="sub"
          className={clsx(!isSubassist && "hidden", isPeeking && "peek")}
        />
        <section>
          <div id="greeting" className={clsx("bubble anna jp", !ready && "shrink")}>
            {translations.jp.greeting}
          </div>
        </section>
      </header>
      <main>
        <a id="translate-hint" onClick={() => send('Translate')}
          className={clsx("bubble hint block", !ready && "shrink", chats.length && "hidden")}>
          Translate?
        </a>
        <section id="converse" ref={converse}>
          {chats.map((chat, index) => {
            if ('translationRequest' in chat) return (
              <div key={index} className="translate user">
                <div className="bubble hint flag" data-value="jp" onClick={flagClicked}>
                  <a className="fi fi-jp"/>
                </div>
                <div className="bubble user">{chat.translationRequest}</div>
              </div>
            );

            if ('searchResult' in chat) return (
              <div key={index} className="bubble anna showcase" onClick={(e) => showcases.current[index].handleClick(e)}>
                <span className={lang}>
                  {chat.searchResult.length > 1 ? <>
                    {translations[lang].formatNumber(chat.searchResult.length)}
                    {translations[lang].nFound}
                  </> : <>
                    {translations[lang].oneFound}
                  </>}
                </span>
                <Showcase ref={addShowcase(index)} products={chat.searchResult}/>
              </div>
            );

            return (
              <div key={index} className={clsx('bubble', chat.subject, index === 1 && 'pop')}>
                {chat.matter}
              </div>
            );            
          })}
        </section>
        <SearchBar ref={searchBar} id="search-bar" placeholderText={translations[lang].searchHint} onSearch={send}/>
      </main>
    </>
  );
}
