import { invoke } from "@tauri-apps/api/core";
import { Command } from "@tauri-apps/plugin-shell";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;
let cliRunButtonEl: HTMLButtonElement | null;
let cliStatusEl: HTMLElement | null;
let cliOutputEl: HTMLElement | null;
let cliRunning = false;

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

function setCliRunning(running: boolean) {
  cliRunning = running;

  if (cliRunButtonEl) {
    cliRunButtonEl.disabled = running;
    cliRunButtonEl.textContent = running ? "Running..." : "Run CLI";
  }
}

function appendCliOutput(line: string, stream: "stdout" | "stderr") {
  if (!cliOutputEl) {
    return;
  }

  const prefix = stream === "stderr" ? "[stderr] " : "";
  cliOutputEl.textContent += `${prefix}${line}${line.endsWith("\n") ? "" : "\n"}`;
  cliOutputEl.scrollTop = cliOutputEl.scrollHeight;
}

async function runCli() {
  if (cliRunning || !cliOutputEl || !cliStatusEl) {
    return;
  }

  setCliRunning(true);
  cliOutputEl.textContent = "";
  cliStatusEl.textContent = "Starting CLI...";

  const command = Command.sidecar("binaries/cli");
  let finished = false;
  const finish = (status: string) => {
    if (finished) {
      return;
    }

    finished = true;
    cliStatusEl!.textContent = status;
    setCliRunning(false);
  };

  command.stdout.on("data", (line) => appendCliOutput(line, "stdout"));
  command.stderr.on("data", (line) => appendCliOutput(line, "stderr"));
  command.on("close", ({ code, signal }) => {
    if (code === 0) {
      finish("CLI finished successfully.");
    } else if (code !== null) {
      finish(`CLI exited with code ${code}.`);
    } else {
      finish(`CLI terminated by signal ${signal ?? "unknown"}.`);
    }
  });
  command.on("error", (error) => finish(`CLI error: ${error}`));

  try {
    await command.spawn();
  } catch (error) {
    finish(`Unable to start CLI: ${error}`);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  cliRunButtonEl = document.querySelector("#cli-run");
  cliStatusEl = document.querySelector("#cli-status");
  cliOutputEl = document.querySelector("#cli-output");

  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    void greet();
  });
  cliRunButtonEl?.addEventListener("click", () => void runCli());
});
