// Run against a production server on :3100. Comparisons change only rendering density.
import { chromium, devices } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch();
const samples = [];
try {
  for (const density of [2, 1.5, 1]) {
    const context = await browser.newContext({
      ...devices["Pixel 7"],
      viewport: { width: 844, height: 390 },
    });
    const page = await context.newPage();
    await page.addInitScript((value) => {
      Object.defineProperty(window, "devicePixelRatio", { get: () => value });
      Math.random = () => 1 / 4294967296;
      HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error("Profile viewport fallback"));
    }, density);
    await page.goto("http://127.0.0.1:3100/games/arcade/low-tide-loot");
    await page.getByRole("button", { name: "Start game" }).click();
    await page.waitForTimeout(1000);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Performance.enable");
    const before = await cdp.send("Performance.getMetrics");
    const frame = await page.evaluate(() => new Promise((resolve) => {
      const times = [];
      let previous = performance.now();
      const tick = (now) => {
        times.push(now - previous);
        previous = now;
        if (times.length < 121) return requestAnimationFrame(tick);
        times.shift();
        times.sort((a, b) => a - b);
        const canvas = document.querySelector("canvas");
        const gl = canvas.getContext("webgl");
        const debug = gl.getExtension("WEBGL_debug_renderer_info");
        resolve({
          meanMs: times.reduce((a, b) => a + b, 0) / times.length,
          p95Ms: times[Math.floor(times.length * .95)],
          frames: times.length,
          drawingBuffer: [canvas.width, canvas.height],
          effectiveDensity: canvas.width / canvas.getBoundingClientRect().width,
          renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "unavailable",
        });
      };
      requestAnimationFrame(tick);
    }));
    const after = await cdp.send("Performance.getMetrics");
    const value = (snapshot, name) => snapshot.metrics.find((m) => m.name === name)?.value ?? 0;
    const result = {
      density, ...frame,
      scriptMsPerFrame: (value(after, "ScriptDuration") - value(before, "ScriptDuration")) * 1000 / frame.frames,
      taskMsPerFrame: (value(after, "TaskDuration") - value(before, "TaskDuration")) * 1000 / frame.frames,
    };
    samples.push(result);
    console.log(JSON.stringify(result));
    await context.close();
  }
  await mkdir("test-results", { recursive: true });
  await writeFile("test-results/loot-render-profile.json", JSON.stringify(samples, null, 2));
} finally {
  await browser.close();
}
