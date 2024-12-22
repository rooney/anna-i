export const translations = {
  en: {
    greeting: <>
      Hello I'm ANNA-i<br/>
      What product are you looking for?
    </>,
    searchHint: 'Product name',
    nFound: 'products found',
    oneFound: 'Found 1 product',
    noneFound: "Sorry, I couldn't find it",
    error: "I'm sorry, the service is currently unavailable",
  },
  jp: {
    greeting: <>
      こんにちは、<span>ANNA-i</span> です<br/>
      商品を探していますでしょうか？<br/>
      私が“あんない”します
    </>,
    searchHint: '製品名',
    nFound: '件の商品が見つかりました',
    oneFound: '1 件の商品が見つかりました',
    noneFound: '申し訳ありませんが、見つかりませんでした',
    error: '申し訳ございませんが、現在サービスはご利用いただけません',
  }
} as const;

export type Language = keyof typeof translations;
