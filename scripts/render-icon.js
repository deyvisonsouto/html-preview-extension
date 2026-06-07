// One-off script: render icon.svg -> icon.png at 256x256 with proper transparency.
// Run with: node scripts/render-icon.js
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const svgPath = path.join(__dirname, '..', 'icon.svg');
const outPath = path.join(__dirname, '..', 'icon.png');

const svg = fs.readFileSync(svgPath, 'utf8');

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 256 },
  background: 'rgba(0,0,0,0)',
});

const png = resvg.render().asPng();
fs.writeFileSync(outPath, png);

console.log(`Wrote ${outPath} (${png.length} bytes)`);
