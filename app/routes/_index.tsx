import { useEffect, useState, useRef } from 'react';
import { type MetaFunction } from "@remix-run/node";
import { type Language, translations } from '~/translations';
import { classes, isDesktop, randomBetween } from "~/utils";
import { Showcase, Spinner } from '~/components';
import Products, { type Product } from '~/models/products';

export const meta: MetaFunction = () => {
  return [
    { title: "ANNA-𝒾" },
  ];
};

type Chat = {
  who: string;
  what: string | JSX.Element;
};

export default function Index() {
  const
    [lang, setLang] = useState<Language>('jp'),
    [chats, setChats] = useState<Chat[]>([]),
    [userInput, setUserInput] = useState<string>(''),
    searchBar = useRef<HTMLFormElement>(null),
    searchBox = useRef<HTMLInputElement>(null),
    converse = useRef<HTMLElement>(null);

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
    updateChats((chats) => [...chats, ...newChats]);
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
        {who: 'user', what: q}, 
        {who: 'anna en pop', what: translations.en.greeting}]);
      return isDesktop() && focusOnSearch();
    }

    insertChats([ 
      {who: 'user', what: q},
      {who: 'anna', what: <Spinner/>},
    ]);

    const insert_pos = chats.length + 1;
    setTimeout(() => {
      Products.lookup(q)
      .catch((error) => {
        throw <>
          {translations[lang].error} &#32;
          <span className="en">({error.message})</span>
        </>
      })
      .then((products: Product[]) => {
        if (!products.length) throw translations[lang].noneFound;
        return {
          who: 'anna showcase',
          what: <>
            <span className={lang}>
              {translations[lang].formatNumber(products.length)}
              {translations[lang].nFound}
            </span>
            <Showcase products={products} cols={3}/>
          </>,
        };
      })
      .catch((msg) => ({ who: `anna ${lang}`, what: msg }))
      .then((result) => {
        updateChats((chats) => [
          ...chats.slice(0, insert_pos), result, ...chats.slice(insert_pos + 1),
        ]);
      });
    }, randomBetween(1000, 3000));
  }

  function flagClicked(e: React.MouseEvent) {
    const flag = e.currentTarget.querySelector('.fi');
    const newLang = flag?.classList[1].slice(3,5) as Language;
    if (newLang && lang !== newLang) {
      e.currentTarget.parentElement?.removeChild(e.currentTarget);
      setLang(newLang);
      insertChats([{
        who: `anna pop ${newLang}`, 
        what: translations[newLang].greeting,
      }]);
      isDesktop() && focusOnSearch();
    }
  }
  
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
            if (typeof chat.what === 'string' && chat.what.toLowerCase() === 'translate') return (
              <div className="user translate" key={index}>
                <div className="bubble hint flag" onClick={flagClicked}>
                  <a className="fi fi-jp"/>
                </div>
                <div className="bubble user">{chat.what}</div>
              </div>
            )
            return (
              <div className={classes('bubble', chat.who, index === 1 && 'pop')} key={index}>
                {chat.what}
              </div>
            )
          })}
        </section>
        <form id="search-bar" ref={searchBar} onSubmit={submit}>
          <input id="search-box" ref={searchBox} onInput={(e) => setUserInput((e.target as HTMLInputElement).value)}
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
