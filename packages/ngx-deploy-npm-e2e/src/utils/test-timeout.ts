const WINDOWS_TIMEOUT_MULTIPLIER = 2;

function applyWindowsMultiplier(ms: number): number {
  return process.platform === 'win32' ? ms * WINDOWS_TIMEOUT_MULTIPLIER : ms;
}

/** Default e2e test timeout (2 min on Linux/macOS, 4 min on Windows). */
export const e2eTestTimeout = () => applyWindowsMultiplier(120_000);

/** Longer e2e tests, e.g. install with multiple libs (3 min → 6 min on Windows). */
export const e2eTestTimeoutLong = () => applyWindowsMultiplier(180_000);

/** Extended e2e tests, e.g. angular publish setup (4 min → 8 min on Windows). */
export const e2eTestTimeoutExtended = () => applyWindowsMultiplier(240_000);

/** Jest global default — matches the longest per-test timeout. */
export const maxE2eTestTimeout = () => e2eTestTimeoutExtended();
