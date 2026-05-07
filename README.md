# voice-ai

用 macOS Dictation 口述文字，按一個快捷鍵，AI 自動整理、翻譯、改寫，貼回原位。

用來取代 Typeless（$144/年）。成本：OpenAI API 每次約 $0.01 + 觸發工具（Hammerspoon 免費，或 BetterTouchTool 買斷 $10，可先試用 45 天）。

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
- 觸發工具（擇一）：
  - **[Hammerspoon](https://www.hammerspoon.org/)**（免費開源，推薦）
  - **[BetterTouchTool](https://folivora.ai/)**（買斷 $10，GUI 設定較直覺）
- OpenAI API key（[前往申請](https://platform.openai.com/api-keys)）

---

## 安裝

**1. Clone repo**

```bash
git clone https://github.com/morpheuschenai/voice-ai.git
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

記下這個路徑，等等設定觸發工具時會用到（例如 `/Users/你的帳號/.nvm/versions/node/v24.13.1/bin/node`）。

---

## 方案一：Hammerspoon（免費）

**安裝**

```bash
brew install --cask hammerspoon
```

**設定**

把以下內容存成 `~/.hammerspoon/init.lua`，路徑替換成你自己的：

```lua
local NODE   = '/Users/你的帳號/.nvm/versions/node/v24.13.1/bin/node'
local ENV    = '/Users/你的帳號/voice-ai/.env'
local SCRIPT = '/Users/你的帳號/voice-ai/process.js'

local function runVoiceAI(mode)
  hs.eventtap.keyStroke({'cmd'}, 'c')
  hs.notify.new({title = 'voice-ai', informativeText = '⏳ 處理中...'}):send()
  hs.timer.doAfter(1.5, function()
    hs.task.new(NODE, function()
      hs.eventtap.keyStroke({'cmd'}, 'v')
      hs.notify.new({title = 'voice-ai', informativeText = '✅ 完成'}):send()
    end, {'--env-file=' .. ENV, SCRIPT, mode}):start()
  end)
end

hs.hotkey.bind({'cmd', 'ctrl'}, 'V', function() runVoiceAI('voice')  end)
hs.hotkey.bind({'cmd', 'ctrl'}, 'E', function() runVoiceAI('en')     end)
hs.hotkey.bind({'cmd', 'ctrl'}, 'Z', function() runVoiceAI('zh')     end)
hs.hotkey.bind({'cmd', 'ctrl'}, 'B', function() runVoiceAI('bullet') end)

for i = 0, 9 do
  local level = i
  hs.hotkey.bind({'cmd', 'ctrl'}, tostring(level), function()
    runVoiceAI('humor' .. level)
  end)
end
```

開啟 Hammerspoon → 給 Accessibility 權限 → 點 menu bar 圖示 → **Reload Config**。

---

## 方案二：BetterTouchTool（$10）

每個快捷鍵的動作序列：

1. **Send Keyboard Shortcut** → `⌘C`
2. **Pause Execution** → `1.5 秒`
3. **Execute Shell Script**：

```bash
/Users/你的帳號/.nvm/versions/node/v24.13.1/bin/node \
  --env-file=/Users/你的帳號/voice-ai/.env \
  /Users/你的帳號/voice-ai/process.js voice
```

把 `voice` 換成對應模式（`en` / `zh` / `bullet` / `humor0`–`humor9`），建立對應快捷鍵。

4. **Send Keyboard Shortcut** → `⌘V`

---

## 使用方式

1. 在任何輸入框口述或輸入文字
2. 全選文字（`⌘A` 或手動選取）
3. 按對應快捷鍵
4. 右上角出現「⏳ 處理中...」，完成後自動貼回

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

然後在觸發工具新增對應快捷鍵，mode 名稱換成新的 key。

---

## 成本對比

| 項目 | 費用 |
|------|------|
| Hammerspoon | 免費 |
| BetterTouchTool | $10（一次買斷） |
| OpenAI API | ~$0.01 / 次 |
| Typeless 訂閱 | $144 / 年 |

---

## 為什麼需要觸發工具

macOS 安全機制不允許未簽署的 app 模擬鍵盤操作（⌘C / ⌘V）。
Hammerspoon 和 BTT 都是已簽署的正式 app，可以合法取得 Accessibility 權限並觸發 shell script。

---

## License

MIT
