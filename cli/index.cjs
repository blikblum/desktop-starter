const DURATION_TICKS = 30;
const TICK_INTERVAL_MS = 1000;

const messages = [
  { level: "INFO", text: "Loading configuration" },
  { level: "DEBUG", text: "Resolved 4 worker threads" },
  { level: "INFO", text: "Connected to simulated backend" },
  { level: "INFO", text: "Processing batch" },
  { level: "DEBUG", text: "Cache hit ratio 92%" },
  { level: "WARN", text: "Slow response, retrying" },
  { level: "INFO", text: "Batch completed" },
  { level: "DEBUG", text: "Heap usage stable" },
];

function entryFor(tick) {
  return messages[(tick - 1) % messages.length];
}

function log(level, text) {
  const line = `${new Date().toISOString()} [${level}] ${text}`;
  if (level === "WARN") {
    console.error(line);
  } else {
    console.log(line);
  }
}

let tick = 0;
log("INFO", `Starting simulated logging for ${DURATION_TICKS} seconds`);

const timer = setInterval(() => {
  tick += 1;

  if (tick > DURATION_TICKS) {
    clearInterval(timer);
    log("INFO", "Simulation finished");
    return;
  }

  const { level, text } = entryFor(tick);
  log(level, `(${tick}/${DURATION_TICKS}) ${text}`);
}, TICK_INTERVAL_MS);
