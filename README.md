# Cyberpunk Obfuscator Studio

A lightweight browser-based JavaScript obfuscation playground with stronger hardening toggles and runtime protections.

## Improvements included

- Enhanced UI with a neon cyberpunk theme and cleaner panels.
- Multi-option obfuscation pipeline:
  - Identifier scrambling.
  - String literal encoding.
  - Basic control-flow flattening wrapper.
  - Runtime protection wrapper with anti-debug and timer tamper checks.
- Copy-to-clipboard and inline status feedback.

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173` in a browser.
