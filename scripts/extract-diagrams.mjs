import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const directory = '.archify/workflow-vue-react-20261026-085139';
await mkdir('public/diagrams', { recursive: true });
const index = {};
const checks = [];
const css = `svg{font-family:system-ui,'Microsoft YaHei',sans-serif;background:#fafbf9}.t-primary{fill:#172e25}.t-muted,.t-dim{fill:#52665c}.c-grid{fill:none;stroke:#d9e2dc}.c-lane{fill:#eef3ef;stroke:#cbd8cf}.c-mask{fill:#fafbf9}.c-frontend{fill:#e6f2e9;stroke:#568275}.c-backend{fill:#e8eef7;stroke:#657f9d}.c-database{fill:#eee8f7;stroke:#927ab1}.c-security{fill:#f8e9df;stroke:#b7825b}.a-default,.a-emphasis,.a-security,.a-dashed{fill:none;stroke:#657b6e}.a-dashed{stroke-dasharray:4 4}.m-default,.m-emphasis,.m-security,.m-dashed{fill:#657b6e}.c-label{fill:#fafbf9}.t-edge{fill:#344f40}@media(prefers-color-scheme:dark){svg{background:#17201b}.t-primary{fill:#e5eee8}.t-muted,.t-dim,.t-edge{fill:#b4c7bb}.c-grid{stroke:#35463a}.c-lane{fill:#1d2a22;stroke:#3b5042}.c-mask,.c-label{fill:#17201b}.c-frontend{fill:#253b2f;stroke:#80b594}.c-backend{fill:#293643;stroke:#8ba8c9}.a-default,.a-emphasis,.a-security,.a-dashed{stroke:#aac3b3}.m-default,.m-emphasis,.m-security,.m-dashed{fill:#aac3b3}}`;
for (let i = 1; i <= 11; i++) {
  const id = `F${String(i).padStart(2, '0')}`;
  const candidate = JSON.parse(await readFile(`docs/diagrams/${id}.json`, 'utf8'));
  const html = await readFile(`${directory}/${id}.html`, 'utf8');
  let svg = html.match(/<svg\b[^>]*>[\s\S]*?<\/svg>/)?.[0];
  if (!svg) throw new Error(`SVG missing: ${id}`);
  const [, width, height] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  // The embedded, static edition has no node-focus runtime. Remove misleading controls.
  svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace(/Agent 逻辑/g, id === 'F01' ? 'React' : '处理步骤').replace(/用户界面/g, 'Vue')
    .replace(/ tabindex="0"| role="button"| aria-pressed="false"/g, '')
    .replace(/font-size="11"/g, 'font-size="15"').replace(/font-size="8"/g, 'font-size="12"').replace(/font-size="10"/g, 'font-size="13"').replace(/font-size="7.5"/g, 'font-size="11"')
    .replace('</defs>', `</defs><style>${css}.t-edge-emphasis,.t-edge-default{fill:#344f40}@media(prefers-color-scheme:dark){.t-edge-emphasis,.t-edge-default{fill:#b4c7bb}}</style>`);
  await writeFile(`public/diagrams/${id}.svg`, svg);
  // Explicit theme editions follow the site's theme rather than only the OS preference.
  const dark = svg.replaceAll('@media(prefers-color-scheme:dark){', '@media all{');
  const light = svg.replaceAll('@media(prefers-color-scheme:dark)', '@media not all');
  await writeFile(`public/diagrams/${id}-dark.svg`, dark);
  await writeFile(`public/diagrams/${id}-light.svg`, light);
  index[id] = { title: candidate.meta.title, width: Number(width), height: Number(height), caption: candidate.cards[0].items[0] };
  const receiptPath = `${directory}/${id === 'F07' ? 'F07-review-2/' : ''}${id.toLowerCase()}.finalize-summary.json`;
  const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
  checks.push({ id, diagramType: 'workflow', quality: 'showcase', status: receipt.status, gates: receipt.gates, specificationSha256: receipt.specification.sha256, artifactSha256: receipt.artifact.sha256, artifactPath: receipt.artifact.path, embeddedSvgSha256: createHash('sha256').update(svg).digest('hex'), visualReview: receipt.visualReview });
}
await writeFile('components/learning/diagram-index.json', JSON.stringify(index, null, 2) + '\n');
await writeFile('docs/diagrams/validation.json', JSON.stringify({ note: 'Gates apply to the original standalone Archify HTML. Embedded SVG editions adapt theme, typography and legend; the site viewer is verified separately by browser tests.', checks }, null, 2) + '\n');
