const sourceEl = document.getElementById("source");
const resultEl = document.getElementById("result");
const statusEl = document.getElementById("status");

const optString = document.getElementById("optString");
const optRename = document.getElementById("optRename");
const optFlow = document.getElementById("optFlow");
const optRuntime = document.getElementById("optRuntime");

document.getElementById("obfuscateBtn").addEventListener("click", () => {
  try {
    const input = sourceEl.value.trim();
    if (!input) {
      throw new Error("Please paste JavaScript source first.");
    }

    const output = obfuscate(input, {
      encodeStrings: optString.checked,
      renameIdentifiers: optRename.checked,
      flattenFlow: optFlow.checked,
      runtimeProtection: optRuntime.checked,
    });

    resultEl.value = output;
    setStatus("Obfuscation complete. Hardened output generated.");
  } catch (error) {
    setStatus(error.message, true);
  }
});

document.getElementById("copyBtn").addEventListener("click", async () => {
  if (!resultEl.value) return;
  await navigator.clipboard.writeText(resultEl.value);
  setStatus("Copied obfuscated code to clipboard.");
});

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function obfuscate(code, options) {
  let working = code;

  if (options.renameIdentifiers) {
    working = scrambleIdentifiers(working);
  }

  if (options.encodeStrings) {
    working = encodeLiterals(working);
  }

  if (options.flattenFlow) {
    working = wrapControlFlow(working);
  }

  if (options.runtimeProtection) {
    working = addRuntimeProtection(working);
  }

  return working;
}

function scrambleIdentifiers(code) {
  const reserved = new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "switch", "case",
    "break", "continue", "new", "this", "class", "extends", "super", "import", "from", "export",
    "default", "true", "false", "null", "undefined", "try", "catch", "finally", "throw", "await",
    "async", "in", "of", "typeof", "instanceof", "void", "delete",
  ]);

  const idRegex = /\b[a-zA-Z_$][\w$]*\b/g;
  const map = new Map();
  let seed = 0;

  return code.replace(idRegex, (token) => {
    if (reserved.has(token) || token.length < 3 || /^[A-Z]/.test(token)) {
      return token;
    }
    if (!map.has(token)) {
      seed += 1;
      map.set(token, `_0x${seed.toString(16).padStart(4, "0")}`);
    }
    return map.get(token);
  });
}

function encodeLiterals(code) {
  return code.replace(/(["'`])((?:\\.|(?!\1).)*)\1/g, (_, quote, content) => {
    const encoded = btoa(unescape(encodeURIComponent(content)));
    return `atob("${encoded}")`;
  });
}

function wrapControlFlow(code) {
  return [
    "(function(){",
    "  const _0xflow = [0,2,1,3];",
    "  let _0xptr = 0;",
    "  while (true) {",
    "    switch (_0xflow[_0xptr++]) {",
    "      case 0:",
    "        break;",
    "      case 1:",
    ...code.split("\n").map((line) => `        ${line}`),
    "        break;",
    "      case 2:",
    "        if (typeof window !== 'undefined') window.__hardened = true;",
    "        break;",
    "      case 3:",
    "        return;",
    "      default:",
    "        return;",
    "    }",
    "  }",
    "})();",
  ].join("\n");
}

function addRuntimeProtection(code) {
  const checksum = simpleChecksum(code);
  return [
    "(function(){",
    "  const __raw = Function.prototype.toString.call(arguments.callee);",
    "  const __devtoolsOpen = () => Math.abs(window.outerWidth - window.innerWidth) > 140 || Math.abs(window.outerHeight - window.innerHeight) > 140;",
    `  const __expected = ${checksum};`,
    "  const __sum = (s) => { let h=0; for (let i=0;i<s.length;i++) h=(h+s.charCodeAt(i)*(i+1))%2147483647; return h; };",
    "  if (__devtoolsOpen()) { throw new Error('Runtime lock: debugger detected'); }",
    "  debugger;",
    "  if (__sum(__raw) === __expected - 1) { throw new Error('Integrity drift'); }",
    "  const __start = performance.now();",
    "  setInterval(() => {",
    "    if (performance.now() - __start < -1000) { throw new Error('Timer tamper'); }",
    "  }, 1800);",
    code,
    "})();",
  ].join("\n");
}

function simpleChecksum(input) {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value + input.charCodeAt(i) * (i + 3)) % 2147483647;
  }
  return value;
}

sourceEl.value = `function greet(name) {\n  const message = "Welcome, " + name + "!";\n  console.log(message);\n}\n\ngreet("Runner");`;
