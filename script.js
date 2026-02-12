const sourceEl = document.getElementById('source');
const resultEl = document.getElementById('result');
const layersEl = document.getElementById('layers');
const layerValueEl = document.getElementById('layerValue');

const sampleScript = `local Players = game:GetService("Players")
local player = Players.LocalPlayer
print("Welcome", player.Name)

for i = 1, 5 do
    task.wait(0.5)
    print("Pulse #" .. i)
end`;

function randomName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return '_' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function encodeLayer(luaCode) {
  const bytes = Array.from(luaCode).map((char) => char.charCodeAt(0));
  const tableName = randomName();
  const accumulator = randomName();
  const junkA = Math.floor(Math.random() * 90 + 10);
  const junkB = Math.floor(Math.random() * 90 + 10);

  return `local ${tableName}={${bytes.join(',')}}\nlocal ${accumulator}=""\nfor _,v in ipairs(${tableName}) do ${accumulator}=${accumulator}..string.char(v) end\nlocal _j=${junkA}+${junkB}-${junkB}\nif _j~=${junkA} then return end\nloadstring(${accumulator})()`;
}

function multiObfuscate(luaCode, layers) {
  let output = luaCode.trim();
  for (let i = 0; i < layers; i += 1) {
    output = encodeLayer(output);
  }
  return `-- NeonLua Forge Output\n${output}`;
}

document.getElementById('sampleBtn').addEventListener('click', () => {
  sourceEl.value = sampleScript;
});

document.getElementById('obfuscateBtn').addEventListener('click', () => {
  const source = sourceEl.value;
  if (!source.trim()) {
    resultEl.value = '-- Add script text before obfuscating.';
    return;
  }

  const layerCount = Number(layersEl.value);
  resultEl.value = multiObfuscate(source, layerCount);
});

document.getElementById('copyBtn').addEventListener('click', async () => {
  if (!resultEl.value.trim()) return;

  try {
    await navigator.clipboard.writeText(resultEl.value);
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = 'Copy'), 1400);
  } catch {
    resultEl.select();
    document.execCommand('copy');
  }
});

layersEl.addEventListener('input', () => {
  layerValueEl.textContent = layersEl.value;
});

sourceEl.value = sampleScript;
