exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API 키가 설정되지 않았어요.' }) };
  }
 
  try {
    const { books } = JSON.parse(event.body || '{}');
    if (!books || !books.length) {
      return { statusCode: 400, body: JSON.stringify({ error: '읽은 책 목록이 없어요.' }) };
    }
 
    const bookList = books.map(b =>
      '- "' + b.title + '"' +
      (b.author ? ' (' + b.author + ')' : '') +
      (b.rating ? ' 별점' + b.rating : '') +
      (b.memo ? ' — ' + b.memo.slice(0, 40) : '')
    ).join('\n');
 
    const prompt = '나는 독서를 좋아하는 사람입니다. 아래 독서 기록을 바탕으로 다음에 읽을 책 3권을 추천해주세요.\n\n완독 목록:\n' + bookList + '\n\n각 책을 번호(1. 2. 3.)로 구분하고, 제목/저자와 추천 이유(2~3줄)를 써주세요. 마크다운 기호는 사용하지 마세요.';
 
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;
 
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 900 }
      })
    });
 
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '추천을 가져오지 못했습니다.';
 
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '서버 오류', detail: err.message })
    };
  }
};
