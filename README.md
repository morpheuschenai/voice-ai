# voice-ai

用 macOS Dictation 口述文字，按一個快捷鍵，AI 自動整理、翻譯、改寫，貼回原位。

用來取代 Typeless（$144/年）。成本：BetterTouchTool 買斷 $10 + OpenAI API 每次約 $0.01。

---

## 功能

| 模式 | 快捷鍵（建議） | 說明 |
|------|---------------|------|
| `voice` | ⌘⌃V | 整理語音口述：去贅字、加標點、理清語意 |
| `en` | ⌘⌃E | 翻譯成英文 |
| `zh` | ⌘⌃Z | 翻譯成繁體中文 |
| `bullet` | ⌘⌃B | 整理成條列重點 |
| `humor0`–`humor9` | ⌘⌃0 – ⌘⌃9 | 調整文字幽默感（0 = 完全正式，9 = 100% 幽默） |

改一行 prompt 就能加新功能，例如：改語氣、轉換成正式公文、摘要等。

---

## 前置需求

- macOS
- Node.js 20.6+（建議用 [nvm](https://github.com/nvm-sh/nvm) 安裝）
- [BetterTouchTool](https://folivora.ai/)（試用期免費，買斷 $10）
- OpenAI API key（[前往申請](https://platform.openai.com/api-keys)）

---

## 安裝

**1. Clone repo**

```bash
git clone https://github.com/morpheus0921/voice-ai.git
cd voice-ai
```

**2. 設定 API key**

```bash
cp .env.example .env
```

用任何文字編輯器打開 `.env`，填入你的 OpenAI API key：

```
OPENAI_API_KEY=sk-proj-你的金鑰
```

**3. 確認 Node.js 路徑**

```bash
which node
```

記下這個路徑，等等設定 BTT 時會用到（例如 `/Users/你的帳號/.nvm/versions/node/v24.13.1/bin/node`）。

---

## BTT 設定

每個快捷鍵的動作序列如下：

1. **Send Keyboard Shortcut** → `⌘C`（複製選取文字）
2. **Pause Execution** → `1.5 秒`
3. **Execute Shell Script**：

```bash
/Users/你的帳號/.nvm/versions/node/v24.13.1/bin/node \
  --env-file=/Users/你的帳號/voice-ai/.env \
  /Users/你的帳號/voice-ai/process.js voice
```

把 `voice` 換成對應模式（`en` / `zh` / `bullet` / `humor0`–`humor9`），建立對應快捷鍵。

4. **Send Keyboard Shortcut** → `⌘V`（貼回）

---

## 使用方式

1. 在任何輸入框口述或輸入文字
2. 全選文字（`⌘A` 或手動選取）
3. 按對應快捷鍵
4. 等 3–5 秒，整理後的文字自動取代原文

切換快捷鍵後不要切換視窗，等貼回完成再動。

---

## 擴充新功能

在 `process.js` 的 `PROMPTS` 物件加一個 key：

```javascript
const PROMPTS = {
  voice: `...`,
  en: `...`,
  // 新增
  formal: `你是一個文字編輯助理。請將輸入的文字改寫成正式、專業的繁體中文。只輸出改寫後的文字。`,
  funny: `你是一個幽默編輯。請在保留原意的前提下，讓文字更有趣、更生動。只輸出改寫後的文字。`,
};
```

然後在 BTT 新增一個快捷鍵，shell script 最後的模式名稱換成新的 key。

---

## 成本對比

| 項目 | 費用 |
|------|------|
| BetterTouchTool | $10（一次買斷） |
| OpenAI API | ~$0.01 / 次 |
| Typeless 訂閱 | $144 / 年 |

---

## 為什麼需要 BetterTouchTool

macOS 安全機制不允許未簽署的 app 模擬鍵盤操作（⌘C / ⌘V）。
BTT 是已簽署的正式 app，可以合法取得這個權限，並直接觸發 shell script。

---

## License

MIT
