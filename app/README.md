# Tauri + Vanilla TS

This template should help get you started developing with Tauri in vanilla HTML, CSS and Typescript.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## CLI Sidecar

The CLI is packaged with `@yao-pkg/pkg` and bundled as a Tauri sidecar. Node.js 24 is recommended for the cross-platform target build.

From the repository root:

```sh
pnpm build:cli
pnpm dev
```

The Tauri build hooks run `pnpm build:sidecar` automatically, so `pnpm dev` and `pnpm build` also refresh the sidecar binaries. The app's **Run CLI** button starts `binaries/cli` from JavaScript and streams its stdout and stderr into the output panel.

The generated binaries are staged under `app/src-tauri/binaries/` with the target-triple names required by Tauri. They are ignored by Git and should be rebuilt on each target platform or release runner.
