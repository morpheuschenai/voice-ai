import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const MODEL = 'gpt-4.1-mini';

const PROMPTS = {
  voice: `你是一個繁體中文語音整理助理。請整理使用者透過語音輸入的原始文字。

規則：
- 一律使用繁體中文
- 移除口語贅字、重複、停頓語
- 加上適當標點符號（逗號、句號、頓號等）
- 保留原本意思，不要過度改寫
- 讓文字變得自然、清楚、可直接貼上使用
- 如果原文是工作討論，請整理成清楚條列
- 如果原文是一般敘述，請整理成自然段落
- 不要新增原文沒有的資訊
- 不要加標題，除非原文明顯需要
- 不要解釋你做了什麼，只輸出整理後的文字`,

  en: `You are a translator. Translate the input text into natural, fluent English.

Rules:
- Output only the translated text
- Keep the original meaning and tone
- Do not add explanations or notes`,

  zh: `你是一個翻譯助理。請將輸入的文字翻譯成自然流暢的繁體中文。

規則：
- 只輸出翻譯後的文字
- 保留原本的意思與語氣
- 不要加說明或備註`,

  bullet: `你是一個內容整理助理。請將輸入的文字整理成清楚的條列重點。

規則：
- 一律使用繁體中文
- 用條列格式（- 開頭）
- 每點簡潔，一個概念一行
- 保留所有重要資訊，不要省略
- 不要加標題
- 不要解釋你做了什麼，只輸出條列內容`,
};

const mode = process.argv[2] || 'voice';
const systemPrompt = PROMPTS[mode];

if (!systemPrompt) {
  process.stderr.write(`❌ 未知 mode：${mode}，可用：voice / en / zh / bullet\n`);
  process.exit(1);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  process.stderr.write('❌ OPENAI_API_KEY 未設定\n');
  process.exit(1);
}

const rawText = execSync(`osascript -e 'the clipboard as text'`).toString('utf8').trim();

if (!rawText) {
  process.stderr.write('❌ clipboard 是空的\n');
  process.exit(1);
}

let response;
try {
  response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      instructions: systemPrompt,
      input: rawText,
    }),
  });
} catch (err) {
  process.stderr.write(`❌ 網路錯誤：${err.message}\n`);
  process.exit(1);
}

if (!response.ok) {
  const body = await response.text();
  process.stderr.write(`❌ API 錯誤 (HTTP ${response.status})：${body}\n`);
  process.exit(1);
}

let data;
try {
  data = await response.json();
} catch (err) {
  process.stderr.write(`❌ 無法解析回傳：${err.message}\n`);
  process.exit(1);
}

let result;
try {
  result = data.output[0].content[0].text;
} catch (err) {
  process.stderr.write('❌ 解析結構失敗：' + JSON.stringify(data) + '\n');
  process.exit(1);
}

writeFileSync('/tmp/vc_cleaned.txt', result, 'utf8');
execSync(`osascript -e 'set the clipboard to (read POSIX file "/tmp/vc_cleaned.txt" as «class utf8»)'`);
