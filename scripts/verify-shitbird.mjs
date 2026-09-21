// Optional real-render endurance check. Start the site on 3101, then run:
// node scripts/verify-shitbird.mjs
// This steers with canvas pixels and ordinary Space events; no runtime test API.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

await mkdir("test-results/shitbird-endurance", { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    // Fixed centers isolate the actual browser clock/input/rendering from the
    // separately tested random course generator. This is an isolated context.
    Math.random = () => 0.5;
    sessionStorage.setItem("wcl.session.v2", JSON.stringify({ version: 2, data: {
      readmeShown: true, startupPlayed: true, unlocked: true, page: 0,
      originPage: null, dismissedNotificationIds: [],
    } }));
  });
  await page.goto(`${process.env.SHITBIRD_URL ?? "http://127.0.0.1:3101"}/games/shitbird?view=os`);
  await page.getByRole("button", { name: "Let’s make poor decisions →" }).click();
  await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const probe = document.createElement("canvas");
    probe.width = 360; probe.height = 540;
    const context = probe.getContext("2d", { willReadFrequently: true });
    let lastFlap = -1000;
    const fly = (time) => {
      const game = document.querySelector('[data-game="shitbird"]');
      if (!game || !canvas.isConnected) return;
      if (game.dataset.phase === "playing") {
        context.drawImage(canvas, 0, 0, 360, 540);
        const pixels = context.getImageData(86, 200, 26, 115).data;
        let sumY = 0, count = 0;
        // The orange beak remains distinct from this fixed course's open sky.
        // The registered cream/teal wings can animate without confusing steering.
        for (let y = 0; y < 115; y++) for (let x = 0; x < 26; x++) {
          const i = (y * 26 + x) * 4;
          if (pixels[i] > 180 && pixels[i + 1] > 70 && pixels[i + 1] < 170 && pixels[i + 2] < 90) {
            sumY += y + 200; count++;
          }
        }
        if (count > 2 && sumY / count > 257 && time - lastFlap > 140) {
          lastFlap = time;
          canvas.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }));
          canvas.dispatchEvent(new KeyboardEvent("keyup", { code: "Space", key: " ", bubbles: true }));
        }
      }
      requestAnimationFrame(fly);
    };
    requestAnimationFrame(fly);
  });
  const captured = new Set();
  let score = 0;
  const deadline = Date.now() + 180000;
  while (score < 50 && Date.now() < deadline) {
    await page.waitForTimeout(1000);
    const phase = await page.locator('[data-game="shitbird"]').getAttribute("data-phase");
    assert.notEqual(phase, "dead", "The controlled browser flight collided");
    if (phase === "paused") await page.getByRole("button", { name: "Resume flight →" }).click();
    score = Number(await page.getByTestId("shitbird-score").textContent());
    for (const threshold of [4, 20, 50]) {
      if (score >= threshold && !captured.has(threshold)) {
        captured.add(threshold);
        await page.screenshot({ path: `test-results/shitbird-endurance/score-${threshold}.png` });
        console.log(`Rendered flight: score ${score}, ${phase}`);
      }
    }
  }
  assert.ok(score >= 50, "Flight did not reach the cap and continue beyond it");
  await page.reload();
  await page.getByRole("button", { name: "Let’s make poor decisions →" }).waitFor();
  const saved = await page.evaluate(() => ({
    best: JSON.parse(localStorage.getItem("wcl.games.v1")).data.shitbird.best,
    milestones: JSON.parse(localStorage.getItem("wcl.discoveries.v1")).data,
  }));
  assert.ok(saved.best >= 50);
  assert.ok(saved.milestones.achievementIds.includes("shitbird.max"));
  assert.ok(saved.milestones.discoveredSecretIds.includes("games.shitbird-cap"));
  assert.deepEqual(errors, []);
  console.log(`PASS: ${score} obstacles, capped difficulty, best-score persistence and shared milestones.`);
} finally {
  await browser.close();
}
