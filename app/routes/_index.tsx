import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from 'react';
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

function scrollIntoLatest() {
  const lastChat = document.getElementById('discourse')?.lastElementChild;
  if (lastChat) {
    lastChat.scrollIntoView({ behavior: 'smooth' });
  }
}

function isAtBottom() {
  return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight;
}
function adjustToKeyboard() {
  if (isAtBottom())
    scrollIntoLatest();
}


export default function Index() {
  const
    [lang, setLang] = useState<Language>("jp"),
    [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    document.getElementById('greeting')?.classList.add('popup');
    document.getElementById('translator')?.classList.add('popup');
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
        <section id="translate">
          <a id="translator" className="bubble en user" 
            style={{display: chats.length ? 'none' : 'block'}}
            onClick={(e) => {
              e.preventDefault();
              (document.getElementById('search-box') as HTMLInputElement).value = "Translate";
              document.getElementById('submit')?.click();
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
                    document.getElementById('search-box')?.focus();
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
            const input = document.getElementById('search-box') as HTMLInputElement;
            if (!input.value.length) {
              return;
            }
            if (input.value.toLowerCase() === "translate") {
              setLang('en');
              setChats([...chats, 
                {who: 'user', what: input.value, lang: 'en'}, 
                {who: 'anna', what: translations.en.greeting, lang: 'en'}]);
            }
            else {
              setChats([...chats, 
                {who: 'user', what: input.value, lang: lang},
                {who: 'anna', what: translations[lang].notFound, lang: lang}]);
            }
            setTimeout(scrollIntoLatest, 1);
            input.value = '';
          }}>
          <input type="text" id="search-box" autoComplete="off" placeholder={`${translations[lang].searchHint}`}/>
          <span className="material-symbols-outlined search">search</span>
          <span className="material-symbols-outlined mic">mic</span>
          <span className="material-symbols-outlined photo-camera">photo_camera</span>
          <input type="submit" id="submit"/>
        </form>
      </main>
    </>
  );
}
