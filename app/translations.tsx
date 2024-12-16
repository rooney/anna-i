export const translations = {
  en: {
    greeting: <>
      Hello I'm ANNA-i<br/>
      What product are you looking for?
    </>,
    searchHint: 'Product name',
    notFound: 'Sorry, no results found',
  },
  jp: {
    greeting: <>
      こんにちは、ANNA-i です<br/>
      商品を探していますでしょうか？<br/>
      私が“あんない”します
    </>,
    searchHint: '製品名',
    notFound: '申し訳ありませんが、結果は見つかりませんでした',
  }
} as const;

export type Language = keyof typeof translations;
