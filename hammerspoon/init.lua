-- voice-ai Hammerspoon config
-- 把三個路徑換成你自己的，然後存到 ~/.hammerspoon/init.lua

local NODE   = '/Users/你的帳號/.nvm/versions/node/v24.13.1/bin/node'
local ENV    = '/Users/你的帳號/voice-ai/.env'
local SCRIPT = '/Users/你的帳號/voice-ai/process.js'

local MODE_LABELS = {
  voice  = '⏳ 整理語音中...',
  en     = '⏳ 翻譯英文中...',
  zh     = '⏳ 翻譯中文中...',
  bullet = '⏳ 整理條列中...',
}

local function getModeLabel(mode)
  if MODE_LABELS[mode] then return MODE_LABELS[mode] end
  local n = mode:match('^humor(%d)$')
  if n then return '⏳ 幽默等級 ' .. n .. ' 改寫中...' end
  return '⏳ 處理中...'
end

local function runVoiceAI(mode)
  hs.eventtap.keyStroke({'cmd'}, 'c')
  hs.notify.new({title = 'voice-ai', informativeText = getModeLabel(mode)}):send()
  hs.timer.doAfter(1.5, function()
    hs.task.new(NODE, function(exitCode)
      if exitCode == 0 then
        hs.eventtap.keyStroke({'cmd'}, 'v')
        hs.notify.new({title = 'voice-ai', informativeText = '✅ 完成'}):send()
      else
        hs.notify.new({title = 'voice-ai', informativeText = '❌ 處理失敗，請重試'}):send()
      end
    end, {'--env-file=' .. ENV, SCRIPT, mode}):start()
  end)
end

-- 主要功能
hs.hotkey.bind({'cmd', 'ctrl'}, 'V', function() runVoiceAI('voice')  end)
hs.hotkey.bind({'cmd', 'ctrl'}, 'E', function() runVoiceAI('en')     end)
hs.hotkey.bind({'cmd', 'ctrl'}, 'C', function() runVoiceAI('zh')     end)
hs.hotkey.bind({'cmd', 'ctrl'}, 'B', function() runVoiceAI('bullet') end)

-- 幽默 dial 0–9（0 = 完全正式，9 = 100% 幽默）
for i = 0, 9 do
  local level = i
  hs.hotkey.bind({'cmd', 'ctrl'}, tostring(level), function()
    runVoiceAI('humor' .. level)
  end)
end
