// tinyjs backend — full system access via txiki.js (the 'tjs' global).
// Every api method is callable from the page: await tiny.api.call('hello', {...})
const CLI_BINARIES = {
  macos: 'cli-x86_64-apple-darwin',
  linux: 'cli-x86_64-unknown-linux-gnu',
  windows: 'cli-x86_64-pc-windows-msvc.exe',
};

let cliRunning = false;

// txiki has no tjs.platform, so this mirrors the runtime's own OS checks.
function cliBinaryName(): string {
  if (tjs.env.OS === 'Windows_NT') return CLI_BINARIES.windows;
  if (/linux/i.test(globalThis.navigator?.platform ?? '')) return CLI_BINARIES.linux;
  return CLI_BINARIES.macos;
}

// tinyjs copies resources without the executable bit, so the binary is copied
// to the app cache dir (outside the signed .app) and made executable there.
async function prepareCli(app: TinyApp): Promise<string> {
  const resources = app.paths.resources;
  if (!resources) throw new Error('this build has no bundled resources');

  const name = cliBinaryName();
  const source = resources + '/' + name;
  const dir = app.paths.cache + '/cli';
  const target = dir + '/' + name;

  await tjs.makeDir(dir, { recursive: true });
  const sourceSize = (await tjs.stat(source)).size;
  let targetSize = -1;
  try {
    targetSize = (await tjs.stat(target)).size;
  } catch {}
  if (targetSize !== sourceSize) {
    await tjs.writeFile(target, await tjs.readFile(source));
  }
  await tjs.chmod(target, 0o755);
  return target;
}

async function pumpLines(stream: ReadableStream<Uint8Array>, onLine: (line: string) => void) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    pending += decoder.decode(value, { stream: true });
    const lines = pending.split('\n');
    pending = lines.pop() ?? '';
    for (const line of lines) onLine(line.replace(/\r$/, ''));
  }
  pending += decoder.decode();
  if (pending) onLine(pending);
}

export const api: Record<string, TinyApiHandler> = {
  hello: async ({ name }: { name: string }) => 'hi ' + name + ' — from the backend',

  runCli: async (_params, app: TinyApp) => {
    if (cliRunning) throw new Error('CLI is already running');
    cliRunning = true;
    try {
      const exe = await prepareCli(app);
      const proc = tjs.spawn([exe], { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' });
      await Promise.all([
        pumpLines(proc.stdout, (line) => app.push('cli-output', { stream: 'stdout', line })),
        pumpLines(proc.stderr, (line) => app.push('cli-output', { stream: 'stderr', line })),
      ]);
      const status = await proc.wait();
      const signal: string | null = status.term_signal || null;
      return { code: signal ? null : status.exit_status, signal };
    } finally {
      cliRunning = false;
    }
  },
};

export function init(app: TinyApp) {
  // window is up; push events with app.push('event', data)
}
