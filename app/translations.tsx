export const translations = {
  en: {
    greeting: <>
      Hello I'm ANNA-i<br/>
      What product are you looking for?
    </>,
    searchHint: 'Product name',
    nFound: ' products found',
    notFound: "Hmm... I don't have that product in my catalog",
    error: "I'm sorry, service is currently unavailable",
  },
  jp: {
    greeting: <>
      こんにちは、ANNA-i です<br/>
      商品を探していますでしょうか？<br/>
      私が“あんない”します
    </>,
    searchHint: '製品名',
    nFound: ' 件の商品が見つかりました',
    notFound: 'うーん...その商品はカタログに載ってない',
    error: '申し訳ございませんが、現在サービスはご利用いただけません',
  }
} as const;

export type Language = keyof typeof translations;
