import './style.css'
import heroImg from './assets/hero.png'
import typescriptLogo from './assets/typescript.svg'
import viteLogo from './assets/vite.svg'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<section id="center">
  <div class="hero">
    <img src="${heroImg}" class="base" width="170" height="179">
    <img src="${typescriptLogo}" class="framework" alt="TypeScript logo"/>
    <img src="${viteLogo}" class="vite" alt="Vite logo" />
  </div>
  <div>
    <h1>Get started</h1>
    <p>Edit <code>src/main.ts</code> and save to test <code>HMR</code></p>
  </div>
  <button id="counter" type="button" class="counter"></button>
</section>

<div class="ticks"></div>

<section id="next-steps">
  <div id="docs">
    <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#documentation-icon"></use></svg>
    <h2>Documentation</h2>
    <p>Your questions, answered</p>
    <ul>
      <li>
        <a href="https://vite.dev/" target="_blank">
          <img class="logo" src="${viteLogo}" alt="" />
          Explore Vite
        </a>
      </li>
      <li>
        <a href="https://www.typescriptlang.org" target="_blank">
          <img class="button-icon" src="${typescriptLogo}" alt="">
          Learn more
        </a>
      </li>
    </ul>
  </div>
  <div id="social">
    <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#social-icon"></use></svg>
    <h2>Connect with us</h2>
    <p>Join the Vite community</p>
    <ul>
      <li><a href="https://github.com/vitejs/vite" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>GitHub</a></li>
      <li><a href="https://chat.vite.dev/" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#discord-icon"></use></svg>Discord</a></li>
      <li><a href="https://x.com/vite_js" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#x-icon"></use></svg>X.com</a></li>
      <li><a href="https://bsky.app/profile/vite.dev" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#bluesky-icon"></use></svg>Bluesky</a></li>
    </ul>
  </div>
</section>

<section class="cli-panel" aria-labelledby="cli-title">
  <div class="cli-panel-header">
    <div>
      <p class="eyebrow">tinyjs resource</p>
      <h2 id="cli-title">CLI output</h2>
    </div>
    <button id="cli-run" type="button">Run CLI</button>
  </div>
  <p id="cli-status" role="status">Ready.</p>
  <pre id="cli-output" aria-live="polite"></pre>
</section>

<div class="ticks"></div>
<section id="spacer"></section>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

const cliRunButton = document.querySelector<HTMLButtonElement>('#cli-run')!
const cliStatus = document.querySelector<HTMLElement>('#cli-status')!
const cliOutput = document.querySelector<HTMLElement>('#cli-output')!
let cliRunning = false

function setCliRunning(running: boolean) {
  cliRunning = running
  cliRunButton.disabled = running
  cliRunButton.textContent = running ? 'Running...' : 'Run CLI'
}

function appendCliOutput(line: string, stream: 'stdout' | 'stderr') {
  const prefix = stream === 'stderr' ? '[stderr] ' : ''
  cliOutput.textContent += `${prefix}${line}\n`
  cliOutput.scrollTop = cliOutput.scrollHeight
}

tiny.api.on('cli-output', ({ stream, line }: { stream: 'stdout' | 'stderr'; line: string }) => {
  appendCliOutput(line, stream)
})

async function runCli() {
  if (cliRunning) return

  setCliRunning(true)
  cliOutput.textContent = ''
  cliStatus.textContent = 'Starting CLI...'

  try {
    const { code, signal } = await tiny.api.call('runCli')
    if (code === 0) {
      cliStatus.textContent = 'CLI finished successfully.'
    } else if (code !== null) {
      cliStatus.textContent = `CLI exited with code ${code}.`
    } else {
      cliStatus.textContent = `CLI terminated by signal ${signal ?? 'unknown'}.`
    }
  } catch (error) {
    cliStatus.textContent = `Unable to start CLI: ${error instanceof Error ? error.message : error}`
  } finally {
    setCliRunning(false)
  }
}

cliRunButton.addEventListener('click', () => void runCli())
