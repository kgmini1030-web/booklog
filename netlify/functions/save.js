const { getStore } = require('@netlify/blobs');
 
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  try {
    const { userId, books } = JSON.parse(event.body || '{}');
    if (!userId || !books) {
      return { statusCode: 400, body: JSON.stringify({ error: '데이터가 없어요.' }) };
    }
 
    const store = getStore('booklog');
    await store.setJSON(userId, { books, updatedAt: new Date().toISOString() });
 
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '저장 실패', detail: err.message })
    };
  }
};
 
