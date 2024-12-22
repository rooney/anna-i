import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState, useRef, SetStateAction } from 'react';
import { translations, Language } from '../translations';
import { Spinner } from '../components';
import Products, { Product, Showcase } from '../products';

export const meta: MetaFunction = () => {
  return [
    { title: "ANNA-i" },
  ];
};

type Chat = {
  who: string;
  what: string | JSX.Element;
  lang: Language;
};

function submit() {
  document.getElementById('submit')?.click();
}

function randomBetween(min:number, max:number) {
  return Math.floor(Math.random() * (max - min)) + min;
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
    const lastChat = converse.current?.lastElementChild;
    if (lastChat) {
      lastChat.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function updateChats(update:(chats:Chat[]) => Chat[]) {
    setChats(update);
    setTimeout(scrollIntoLatest, 100);
  }

  function insertChats(newChats:Chat[]) {
    updateChats((chats) => [...chats, ...newChats]);
  }
  
  useEffect(() => {
    document.getElementById('greeting')?.classList.add('popup');
    document.getElementById('translate-hint')?.classList.add('popup');
    document.querySelectorAll<HTMLElement>('#search-bar > span')
      .forEach((el) => el.style.visibility = 'visible');

    const observer = new MutationObserver(() => {
      if (document.body.scrollHeight > document.body.clientHeight) {
        if (document.body.clientWidth >= 740) {
          const
            assistant = document.getElementById('assistant'),
            sub = document.getElementById('sub');
          assistant!.style.visibility = 'hidden';
          sub!.classList.remove('hidden');

          document.body.addEventListener('scroll', () => {
            if (document.body.scrollTop > 265) {
              sub?.classList.add('peek');
            } else {
              sub?.classList.remove('peek');
            }
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
          <div id="greeting" className="anna bubble jp">
            {translations.jp.greeting}
          </div>
        </section>
      </header>
      <main>
        <a id="translate-hint" style={{ display: chats.length ? 'none' : 'block' }}
          onClick={(e) => {
            setQuery('Translate');
            setTimeout(submit, 1);
          }}>Translate?
        </a>
        <section id="converse" ref={converse}>
          {chats.map((chat, index) => 
            typeof chat.what === 'string' && (chat.what.toLowerCase() === 'translate') ? (
              <div className="user flex gap-[8px]" key={index}>
                <div className="bubble hint">
                  <a className="fi fi-jp cursor-pointer" onClick={(e) => {
                    const
                      target = e.target as HTMLElement,
                      parent = target.parentElement,
                      newLang = target.classList[1].slice(3,5) as Language;
                    console.log(target.classList);
                    parent?.parentElement?.removeChild(parent);
                    if (lang !== newLang) {
                      setLang(newLang);
                      insertChats([{
                        who: 'anna', 
                        what: translations[newLang].greeting, 
                        lang: newLang,
                      }]);
                      focusOnSearch();
                    }
                  }}/>
                </div>
                <div className="user bubble en">{chat.what}</div>
              </div>
            ) : (
              <div className={`${chat.who} bubble ${chat.lang}`} key={index}>
                {chat.what}
              </div>
            )
          )}
        </section>
        <form id="search-bar" onSubmit={(e) => {
          e.preventDefault();
          if (!query) {
            return;
          }
          setQuery('');
          if (query.toLowerCase() === 'translate') {
            setLang('en');
            insertChats([ 
              {who: 'user', what: query, lang: 'en'}, 
              {who: 'anna', what: translations.en.greeting, lang: 'en'}]);
            return;
          }
          insertChats([ 
            {who: 'user', what: query, lang: lang},
            {who: 'anna', what: <Spinner/>, lang: lang},
          ]);
          const insert_pos = chats.length + 1;
          setTimeout(() => {
            Products.lookup(query)
              .then((products:Product[]) => {
                if (products.length) {
                  return <>
                    {products.length} {translations[lang].nFound}
                    <Showcase products={products}/>
                  </>
                } else {
                  return translations[lang].noneFound;
                }
              })
              .catch((error) => {
                return `${translations[lang].error} (${error.message})`;
            }).then((result) => {
              updateChats((chats) => [
                ...chats.slice(0, insert_pos),
                { who: 'anna', what: result, lang: lang },
                ...chats.slice(insert_pos + 1),
              ]);
            });
          }, randomBetween(400, 4000));
        }}>
          <input type="text" id="search-box" ref={searchBox} autoComplete="off" value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            placeholder={`${translations[lang].searchHint}`}/>
          <span className="material-symbols-outlined search" onClick={focusOnSearch}>search</span>
          <span className={query ? 'material-symbols-outlined send' : 'hidden'} onClick={submit}>send</span>
          <span className={query ? 'hidden' : 'material-symbols-outlined mic'}>mic</span>
          <span className={query ? 'hidden' : 'material-symbols-outlined photo-camera'}>photo_camera</span>
          <input type="submit" id="submit"/>
        </form>
      </main>
    </>
  );
}
