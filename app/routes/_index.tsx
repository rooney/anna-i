import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from 'react';
import { translations, Language } from '../translations';
import Products, { Product } from '../products';
import Spinner from '../components/spinner';

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

function focusOnSearch() {
  document.getElementById('search-box')?.focus();
}

function submit() {
  document.getElementById('submit')?.click();
}

function scrollIntoLatest() {
  const lastChat = document.getElementById('discourse')?.lastElementChild;
  if (lastChat) {
    lastChat.scrollIntoView({ behavior: 'smooth' });
  }
}

function randomBetween(min:number, max:number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default function Index() {
  const
    [lang, setLang] = useState<Language>("jp"),
    [chats, setChats] = useState<Chat[]>([]),
    [query, setQuery] = useState<string>("");
   
  useEffect(() => {
    document.getElementById('greeting')?.classList.add('popup');
    document.getElementById('translate-offer')?.classList.add('popup');
    document.querySelectorAll<HTMLElement>('#search-bar > span').forEach(
      (el) => el.style.visibility = 'visible');

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
    observer.observe(document.getElementById('discourse')!, {childList: true})
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
        <section className="translate-offer">
          <a id="translate-offer" className={chats.length ? 'hidden' : 'bubble en user'}
            onClick={(e) => {
              setQuery('Translate');
              setTimeout(submit, 1);
            }}>Translate?</a>
        </section>
        <section id="discourse">
          {chats.map((chat, index) => 
            typeof chat.what === "string" && (chat.what.toLowerCase() === "translate") ? (
              <div className="lang-switch" key={index}>
                <div className="bubble en translate">{chat.what}</div>
                <a className="bubble flag" lang="jp" onClick={(e) => {
                  const
                    target = e.target as HTMLElement,
                    newLang = target.getAttribute('lang') as Language;
                  target.parentElement?.removeChild(target);
                  if (lang !== newLang) {
                    setLang(newLang);
                    setChats([...chats, 
                      {who: 'anna', what: translations[newLang].greeting, lang: newLang}]);
                    setTimeout(() => {
                      scrollIntoLatest();
                      setTimeout(scrollIntoLatest, 1);
                    }, 1);
                    focusOnSearch();
                  }
                }}>🇯🇵</a>
              </div>
            ) : (
              <div className={`bubble ${chat.lang} ${chat.who}`} key={index}>
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
          if (query.toLowerCase() === "translate") {
            setLang('en');
            setChats([...chats, 
              {who: 'user', what: query, lang: 'en'}, 
              {who: 'anna', what: translations.en.greeting, lang: 'en'}]);
            setTimeout(scrollIntoLatest, 1);
            return;
          }
          setChats([...chats, 
            {who: 'user', what: query, lang: lang},
            {who: 'anna', what: <Spinner/>, lang: lang}]);
          setTimeout(scrollIntoLatest, 1);

          const insert_pos = chats.length + 1;
          setTimeout(() => {
            Products.lookup(query)
              .then((products:Product[]) => {
                if (products.length) {
                  return <>
                    {products.length} {translations[lang].nFound}
                    <ul className="products">
                      {products.map((item, index) => 
                        <li key={index}>
                          <img src={item.pic}/>
                          <span>{item.name}</span>
                        </li>
                      )}
                    </ul>
                  </>
                } else {
                  return translations[lang].noneFound;
                }
              })
              .catch((error) => {
                return `${translations[lang].error} (${error.message})`;
            }).then((result) => {
              setChats((chats) => [...chats.slice(0, insert_pos), 
                {who: 'anna', what: result, lang: lang},
                ...chats.slice(insert_pos + 1)]
            );
           });
          }, randomBetween(400, 4000));
        }}>
          <input type="text" id="search-box" autoComplete="off" value={query}
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
