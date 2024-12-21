export const translations = {
  en: {
    greeting: <>
      Hello I'm ANNA-i<br/>
      What product are you looking for?
    </>,
    searchHint: 'Product name',
    notFound: "I don't have such product",
    error: "I'm sorry, service is currently unavailable"
  },
  jp: {
    greeting: <>
      こんにちは、ANNA-i です<br/>
      商品を探していますでしょうか？<br/>
      私が“あんない”します
    </>,
    searchHint: '製品名',
    notFound: 'そのような商品はありません',
    error: '申し訳ございませんが、現在サービスはご利用いただけません',
  }
} as const;

export type Language = keyof typeof translations;
