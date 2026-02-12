const sourceEl = document.getElementById('source');
const outputEl = document.getElementById('output');
const statusEl = document.getElementById('status');
const obfuscateBtn = document.getElementById('obfuscateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

const options = {
  removeComments: document.getElementById('removeComments'),
  compressWhitespace: document.getElementById('compressWhitespace'),
  encodeStrings: document.getElementById('encodeStrings'),
  renameLocals: document.getElementById('renameLocals')
};

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
};

const stripLineComments = (code) => code
  .split('\n')
  .map((line) => {
    const idx = line.indexOf('--');
    if (idx === -1) {
      return line;
    }

    const left = line.slice(0, idx);
    const singleQuotes = (left.match(/'/g) || []).length;
    const doubleQuotes = (left.match(/"/g) || []).length;

    if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1) {
      return line;
    }

    return left;
  })
  .join('\n');

const stripBlockComments = (code) => code.replace(/--\[\[[\s\S]*?\]\]/g, '');

const compressWhitespace = (code) => code
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .join('\n');

const encodeLuaStrings = (code) => code.replace(/(['"])(?:\\.|(?!\1).)*\1/g, (match) => {
  if (match.length <= 2) {
    return match;
  }

  const inner = match.slice(1, -1);
  const bytes = Array.from(inner).map((char) => char.charCodeAt(0));
  return `string.char(${bytes.join(',')})`;
});

const renameLocalVariables = (code) => {
  const localVarPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
  const reserved = new Set([
    'local', 'function', 'end', 'if', 'then', 'elseif', 'else', 'for', 'while', 'repeat',
    'until', 'do', 'return', 'break', 'and', 'or', 'not', 'nil', 'true', 'false', 'in'
  ]);

  const mapping = new Map();
  let count = 0;
  let found;

  while ((found = localVarPattern.exec(code))) {
    const name = found[1];
    if (!reserved.has(name) && !mapping.has(name)) {
      mapping.set(name, `_v${count.toString(36)}`);
      count += 1;
    }
  }

  let output = code;
  for (const [original, renamed] of mapping.entries()) {
    const safe = new RegExp(`\\b${original}\\b`, 'g');
    output = output.replace(safe, renamed);
  }

  return output;
};

const buildWrappedOutput = (body) => {
  const escaped = body.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  return [
    '--[[ Cyberpunk Roblox Lua Obfuscation Layer ]]',
    'local _payload = [=[' + escaped + ']=]',
    'local _runner = loadstring or load',
    'if not _runner then error("Executor does not support loadstring/load") end',
    'return _runner(_payload)()'
  ].join('\n');
};

const obfuscateLua = () => {
  const source = sourceEl.value;
  if (!source.trim()) {
    outputEl.value = '';
    setStatus('Paste a Roblox Lua script before obfuscating.', true);
    return;
  }

  let code = source;

  if (options.removeComments.checked) {
    code = stripBlockComments(stripLineComments(code));
  }

  if (options.compressWhitespace.checked) {
    code = compressWhitespace(code);
  }

  if (options.renameLocals.checked) {
    code = renameLocalVariables(code);
  }

  if (options.encodeStrings.checked) {
    code = encodeLuaStrings(code);
  }

  outputEl.value = buildWrappedOutput(code);
  setStatus('Obfuscation complete. Roblox Lua payload generated.');
};

const clearAll = () => {
  sourceEl.value = '';
  outputEl.value = '';
  setStatus('Cleared.');
};

const copyOutput = async () => {
  if (!outputEl.value.trim()) {
    setStatus('Nothing to copy yet.', true);
    return;
  }

  try {
    await navigator.clipboard.writeText(outputEl.value);
    setStatus('Copied obfuscated script to clipboard.');
  } catch {
    outputEl.select();
    document.execCommand('copy');
    setStatus('Copied using fallback clipboard method.');
  }
};

obfuscateBtn.addEventListener('click', obfuscateLua);
clearBtn.addEventListener('click', clearAll);
copyBtn.addEventListener('click', copyOutput);
