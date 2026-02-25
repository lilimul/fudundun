# AGENTS.md

## Cursor Cloud specific instructions

This is **fudundun** — a client-side React (v17) image compositing tool using HTML5 Canvas and Ant Design. No backend, no database.

### Services

| Service | Command | Port |
|---------|---------|------|
| React dev server | `yarn start` | 3000 |

### Key caveats

- **Tests fail in jsdom**: The default `yarn test` runs Jest with jsdom, which does not support `HTMLCanvasElement.getContext`. This is a pre-existing limitation — the App component relies on Canvas 2D context. Tests will fail with `Cannot read properties of null (reading 'clearRect')`. This is expected and not a code bug.
- **External CDN images**: Mask overlays and the default demo photo are loaded from external CDNs (`s2.loli.net`, `cdn.sohucs.com`). Internet access is needed at runtime for the app to display images correctly.
- **Lint / build / dev**: Standard CRA commands — see `package.json` scripts and `README.md`. Lint via `npx eslint src/`; build via `yarn build`; dev server via `yarn start`.
