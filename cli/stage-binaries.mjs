import { chmodSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const cliDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = join(cliDirectory, "dist");
const binariesDirectory = join(
  cliDirectory,
  "..",
  "app",
  "src-tauri",
  "binaries",
);
const pkgCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const targets = [
  {
    pkgTarget: "node24-linux-x64",
    pkgOutput: "cli-linux-x64",
    tauriOutput: "cli-x86_64-unknown-linux-gnu",
  },
  {
    pkgTarget: "node24-macos-x64",
    pkgOutput: "cli-macos-x64",
    tauriOutput: "cli-x86_64-apple-darwin",
  },
  {
    pkgTarget: "node24-win-x64",
    pkgOutput: "cli-win-x64.exe",
    tauriOutput: "cli-x86_64-pc-windows-msvc.exe",
  },
];

rmSync(outputDirectory, { force: true, recursive: true });
mkdirSync(outputDirectory, { recursive: true });
mkdirSync(binariesDirectory, { recursive: true });

for (const target of targets) {
  const pkgOutputPath = join(outputDirectory, target.pkgOutput);
  const tauriOutputPath = join(binariesDirectory, target.tauriOutput);

  rmSync(tauriOutputPath, { force: true });
  execFileSync(
    pkgCommand,
    [
      "exec",
      "pkg",
      ".",
      "--targets",
      target.pkgTarget,
      "--output",
      pkgOutputPath,
      "--compress",
      "Brotli",
    ],
    { cwd: cliDirectory, stdio: "inherit" },
  );
  copyFileSync(pkgOutputPath, tauriOutputPath);

  if (process.platform !== "win32") {
    chmodSync(tauriOutputPath, 0o755);
  }
}

console.log(`Staged ${targets.length} Tauri sidecar binaries in ${binariesDirectory}`);