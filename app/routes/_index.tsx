import { useEffect, useState, useRef } from 'react';
import { type MetaFunction } from "@remix-run/node";
import { type Language, translations } from '~/translations';
import { classes, isDesktop, randomBetween } from "~/utils";
import { Spinner } from '~/components';
import Products, { type Product, Showcase } from '~/components/products';

export const meta: MetaFunction = () => {
  return [
    { title: "ANNA-𝒾" },
  ];
};

type Chat = {
  who: string;
  what: string | JSX.Element;
};

function submit() {
  document.getElementById('submit')?.click();
}

export default function Index() {
  const
    [lang, setLang] = useState<Language>("jp"),
    [chats, setChats] = useState<Chat[]>([]),
    [query, setQuery] = useState<string>(""),
    searchBox = useRef<HTMLInputElement>(null),
    converse = useRef<HTMLElement>(null);

  function focusOnSearch() {
    searchBox.current?.focus();
  }

  function scrollIntoLatest() {
    converse.current!.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
  }

  function updateChats(theUpdate: (chats: Chat[]) => Chat[]) {
    setChats(theUpdate);
    setTimeout(scrollIntoLatest, 100);
  }

  function insertChats(newChats: Chat[]) {
    updateChats((chats) => [...chats, ...newChats]);
  }
  
  useEffect(() => {
    document.getElementById('greeting')!.removeAttribute('style');
    document.getElementById('translate-hint')!.style.transform = '';
    const observer = new MutationObserver(() => {
      if (document.body.scrollHeight > document.body.clientHeight) {
        if (document.body.clientWidth >= 740) {
          const
            assistant = document.getElementById('assistant'),
            sub = document.getElementById('sub');
          assistant!.style.visibility = 'hidden';
          sub!.classList.remove('hidden');

          document.body.addEventListener('scroll', () => {
            document.body.scrollTop > 265 ?
              sub?.classList.add('peek') :
              sub?.classList.remove('peek');
          });
        }
        observer.disconnect();
      }
    });
    observer.observe(converse.current!, {childList: true})
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
        <a id="translate-hint" className="bubble hint" style={{
          display: chats.length ? 'none' : 'block',
          transform: 'scale(0)',
        }}
          onClick={(e) => {
            setQuery('Translate');
            setTimeout(submit, 1);
          }}>Translate?
        </a>
        <section id="converse" ref={converse}>
          {chats.map((chat, index) => {
            if (typeof chat.what === 'string' && chat.what.toLowerCase() === 'translate') return (
              <div className="user translate" key={index}>
                <div className="bubble hint flag">
                  <a className="fi fi-jp" onClick={(e) => {
                    const
                      target = e.target as HTMLElement,
                      parent = target.parentElement,
                      newLang = target.classList[1].slice(3,5) as Language;
                    console.log(target.classList);
                    parent?.parentElement?.removeChild(parent);
                    if (lang !== newLang) {
                      setLang(newLang);
                      insertChats([{
                        who: `anna pop ${newLang}`, 
                        what: translations[newLang].greeting,
                      }]);
                      isDesktop() && focusOnSearch();
                    }
                  }}/>
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
        <form id="search-bar" onSubmit={(e?) => {
          e?.preventDefault();

          setQuery('');
          if (!query) return;
          if (query.toLowerCase() === 'translate') {
            setLang('en');
            insertChats([ 
              {who: 'user', what: query}, 
              {who: 'anna en pop', what: translations.en.greeting}]);
            isDesktop() && focusOnSearch();
            return;
          }

          insertChats([ 
            {who: 'user', what: query},
            {who: 'anna', what: <Spinner/>},
          ]);

          const insert_pos = chats.length + 1;
          setTimeout(() => {
            Products.lookup(query)
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
        }}>
          <input type="text" id="search-box" ref={searchBox} autoComplete="off" value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            placeholder={`${translations[lang].searchHint}`}/>
          <span className="material-symbols-outlined search" onClick={focusOnSearch}>&#xe8b6;</span>
          <span className={query ? 'material-symbols-outlined send' : 'hidden'} onClick={submit}>&#xe163;</span>
          <span className={query ? 'hidden' : 'material-symbols-outlined mic'}>&#xe029;</span>
          <span className={query ? 'hidden' : 'material-symbols-outlined photo-camera'}>&#xe412;</span>
          <input type="submit" id="submit"/>
        </form>
      </main>
    </>
  );
}
