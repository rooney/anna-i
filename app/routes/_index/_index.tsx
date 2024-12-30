import { useEffect, useState, useRef } from 'react';
import { type MetaFunction } from '@remix-run/node';
import { clsx } from 'clsx';
import { Showcase, ShowcaseHandle, Spinner } from '~/components';
import { isDesktop, randomBetween } from '~/utils';
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
    [lang, setLang] = useState<Language>('jp'),
    [chats, setChats] = useState<Chat[]>([]),
    [userInput, setUserInput] = useState<string>(''),
    searchBox = useRef<HTMLInputElement>(null),
    searchBar = useRef<HTMLFormElement>(null),
    converse = useRef<HTMLElement>(null),
    showcases = useRef<ShowcaseHandle[]>([]),
    addShowcase = (index: number) => (el: ShowcaseHandle) => {
      showcases.current[index] = el!;
    };

  useEffect(() => {
    document.getElementById('greeting')!.removeAttribute('style');
    document.getElementById('translate-hint')!.style.transform = '';
    const observer = new ResizeObserver(() => {
      if (document.body.scrollHeight > document.body.clientHeight) {
        if (document.body.clientWidth >= 740) {
          const
            assistant = document.getElementById('assistant'),
            sub = document.getElementById('sub');

          assistant!.style.visibility = 'hidden';
          sub!.classList.remove('hidden');

          document.body.addEventListener('scroll', () => {
            document.body.scrollTop > 265 ?
              sub!.classList.add('peek') :
              sub!.classList.remove('peek');
          });
        }
        observer.disconnect();
      }
    });
    observer.observe(converse.current!);
  }, []);
  
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

  function send(q: string) {
    if (!q) return;
    if (q.toLowerCase() === 'translate') {
      setLang('en');
      insertChats([ 
        { translate: q }, 
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
        <img src="/images/penguin.png" id="assistant"/>
        <img src="/images/penguin.png" id="sub" className="hidden"/>
        <section>
          <div id="greeting" className="bubble anna jp" style={{ transform: 'scale(0)' }}>
            {translations.jp.greeting}
          </div>
        </section>
      </header>
      <main>
        <a id="translate-hint" className="bubble hint" onClick={() => send('Translate')} style={{
          display: chats.length ? 'none' : 'block',
          transform: 'scale(0)',
        }}>
          Translate?
        </a>
        <section id="converse" ref={converse}>
          {chats.map((chat, index) => {
            if ('translate' in chat) return (
              <div key={index} className="translate user">
                <div className="bubble hint flag" data-value="jp" onClick={flagClicked}>
                  <a className="fi fi-jp"/>
                </div>
                <div className="bubble user">{chat.translate}</div>
              </div>
            );

            if ('searchResult' in chat) return (
              <div key={index} className="bubble anna showcase" onClick={(e) => showcases.current[index].handleClick(e)}>
                <span className={lang}>
                  {translations[lang].formatNumber(chat.searchResult.length)}
                  {translations[lang].nFound}
                </span>
                <Showcase products={chat.searchResult} cols={6} ref={addShowcase(index)}/>
              </div>
            );

            return (
              <div key={index} className={clsx('bubble', chat.subject, index === 1 && 'pop')}>
                {chat.matter}
              </div>
            );            
          })}
        </section>
        <form id="search-bar" ref={searchBar} onSubmit={submit}>
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
