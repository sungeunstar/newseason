import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("C:/Users/sltim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const targetDir = path.join(root, "assets/skaldworks-chapter");

const crops = [
  {
    source: "01-brief.png",
    name: "01-brief-editor-focus.png",
    area: { left: 390, top: 300, width: 1100, height: 630 },
  },
  {
    source: "01-brief.png",
    name: "01-brief-review-focus.png",
    area: { left: 3370, top: 90, width: 440, height: 660 },
  },
  {
    source: "06-design-components.png",
    name: "06-design-components-core.png",
    area: { left: 0, top: 0, width: 2400, height: 580 },
  },
  {
    source: "02-structure.png",
    name: "02-structure-core.png",
    area: { left: 390, top: 600, width: 3000, height: 900 },
  },
  {
    source: "04-crosscheck.png",
    name: "04-claude-terminal.png",
    area: { left: 915, top: 805, width: 1145, height: 850 },
  },
  {
    source: "04-crosscheck.png",
    name: "04-codex-terminal.png",
    area: { left: 2445, top: 865, width: 1150, height: 800 },
  },
  {
    source: "05-built-product.png",
    name: "05-kpi-card.png",
    area: { left: 430, top: 385, width: 820, height: 220 },
  },
  {
    source: "05-built-product.png",
    name: "05-progress-chart.png",
    area: { left: 850, top: 760, width: 1310, height: 360 },
  },
  {
    source: "05-built-product.png",
    name: "05-work-detail.png",
    area: { left: 430, top: 1290, width: 800, height: 300 },
  },
];

for (const crop of crops) {
  await sharp(path.join(targetDir, crop.source))
    .extract(crop.area)
    .png({ compressionLevel: 9 })
    .toFile(path.join(targetDir, crop.name));
}

console.log(`Built ${crops.length} SCALDWORKS readability crops.`);
