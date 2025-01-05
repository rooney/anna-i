import { useEffect, useState, useRef } from 'react';
import { type MetaFunction } from '@remix-run/node';
import { clsx } from 'clsx';
import { Showcase, ShowcaseHandle, Spinner } from '~/components';
import { hasScrollbarY, isDesktop, randomBetween } from '~/utils';
import { type Language, translations } from '~/locales';
import type { Chat, Product } from '~/models';
import Products from '~/models/product';
import './_index.css';

export const meta: MetaFunction = () => {
  return [
    { title: "ANNA-𝒾" },
  ];
};

export default() => {
  const
    [ready, setReady] = useState<boolean>(false),
    [lang, setLang] = useState<Language>('jp'),
    [chats, setChats] = useState<Chat[]>([]),
    [userInput, setUserInput] = useState<string>(''),
    [scrollTop, setScrollTop] = useState<number>(0),
    [windowWidth, setWindowWidth] = useState<number>(typeof window === 'undefined' ? 0 : window.innerWidth),
    [hasVScrollbar, setHasVScrollbar] = useState<boolean>(false),
    [isSubassist, setSubassist] = useState<boolean>(false),
    [isPeeking, setPeeking] = useState<boolean>(false),
    converse = useRef<HTMLElement>(null),
    searchBox = useRef<HTMLInputElement>(null),
    showcases = useRef<ShowcaseHandle[]>([]),
    addShowcase = (index: number) => (el: ShowcaseHandle) => {
      showcases.current[index] = el!;
    };

  useEffect(() => setSubassist(hasVScrollbar && windowWidth >= 768), [hasVScrollbar, windowWidth]);
  useEffect(() => setPeeking(isSubassist && scrollTop > 265), [isSubassist, scrollTop]);
  useEffect(() => setHasVScrollbar(hasScrollbarY(document.body)), [chats]);
  useEffect(() => {
    window.addEventListener('resize', onWindowResize);
    document.body.addEventListener('scroll', onBodyScroll);
    setReady(true);
    return () => {
      window.removeEventListener('resize', onWindowResize);
      document.body.removeEventListener('scroll', onBodyScroll);
    }
  }, []);

  let debounceOBS: NodeJS.Timeout
  function onBodyScroll() {
    clearTimeout(debounceOBS);
    debounceOBS = setTimeout(() => setScrollTop(document.body.scrollTop), 100);
  }
  
  let debounceOWR: NodeJS.Timeout;
  function onWindowResize() {
    clearTimeout(debounceOWR);
    debounceOWR = setTimeout(() => setWindowWidth(window.innerWidth), 100);
  }
  
  function focusOnSearch() {
    searchBox.current?.focus();
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

  function calcCols(numProducts: number) {
    const numCols = Math.floor((windowWidth - 45) / 105);
    const numRows = Math.ceil(numProducts / numCols);
    return Math.min(6, Math.ceil(numProducts / numRows));
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
                  {chat.searchResult.length > 1 && <>
                    {translations[lang].formatNumber(chat.searchResult.length)}
                    {translations[lang].nFound}
                  </>}
                </span>
                <Showcase ref={addShowcase(index)} products={chat.searchResult} cols={calcCols(chat.searchResult.length)}/>
              </div>
            );

            return (
              <div key={index} className={clsx('bubble', chat.subject, index === 1 && 'pop')}>
                {chat.matter}
              </div>
            );            
          })}
        </section>
        <form id="search-bar" onSubmit={submit}>
          <input id="search-box" ref={searchBox} onInput={e => setUserInput((e.target as HTMLInputElement).value)}
            type="text" autoComplete="off" value={userInput} placeholder={translations[lang].searchHint}/>
          <span className="material-symbols-outlined search" onClick={focusOnSearch}>&#xe8b6;</span>
          <span className={userInput ? 'material-symbols-outlined send' : 'hidden'} onClick={submit}>&#xe163;</span>
          <span className={userInput ? 'hidden' : 'material-symbols-outlined mic'}>&#xe029;</span>
          <span className={userInput ? 'hidden' : 'material-symbols-outlined photo-camera'}>&#xe412;</span>
        </form>
      </main>
    </>
  );
}
