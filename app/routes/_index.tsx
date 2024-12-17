import type { MetaFunction } from "@remix-run/node";
import { MouseEvent, useEffect, useState } from 'react';
import { translations, Language } from '../translations';

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

export default function Index() {
  const
    [lang, setLang] = useState<Language>("jp"),
    [chats, setChats] = useState<Chat[]>([]),
    [searchTerm, setSearchTerm] = useState<string>("");
   
  useEffect(() => {
    document.getElementById('greeting')?.classList.add('popup');
    document.getElementById('translate-offer')?.classList.add('popup');
  }, []);

  return (
    <>
      <header>
        <img id="assistant" src="/images/penguin.png"/>
        <section>
          <div id="greeting" className="bubble jp">
            {translations.jp.greeting}
          </div>
        </section>
      </header>
      <main>
        <section className="translate-offer">
          <a id="translate-offer" className="bubble en user" 
            style={{display: chats.length ? 'none' : 'block'}}
            onClick={(e) => {
              setSearchTerm('Translate');
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
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!searchTerm) {
            return;
          }
          if (searchTerm.toLowerCase() === "translate") {
            setLang('en');
            setChats([...chats, 
              {who: 'user', what: searchTerm, lang: 'en'}, 
              {who: 'anna', what: translations.en.greeting, lang: 'en'}]);
          }
          else {
            setChats([...chats, 
              {who: 'user', what: searchTerm, lang: lang},
              {who: 'anna', what: translations[lang].notFound, lang: lang}]);
          }
          setTimeout(scrollIntoLatest, 1);
          setSearchTerm('');
        }}>
          <input type="text" id="search-box" autoComplete="off" value={searchTerm}
            onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            placeholder={`${translations[lang].searchHint}`}/>
          <span className="material-symbols-outlined search" onClick={focusOnSearch}>search</span>
          <span className={searchTerm ? 'material-symbols-outlined send' : 'hidden'} onClick={submit}>send</span>
          <span className={searchTerm ? 'hidden' : 'material-symbols-outlined mic'}>mic</span>
          <span className={searchTerm ? 'hidden' : 'material-symbols-outlined photo-camera'}>photo_camera</span>
          <input type="submit" id="submit"/>
        </form>
      </main>
    </>
  );
}
