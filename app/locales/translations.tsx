export type Language = keyof typeof translations;
export const translations = {
  en: {
    greeting: <>
      Hello I'm <span className="font-logo">ANNA</span>-𝓲 <br/>
      What product are you looking for?
    </>,
    searchHint: 'Product name',
    nFound: ' products found',
    noneFound: "Sorry, I couldn't find it",
    error: "I'm sorry, the service is currently unavailable",

    formatNumber: (num: number) => num
  },
  jp: {
    greeting: <>
      こんにちは、<span className="font-logo">ANNA</span>-𝓲です <br/>
      商品を探しています&#8203;でしょうか <br/>
      私が「あんない」します
    </>,
    searchHint: '製品名',
    nFound: <>件の商品が&#8203;見つかりました</>,
    noneFound: <>申し訳ありませんが、見つかりません&#8203;でした</>,
    error: <>申し訳ございませんが、現在&#8203;サービス&#8203;は&#8203;ご利用&#8203;いただけません</>,

    formatNumber: (num: number) => {
      const KANJI_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
      const UNITS = ['', '十', '百', '千'];
      const GROUPS = ['', '万', '億', '兆', '京'];
      
      function insertGroup(str: string, index: number) {
        const groupLen = 4;
        const startIndex = str.length - (index + 1) * groupLen;
        return str.slice(0, startIndex) + GROUPS[index] + str.slice(startIndex);
      }
      
      if (num === 0) return '零';
      const
        strNum = num.toString(),
        len = strNum.length;
    
      let result = '';
      for (let i = 0; i < len; i++) {
        const digit = parseInt(strNum[len - i - 1]);
        if (digit === 0) continue;
        result = (digit === 1 && i !== 0 ? '' : KANJI_NUMBERS[digit]) 
          + UNITS[i % 4] 
          + result;
      }
      for (let i = 0; i < Math.floor((len - 1) / 4); i++) {
        result = insertGroup(result, i);
      }
      return result;
    }
  }
} as const;
