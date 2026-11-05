export interface AuthorityVisualSpec {
  aspectRatio?: '1200:627' | '1080:1080';
  brandName?: string;
  visualType?: 'table' | 'graph' | 'dial' | 'terminal' | 'pipeline' | 'metrics';
  headlinePart1?: string;
  headlinePart2?: string;
  badgeText?: string;
  bottomSub?: string;
  bottomHook?: string;

  // Table archetype specifics
  tableTitle?: string;
  tableHeaders?: string[];
  tableRows?: Array<{ name: string; c1: string; c2: string; c3: string; score: string; isYou?: boolean }>;

  // Graph archetype specifics
  graphNodes?: Array<{ name: string; rel: string }>;

  // Dial archetype specifics
  dialScore?: number;
  dialLabel?: string;
  dialCards?: Array<{ pct: string; title: string; sub: string }>;

  // Terminal archetype specifics
  terminalCommand?: string;
  terminalSuccess?: string;
  terminalSuccessDesc?: string;
  terminalFailure?: string;
  terminalFailureDesc?: string;

  // Pipeline archetype specifics
  pipelineSteps?: Array<{ num: string; title: string; detail: string; status: string }>;

  // Metrics archetype specifics
  metricCards?: Array<{ label: string; value: string; title: string; sub: string }>;
}

function safe(str?: string | number): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateAuthorityTechVisualSvg(params: AuthorityVisualSpec): string {
  const isSquare = params.aspectRatio === '1080:1080';
  const width = isSquare ? 1080 : 1200;
  const height = isSquare ? 1080 : 627;
  const brandName = safe(params.brandName || 'Tech Sheba');
  const type = params.visualType || 'table';

  const h1 = safe((params.headlinePart1 || 'Why Your Competitor').slice(0, 42));
  const h2 = safe((params.headlinePart2 || 'Is Ranking Higher in AI.').slice(0, 42));
  const badgeText = safe((params.badgeText || 'AI AUTHORITY AUDIT').toUpperCase().slice(0, 28));
  const bottomHook = safe((params.bottomHook || 'How far behind are you?').slice(0, 52));
  const bottomSub = safe((params.bottomSub || "Your standard tools don't show this critical gap.").slice(0, 72));

  const green = '#00E575';
  const cardBg = '#09100C';
  const borderGreen = 'rgba(0, 229, 117, 0.35)';

  let innerVisual = '';

  if (type === 'table') {
    const tableTitle = safe(params.tableTitle || 'AI Performance Matrix · Live Search Gap');
    const cols = (params.tableHeaders || ['Entity', 'ChatGPT', 'Perplexity', 'Gemini', 'Score']).map(c => safe(c));
    const rawRows = params.tableRows || [
      { name: 'Competitor A', c1: '47', c2: '31', c3: '22', score: '84' },
      { name: 'Competitor B', c1: '38', c2: '26', c3: '19', score: '79' },
      { name: 'Competitor C', c1: '29', c2: '18', c3: '14', score: '71' },
      { name: 'You (Current)', c1: '8', c2: '5', c3: '3', score: '58', isYou: true }
    ];

    if (isSquare) {
      innerVisual = `
        <g transform="translate(90, 280)">
          <rect width="900" height="460" rx="20" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
          <text x="36" y="44" fill="${green}" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700">${tableTitle}</text>
          
          <g transform="translate(36, 92)">
            <text x="0" y="0" fill="#94A3B8" font-family="system-ui" font-size="14" font-weight="600">${cols[0]}</text>
            <text x="250" y="0" fill="#94A3B8" font-family="system-ui" font-size="14" font-weight="600">${cols[1]}</text>
            <text x="430" y="0" fill="#94A3B8" font-family="system-ui" font-size="14" font-weight="600">${cols[2]}</text>
            <text x="590" y="0" fill="#94A3B8" font-family="system-ui" font-size="14" font-weight="600">${cols[3]}</text>
            <text x="740" y="0" fill="#94A3B8" font-family="system-ui" font-size="14" font-weight="600">${cols[4]}</text>
          </g>
          <line x1="36" y1="108" x2="864" y2="108" stroke="#14261B" stroke-width="1" />

          ${rawRows.slice(0, 4).map((row, idx) => {
            const yOffset = 152 + idx * 56;
            if (row.isYou) {
              return `
                <g transform="translate(36, ${yOffset})">
                  <rect x="-16" y="-24" width="860" height="46" rx="10" fill="#0E2218" fill-opacity="0.75" stroke="${green}" stroke-opacity="0.4" />
                  <rect x="-16" y="-24" width="5" height="46" rx="2" fill="${green}" />
                  <text x="0" y="6" fill="#FFFFFF" font-family="system-ui" font-size="17" font-weight="800">${safe(row.name)}</text>
                  <text x="250" y="6" fill="#F59E0B" font-family="monospace" font-size="17" font-weight="700">${safe(row.c1)}</text>
                  <text x="430" y="6" fill="#F59E0B" font-family="monospace" font-size="17" font-weight="700">${safe(row.c2)}</text>
                  <text x="590" y="6" fill="#F59E0B" font-family="monospace" font-size="17" font-weight="700">${safe(row.c3)}</text>
                  <text x="740" y="6" fill="${green}" font-family="monospace" font-size="19" font-weight="900">${safe(row.score)}</text>
                </g>
              `;
            }
            return `
              <g transform="translate(36, ${yOffset})">
                <text x="0" y="0" fill="#E2E8F0" font-family="system-ui" font-size="16" font-weight="600">${safe(row.name)}</text>
                <text x="250" y="0" fill="#CBD5E1" font-family="monospace" font-size="16">${safe(row.c1)}</text>
                <text x="430" y="0" fill="#CBD5E1" font-family="monospace" font-size="16">${safe(row.c2)}</text>
                <text x="590" y="0" fill="#CBD5E1" font-family="monospace" font-size="16">${safe(row.c3)}</text>
                <text x="740" y="0" fill="${green}" font-family="monospace" font-size="17" font-weight="700">${safe(row.score)}</text>
              </g>
            `;
          }).join('')}

          <text x="36" y="420" fill="#64748B" font-family="system-ui" font-size="13">Tracked across live LLM answer engines · ${brandName} Intelligence</text>
        </g>
      `;
    } else {
      // Landscape table
      innerVisual = `
        <g transform="translate(80, 205)">
          <rect width="1040" height="260" rx="16" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
          <g transform="translate(32, 45)">
            <text x="0" y="0" fill="#94A3B8" font-family="system-ui" font-size="13" font-weight="600">${cols[0]}</text>
            <text x="320" y="0" fill="#94A3B8" font-family="system-ui" font-size="13" font-weight="600">${cols[1]}</text>
            <text x="520" y="0" fill="#94A3B8" font-family="system-ui" font-size="13" font-weight="600">${cols[2]}</text>
            <text x="700" y="0" fill="#94A3B8" font-family="system-ui" font-size="13" font-weight="600">${cols[3]}</text>
            <text x="880" y="0" fill="#94A3B8" font-family="system-ui" font-size="13" font-weight="600">${cols[4]}</text>
          </g>
          <line x1="32" y1="60" x2="1008" y2="60" stroke="#14261B" stroke-width="1" />
          <g transform="translate(32, 105)">
            <text x="0" y="0" fill="#E2E8F0" font-family="system-ui" font-size="15" font-weight="600">${safe(rawRows[0]?.name || 'Top Competitor')}</text>
            <text x="320" y="0" fill="#CBD5E1" font-family="monospace" font-size="15">${safe(rawRows[0]?.c1 || '47')}</text>
            <text x="520" y="0" fill="#CBD5E1" font-family="monospace" font-size="15">${safe(rawRows[0]?.c2 || '31')}</text>
            <text x="700" y="0" fill="#CBD5E1" font-family="monospace" font-size="15">${safe(rawRows[0]?.c3 || '22')}</text>
            <text x="880" y="0" fill="${green}" font-family="monospace" font-size="16" font-weight="700">${safe(rawRows[0]?.score || '84')}</text>
          </g>
          <g transform="translate(32, 165)">
            <rect x="-14" y="-22" width="1008" height="42" rx="8" fill="#0E2218" fill-opacity="0.8" stroke="${green}" stroke-opacity="0.4" />
            <rect x="-14" y="-22" width="4" height="42" rx="2" fill="${green}" />
            <text x="0" y="6" fill="#FFFFFF" font-family="system-ui" font-size="16" font-weight="800">${safe(rawRows.find(r => r.isYou)?.name || 'You (Current Gap)')}</text>
            <text x="320" y="6" fill="#F59E0B" font-family="monospace" font-size="15" font-weight="700">${safe(rawRows.find(r => r.isYou)?.c1 || '8')}</text>
            <text x="520" y="6" fill="#F59E0B" font-family="monospace" font-size="15" font-weight="700">${safe(rawRows.find(r => r.isYou)?.c2 || '5')}</text>
            <text x="700" y="6" fill="#F59E0B" font-family="monospace" font-size="15" font-weight="700">${safe(rawRows.find(r => r.isYou)?.c3 || '3')}</text>
            <text x="880" y="6" fill="${green}" font-family="monospace" font-size="17" font-weight="900">${safe(rawRows.find(r => r.isYou)?.score || '58')}</text>
          </g>
          <text x="32" y="235" fill="#64748B" font-family="system-ui" font-size="12">Tracked across live LLM answer engines · ${brandName} Intelligence</text>
        </g>
      `;
    }
  } else if (type === 'graph') {
    const rawNodes = (params.graphNodes || [
      { name: 'Products', rel: 'produces' },
      { name: 'Founders', rel: 'founded_by' },
      { name: 'Category', rel: 'is_a' },
      { name: 'Geography', rel: 'operates_in' },
      { name: 'Partnerships', rel: 'partners_with' },
      { name: 'Customers', rel: 'serves' },
    ]).slice(0, 6);

    if (isSquare) {
      const coords = [
        { x: 540, y: 355 },
        { x: 755, y: 435 },
        { x: 755, y: 645 },
        { x: 540, y: 725 },
        { x: 325, y: 645 },
        { x: 325, y: 435 },
      ];
      const nodes = rawNodes.map((n, i) => ({ ...n, x: coords[i].x, y: coords[i].y }));

      innerVisual = `
        <g>
          <rect x="90" y="270" width="900" height="520" rx="20" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
          ${nodes.map(n => `
            <line x1="540" y1="540" x2="${n.x}" y2="${n.y}" stroke="${green}" stroke-opacity="0.4" stroke-width="1.8" />
            <rect x="${(540 + n.x)/2 - 46}" y="${(540 + n.y)/2 - 11}" width="92" height="22" rx="6" fill="#060C09" stroke="#13261C" />
            <text x="${(540 + n.x)/2}" y="${(540 + n.y)/2 + 4}" text-anchor="middle" fill="#94A3B8" font-family="monospace" font-size="11">${safe(n.rel)}</text>
          `).join('')}

          ${nodes.map(n => `
            <g transform="translate(${n.x}, ${n.y})">
              <circle cx="0" cy="0" r="46" fill="#07130D" stroke="${green}" stroke-width="1.8" />
              <text x="0" y="5" text-anchor="middle" fill="#FFFFFF" font-family="system-ui" font-size="13" font-weight="600">${safe(n.name)}</text>
            </g>
          `).join('')}

          <g transform="translate(540, 540)">
            <circle cx="0" cy="0" r="76" fill="#0A2417" stroke="${green}" stroke-width="3" filter="url(#nodeGlow)" />
            <text x="0" y="6" text-anchor="middle" fill="#FFFFFF" font-family="system-ui" font-size="18" font-weight="800">${brandName}</text>
          </g>
        </g>
      `;
    } else {
      // Landscape Graph
      const coordsLand = [
        { x: 600, y: 220 },
        { x: 860, y: 260 },
        { x: 860, y: 430 },
        { x: 600, y: 470 },
        { x: 340, y: 430 },
        { x: 340, y: 260 },
      ];
      const nodesLand = rawNodes.map((n, i) => ({ ...n, x: coordsLand[i].x, y: coordsLand[i].y }));

      innerVisual = `
        <g>
          <rect x="80" y="195" width="1040" height="320" rx="18" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
          ${nodesLand.map(n => `
            <line x1="600" y1="345" x2="${n.x}" y2="${n.y}" stroke="${green}" stroke-opacity="0.4" stroke-width="1.8" />
            <rect x="${(600 + n.x)/2 - 38}" y="${(345 + n.y)/2 - 10}" width="76" height="20" rx="5" fill="#060C09" stroke="#13261C" />
            <text x="${(600 + n.x)/2}" y="${(345 + n.y)/2 + 4}" text-anchor="middle" fill="#94A3B8" font-family="monospace" font-size="10">${safe(n.rel)}</text>
          `).join('')}

          ${nodesLand.map(n => `
            <g transform="translate(${n.x}, ${n.y})">
              <circle cx="0" cy="0" r="38" fill="#07130D" stroke="${green}" stroke-width="1.8" />
              <text x="0" y="4" text-anchor="middle" fill="#FFFFFF" font-family="system-ui" font-size="12" font-weight="600">${safe(n.name)}</text>
            </g>
          `).join('')}

          <g transform="translate(600, 345)">
            <circle cx="0" cy="0" r="62" fill="#0A2417" stroke="${green}" stroke-width="2.5" filter="url(#nodeGlow)" />
            <text x="0" y="5" text-anchor="middle" fill="#FFFFFF" font-family="system-ui" font-size="16" font-weight="800">${brandName}</text>
          </g>
        </g>
      `;
    }
  } else if (type === 'dial') {
    const score = params.dialScore || 78;
    const scoreLabel = safe(params.dialLabel || '/ 100 Score');
    const cards = (params.dialCards || [
      { pct: '30%', title: 'Content Structure', sub: 'Answer-first format, schema' },
      { pct: '25%', title: 'Entity Clarity', sub: 'Knowledge graph density' },
      { pct: '25%', title: 'Authority Signals', sub: 'E-E-A-T & verified citations' },
      { pct: '20%', title: 'Freshness Velocity', sub: 'Active sync & timestamp updates' }
    ]).slice(0, 4);

    if (isSquare) {
      innerVisual = `
        <g transform="translate(90, 275)">
          <rect width="900" height="515" rx="20" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
          
          <!-- Center Dial -->
          <g transform="translate(450, 115)">
            <circle cx="0" cy="0" r="85" fill="none" stroke="#14261B" stroke-width="12" />
            <path d="M 0 -85 A 85 85 0 1 1 -68 51" fill="none" stroke="${green}" stroke-width="12" stroke-linecap="round" filter="url(#nodeGlow)" />
            <text x="0" y="16" text-anchor="middle" fill="${green}" font-family="system-ui" font-size="58" font-weight="900" letter-spacing="-1">${score}</text>
            <text x="0" y="44" text-anchor="middle" fill="#94A3B8" font-family="system-ui" font-size="13" font-weight="600">${scoreLabel}</text>
          </g>

          <!-- 4 Metric Cards Grid -->
          <g transform="translate(30, 245)">
            <g transform="translate(0, 0)">
              <rect width="405" height="110" rx="14" fill="#060C09" stroke="${borderGreen}" stroke-width="1.2" />
              <text x="24" y="36" fill="${green}" font-family="system-ui" font-size="18" font-weight="800">${safe(cards[0]?.pct || '30%')}</text>
              <text x="24" y="62" fill="#FFFFFF" font-family="system-ui" font-size="15" font-weight="700">${safe(cards[0]?.title || 'Structure')}</text>
              <text x="24" y="85" fill="#94A3B8" font-family="system-ui" font-size="12">${safe(cards[0]?.sub || '')}</text>
            </g>
            <g transform="translate(435, 0)">
              <rect width="405" height="110" rx="14" fill="#060C09" stroke="${borderGreen}" stroke-width="1.2" />
              <text x="24" y="36" fill="${green}" font-family="system-ui" font-size="18" font-weight="800">${safe(cards[1]?.pct || '25%')}</text>
              <text x="24" y="62" fill="#FFFFFF" font-family="system-ui" font-size="15" font-weight="700">${safe(cards[1]?.title || 'Entity')}</text>
              <text x="24" y="85" fill="#94A3B8" font-family="system-ui" font-size="12">${safe(cards[1]?.sub || '')}</text>
            </g>
            <g transform="translate(0, 125)">
              <rect width="405" height="110" rx="14" fill="#060C09" stroke="${borderGreen}" stroke-width="1.2" />
              <text x="24" y="36" fill="${green}" font-family="system-ui" font-size="18" font-weight="800">${safe(cards[2]?.pct || '25%')}</text>
              <text x="24" y="62" fill="#FFFFFF" font-family="system-ui" font-size="15" font-weight="700">${safe(cards[2]?.title || 'Authority')}</text>
              <text x="24" y="85" fill="#94A3B8" font-family="system-ui" font-size="12">${safe(cards[2]?.sub || '')}</text>
            </g>
            <g transform="translate(435, 125)">
              <rect width="405" height="110" rx="14" fill="#060C09" stroke="${borderGreen}" stroke-width="1.2" />
              <text x="24" y="36" fill="${green}" font-family="system-ui" font-size="18" font-weight="800">${safe(cards[3]?.pct || '20%')}</text>
              <text x="24" y="62" fill="#FFFFFF" font-family="system-ui" font-size="15" font-weight="700">${safe(cards[3]?.title || 'Freshness')}</text>
              <text x="24" y="85" fill="#94A3B8" font-family="system-ui" font-size="12">${safe(cards[3]?.sub || '')}</text>
            </g>
          </g>
        </g>
      `;
    } else {
      // Landscape Dial
      innerVisual = `
        <g transform="translate(80, 200)">
          <rect width="1040" height="310" rx="18" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
          <g transform="translate(200, 150)">
            <circle cx="0" cy="0" r="80" fill="none" stroke="#14261B" stroke-width="10" />
            <path d="M 0 -80 A 80 80 0 1 1 -64 48" fill="none" stroke="${green}" stroke-width="10" stroke-linecap="round" filter="url(#nodeGlow)" />
            <text x="0" y="14" text-anchor="middle" fill="${green}" font-family="system-ui" font-size="52" font-weight="900">${score}</text>
            <text x="0" y="40" text-anchor="middle" fill="#94A3B8" font-family="system-ui" font-size="12" font-weight="600">${scoreLabel}</text>
          </g>
          <g transform="translate(380, 35)">
            <g transform="translate(0, 0)">
              <rect width="300" height="110" rx="12" fill="#060C09" stroke="${borderGreen}" stroke-width="1" />
              <text x="20" y="32" fill="${green}" font-family="system-ui" font-size="16" font-weight="800">${safe(cards[0]?.pct || '30%')}</text>
              <text x="20" y="58" fill="#FFFFFF" font-family="system-ui" font-size="14" font-weight="700">${safe(cards[0]?.title || 'Structure')}</text>
              <text x="20" y="82" fill="#94A3B8" font-family="system-ui" font-size="11">${safe(cards[0]?.sub || '')}</text>
            </g>
            <g transform="translate(325, 0)">
              <rect width="300" height="110" rx="12" fill="#060C09" stroke="${borderGreen}" stroke-width="1" />
              <text x="20" y="32" fill="${green}" font-family="system-ui" font-size="16" font-weight="800">${safe(cards[1]?.pct || '25%')}</text>
              <text x="20" y="58" fill="#FFFFFF" font-family="system-ui" font-size="14" font-weight="700">${safe(cards[1]?.title || 'Entity')}</text>
              <text x="20" y="82" fill="#94A3B8" font-family="system-ui" font-size="11">${safe(cards[1]?.sub || '')}</text>
            </g>
            <g transform="translate(0, 130)">
              <rect width="300" height="110" rx="12" fill="#060C09" stroke="${borderGreen}" stroke-width="1" />
              <text x="20" y="32" fill="${green}" font-family="system-ui" font-size="16" font-weight="800">${safe(cards[2]?.pct || '25%')}</text>
              <text x="20" y="58" fill="#FFFFFF" font-family="system-ui" font-size="14" font-weight="700">${safe(cards[2]?.title || 'Authority')}</text>
              <text x="20" y="82" fill="#94A3B8" font-family="system-ui" font-size="11">${safe(cards[2]?.sub || '')}</text>
            </g>
            <g transform="translate(325, 130)">
              <rect width="300" height="110" rx="12" fill="#060C09" stroke="${borderGreen}" stroke-width="1" />
              <text x="20" y="32" fill="${green}" font-family="system-ui" font-size="16" font-weight="800">${safe(cards[3]?.pct || '20%')}</text>
              <text x="20" y="58" fill="#FFFFFF" font-family="system-ui" font-size="14" font-weight="700">${safe(cards[3]?.title || 'Freshness')}</text>
              <text x="20" y="82" fill="#94A3B8" font-family="system-ui" font-size="11">${safe(cards[3]?.sub || '')}</text>
            </g>
          </g>
        </g>
      `;
    }
  } else if (type === 'terminal') {
    const cmd = safe(params.terminalCommand || '$ ai_search.query()');
    const suc = safe(params.terminalSuccess || 'RETRIEVED  ➔  CITED  ➔  RENDERED');
    const sucDesc = safe(params.terminalSuccessDesc || '✓ Your page appeared in the AI answer');
    const fail = safe(params.terminalFailure || 'NOT_RETRIEVED  ➔  INVISIBLE');
    const failDesc = safe(params.terminalFailureDesc || "✕ Your page doesn't exist in this moment");

    if (isSquare) {
      innerVisual = `
        <g transform="translate(90, 290)">
          <!-- Terminal 1 (Success) -->
          <g transform="translate(0, 0)">
            <rect width="900" height="205" rx="18" fill="#070E0A" stroke="${borderGreen}" stroke-width="1.5" />
            <circle cx="36" cy="32" r="5.5" fill="#EF4444" />
            <circle cx="56" cy="32" r="5.5" fill="#F59E0B" />
            <circle cx="76" cy="32" r="5.5" fill="#10B981" />
            <text x="36" y="80" fill="#94A3B8" font-family="monospace" font-size="16">${cmd}</text>
            <text x="36" y="122" fill="${green}" font-family="monospace" font-size="20" font-weight="800">&gt; ${suc}</text>
            <text x="36" y="162" fill="#CBD5E1" font-family="system-ui" font-size="15">${sucDesc}</text>
          </g>

          <!-- Terminal 2 (Failure) -->
          <g transform="translate(0, 235)">
            <rect width="900" height="205" rx="18" fill="#0E0808" stroke="rgba(239, 68, 68, 0.4)" stroke-width="1.5" />
            <circle cx="36" cy="32" r="5.5" fill="#EF4444" />
            <circle cx="56" cy="32" r="5.5" fill="#F59E0B" />
            <circle cx="76" cy="32" r="5.5" fill="#10B981" />
            <text x="36" y="80" fill="#94A3B8" font-family="monospace" font-size="16">${cmd}</text>
            <text x="36" y="122" fill="#EF4444" font-family="monospace" font-size="20" font-weight="800">&gt; ${fail}</text>
            <text x="36" y="162" fill="#94A3B8" font-family="system-ui" font-size="15">${failDesc}</text>
          </g>
        </g>
      `;
    } else {
      // Landscape Dual Terminal Side by Side
      innerVisual = `
        <g transform="translate(80, 205)">
          <g transform="translate(0, 0)">
            <rect width="505" height="300" rx="16" fill="#070E0A" stroke="${borderGreen}" stroke-width="1.5" />
            <circle cx="30" cy="28" r="5" fill="#EF4444" />
            <circle cx="48" cy="28" r="5" fill="#F59E0B" />
            <circle cx="66" cy="28" r="5" fill="#10B981" />
            <text x="30" y="80" fill="#94A3B8" font-family="monospace" font-size="14">${cmd}</text>
            <text x="30" y="135" fill="${green}" font-family="monospace" font-size="17" font-weight="800">&gt; ${suc}</text>
            <text x="30" y="210" fill="#CBD5E1" font-family="system-ui" font-size="14">${sucDesc}</text>
          </g>
          <g transform="translate(535, 0)">
            <rect width="505" height="300" rx="16" fill="#0E0808" stroke="rgba(239, 68, 68, 0.4)" stroke-width="1.5" />
            <circle cx="30" cy="28" r="5" fill="#EF4444" />
            <circle cx="48" cy="28" r="5" fill="#F59E0B" />
            <circle cx="66" cy="28" r="5" fill="#10B981" />
            <text x="30" y="80" fill="#94A3B8" font-family="monospace" font-size="14">${cmd}</text>
            <text x="30" y="135" fill="#EF4444" font-family="monospace" font-size="17" font-weight="800">&gt; ${fail}</text>
            <text x="30" y="210" fill="#94A3B8" font-family="system-ui" font-size="14">${failDesc}</text>
          </g>
        </g>
      `;
    }
  } else if (type === 'pipeline') {
    const steps = (params.pipelineSteps || [
      { num: '01', title: 'Deep Discovery', detail: 'Entity & schema crawling', status: 'VERIFIED' },
      { num: '02', title: 'Knowledge Graph', detail: 'Semantic relationship mapping', status: 'RESOLVED' },
      { num: '03', title: 'Authority Proof', detail: 'Citations & E-E-A-T anchors', status: 'INDEXED' },
      { num: '04', title: 'AI Citation', detail: 'Real-time answer inclusion', status: 'LIVE' },
    ]).slice(0, 4);

    if (isSquare) {
      innerVisual = `
        <g transform="translate(90, 280)">
          <rect width="900" height="480" rx="20" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
          <text x="36" y="44" fill="${green}" font-family="system-ui" font-size="15" font-weight="700">EXECUTION PROTOCOL · ZERO-FRICTION PIPELINE</text>
          <g transform="translate(36, 80)">
            ${steps.map((st, i) => `
              <g transform="translate(0, ${i * 92})">
                <rect width="828" height="74" rx="12" fill="#060C09" stroke="${borderGreen}" stroke-width="1" />
                <rect x="0" y="0" width="6" height="74" rx="2" fill="${green}" />
                <text x="24" y="44" fill="${green}" font-family="monospace" font-size="22" font-weight="900">${safe(st.num)}</text>
                <text x="75" y="34" fill="#FFFFFF" font-family="system-ui" font-size="16" font-weight="700">${safe(st.title)}</text>
                <text x="75" y="56" fill="#94A3B8" font-family="system-ui" font-size="13">${safe(st.detail)}</text>
                <rect x="710" y="24" width="95" height="26" rx="6" fill="#0E2218" stroke="${green}" stroke-opacity="0.4" />
                <text x="757" y="41" text-anchor="middle" fill="${green}" font-family="monospace" font-size="11" font-weight="800">● ${safe(st.status)}</text>
              </g>
            `).join('')}
          </g>
        </g>
      `;
    } else {
      // Landscape Pipeline
      innerVisual = `
        <g transform="translate(80, 205)">
          <rect width="1040" height="300" rx="18" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
          <g transform="translate(28, 50)">
            ${steps.map((st, i) => `
              <g transform="translate(${i * 250}, 0)">
                <rect width="232" height="205" rx="14" fill="#060C09" stroke="${borderGreen}" stroke-width="1" />
                <rect x="0" y="0" width="232" height="4" rx="2" fill="${green}" />
                <text x="20" y="38" fill="${green}" font-family="monospace" font-size="20" font-weight="900">${safe(st.num)}</text>
                <text x="20" y="75" fill="#FFFFFF" font-family="system-ui" font-size="16" font-weight="700">${safe(st.title)}</text>
                <text x="20" y="105" fill="#94A3B8" font-family="system-ui" font-size="12">${safe(st.detail)}</text>
                <rect x="20" y="145" width="85" height="24" rx="6" fill="#0E2218" stroke="${green}" stroke-opacity="0.4" />
                <text x="62" y="161" text-anchor="middle" fill="${green}" font-family="monospace" font-size="10" font-weight="800">● ${safe(st.status)}</text>
              </g>
            `).join('')}
          </g>
        </g>
      `;
    }
  } else if (type === 'metrics') {
    if (isSquare) {
      innerVisual = `
        <g transform="translate(90, 280)">
          <g transform="translate(0, 0)">
            <rect width="900" height="215" rx="18" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
            <text x="40" y="45" fill="${green}" font-family="monospace" font-size="13" font-weight="700">CORE BENCHMARK · INDUSTRY LEADING</text>
            <text x="40" y="130" fill="${green}" font-family="system-ui" font-size="76" font-weight="900" letter-spacing="-2">99.98%</text>
            <text x="400" y="105" fill="#FFFFFF" font-family="system-ui" font-size="24" font-weight="800">Infrastructure Availability</text>
            <text x="400" y="135" fill="#94A3B8" font-family="system-ui" font-size="15">Zero unmanaged downtime across enterprise networks.</text>
          </g>
          <g transform="translate(0, 240)">
            <g transform="translate(0, 0)">
              <rect width="435" height="225" rx="18" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
              <text x="30" y="45" fill="#94A3B8" font-family="monospace" font-size="12" font-weight="700">DISPATCH &amp; RESOLUTION</text>
              <text x="30" y="125" fill="#FFFFFF" font-family="system-ui" font-size="52" font-weight="900">&lt; 15m</text>
              <text x="30" y="165" fill="${green}" font-family="system-ui" font-size="17" font-weight="700">Rapid Incident Response</text>
              <text x="30" y="195" fill="#94A3B8" font-family="system-ui" font-size="13">Immediate Tier-3 NOC engineer intervention.</text>
            </g>
            <g transform="translate(465, 0)">
              <rect width="435" height="225" rx="18" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
              <text x="30" y="45" fill="#94A3B8" font-family="monospace" font-size="12" font-weight="700">SECURITY POSTURE</text>
              <text x="30" y="125" fill="${green}" font-family="system-ui" font-size="52" font-weight="900">0</text>
              <text x="30" y="165" fill="#FFFFFF" font-family="system-ui" font-size="17" font-weight="700">Unresolved Threats</text>
              <text x="30" y="195" fill="#94A3B8" font-family="system-ui" font-size="13">Proactive perimeter monitoring &amp; audit shielding.</text>
            </g>
          </g>
        </g>
      `;
    } else {
      // Landscape Metrics
      innerVisual = `
        <g transform="translate(80, 205)">
          <g transform="translate(0, 0)">
            <rect width="330" height="300" rx="16" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
            <text x="24" y="40" fill="#94A3B8" font-family="monospace" font-size="11" font-weight="700">AVAILABILITY</text>
            <text x="24" y="125" fill="${green}" font-family="system-ui" font-size="52" font-weight="900">99.98%</text>
            <text x="24" y="175" fill="#FFFFFF" font-family="system-ui" font-size="16" font-weight="700">Network Uptime</text>
            <text x="24" y="210" fill="#94A3B8" font-family="system-ui" font-size="12">Continuous enterprise monitoring across all branch nodes.</text>
          </g>
          <g transform="translate(355, 0)">
            <rect width="330" height="300" rx="16" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
            <text x="24" y="40" fill="#94A3B8" font-family="monospace" font-size="11" font-weight="700">RESPONSE SLA</text>
            <text x="24" y="125" fill="#FFFFFF" font-family="system-ui" font-size="52" font-weight="900">&lt; 15m</text>
            <text x="24" y="175" fill="${green}" font-family="system-ui" font-size="16" font-weight="700">Rapid Dispatch</text>
            <text x="24" y="210" fill="#94A3B8" font-family="system-ui" font-size="12">Tier-3 on-call engineers resolving network anomalies.</text>
          </g>
          <g transform="translate(710, 0)">
            <rect width="330" height="300" rx="16" fill="${cardBg}" stroke="${borderGreen}" stroke-width="1.5" />
            <text x="24" y="40" fill="#94A3B8" font-family="monospace" font-size="11" font-weight="700">SECURITY RISK</text>
            <text x="24" y="125" fill="${green}" font-family="system-ui" font-size="52" font-weight="900">0</text>
            <text x="24" y="175" fill="#FFFFFF" font-family="system-ui" font-size="16" font-weight="700">Breaches</text>
            <text x="24" y="210" fill="#94A3B8" font-family="system-ui" font-size="12">Hardened firewall &amp; zero-trust CCTV mesh defense.</text>
          </g>
        </g>
      `;
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#00E575" stop-opacity="0.12" />
          <stop offset="60%" stop-color="#060A08" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#040605" stop-opacity="1" />
        </radialGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="15" flood-color="#00E575" flood-opacity="0.3" />
        </filter>
        <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#00E575" flood-opacity="0.5" />
        </filter>
      </defs>

      <rect width="${width}" height="${height}" fill="#040605" />
      <rect width="${width}" height="${height}" fill="url(#centerGlow)" />

      <!-- Cyber Matrix Grid -->
      <g stroke="#00E575" stroke-opacity="0.04" stroke-width="1">
        ${Array.from({ length: 24 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="${width}" y2="${i * 50}" />`).join('')}
        ${Array.from({ length: 24 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="${height}" />`).join('')}
      </g>

      <!-- Outer Rounded Glowing Container Card -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="32" fill="#080E0B" fill-opacity="0.95" stroke="${green}" stroke-opacity="0.5" stroke-width="2" filter="url(#neonGlow)" />

      <!-- Brand Logo / Badge at Top Left -->
      <g transform="translate(90, 75)">
        <rect x="0" y="0" width="38" height="22" rx="11" fill="none" stroke="${green}" stroke-width="3.5" />
        <rect x="18" y="0" width="38" height="22" rx="11" fill="none" stroke="${green}" stroke-width="3.5" />
        <circle cx="19" cy="11" r="3" fill="#080E0B" />
        <text x="68" y="18" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" letter-spacing="0.5">${brandName}</text>
      </g>

      <!-- Top Right Category Pill -->
      <g transform="translate(${width - 320}, 75)">
        <rect x="0" y="0" width="230" height="32" rx="16" fill="#0E2218" stroke="${borderGreen}" stroke-width="1.2" />
        <text x="115" y="21" text-anchor="middle" fill="${green}" font-family="monospace" font-size="11" font-weight="700" letter-spacing="1">✦ ${badgeText}</text>
      </g>

      <!-- 2-Tone Punchy Hero Headline -->
      <g transform="translate(90, ${isSquare ? 175 : 135})">
        <text x="0" y="0" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="${isSquare ? 44 : 36}" font-weight="800" letter-spacing="-0.5">${h1}</text>
        <text x="0" y="${isSquare ? 52 : 44}" fill="${green}" font-family="system-ui, -apple-system, sans-serif" font-size="${isSquare ? 44 : 36}" font-weight="800" letter-spacing="-0.5">${h2}</text>
      </g>

      ${innerVisual}

      <!-- Bottom Hook / Provocation -->
      <g transform="translate(90, ${isSquare ? 885 : 555})">
        <text x="${(width - 180)/2}" y="0" text-anchor="middle" fill="#94A3B8" font-family="system-ui" font-size="${isSquare ? 15 : 13}" font-weight="500">${bottomSub}</text>
        <text x="${(width - 180)/2}" y="${isSquare ? 34 : 26}" text-anchor="middle" fill="#FFFFFF" font-family="system-ui" font-size="${isSquare ? 32 : 25}" font-weight="800" letter-spacing="-0.5">${bottomHook}</text>
      </g>
    </svg>
  `;

  return svg;
}

export function generateAuthorityTechVisualDataUri(params: AuthorityVisualSpec): string {
  const svg = generateAuthorityTechVisualSvg(params);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const ALL_AUTHORITY_ARCHETYPES = ['dial', 'graph', 'metrics', 'pipeline', 'table', 'terminal'] as const;
export type AuthorityVisualArchetype = typeof ALL_AUTHORITY_ARCHETYPES[number];

export function extractVisualSpecFromContent(
  content: string,
  brandName: string = 'Tech Sheba',
  previousVisualType?: string,
  preferredVisualType?: string
): AuthorityVisualSpec {
  const lower = (content || '').toLowerCase();

  let chosenType: AuthorityVisualArchetype;

  if (preferredVisualType && ALL_AUTHORITY_ARCHETYPES.includes(preferredVisualType as any)) {
    chosenType = preferredVisualType as AuthorityVisualArchetype;
  } else if (previousVisualType && ALL_AUTHORITY_ARCHETYPES.includes(previousVisualType as any)) {
    // Guaranteed round-robin rotation across the 6 archetypes on repeated clicks
    const prevIdx = ALL_AUTHORITY_ARCHETYPES.indexOf(previousVisualType as any);
    chosenType = ALL_AUTHORITY_ARCHETYPES[(prevIdx + 1) % ALL_AUTHORITY_ARCHETYPES.length];
  } else {
    // First generation: pick archetype based on topic keywords
    if (lower.includes('score') || lower.includes('readiness') || lower.includes('health') || lower.includes('percent')) {
      chosenType = 'dial';
    } else if (lower.includes('connect') || lower.includes('ecosystem') || lower.includes('mesh') || lower.includes('architecture') || lower.includes('network')) {
      chosenType = 'graph';
    } else if (lower.includes('sla') || lower.includes('uptime') || lower.includes('incident') || lower.includes('breach')) {
      chosenType = 'metrics';
    } else if (lower.includes('step') || lower.includes('protocol') || lower.includes('stage') || lower.includes('deploy') || lower.includes('workflow')) {
      chosenType = 'pipeline';
    } else if (lower.includes('vs') || lower.includes('competitor') || lower.includes('gap') || lower.includes('compare')) {
      chosenType = 'table';
    } else if (lower.includes('terminal') || lower.includes('command') || lower.includes('code')) {
      chosenType = 'terminal';
    } else {
      chosenType = 'dial';
    }
  }

  // Return archetype-specific structured specifications
  switch (chosenType) {
    case 'dial':
      return {
        brandName,
        visualType: 'dial',
        headlinePart1: 'THE HIDDEN RESILIENCE SCORE',
        headlinePart2: 'YOUR IT & CCTV SETUP HAS.',
        badgeText: 'SECURITY & UPTIME AUDIT',
        bottomSub: "Above 90, operations flow without disruption. Below 75, failure is inevitable.",
        bottomHook: "What is your actual readiness score?",
        dialScore: 96,
        dialLabel: '/ 100 Health Score',
        dialCards: [
          { pct: '99.9%', title: 'Power Backup SLA', sub: 'Specialized UPS & zero recording loss' },
          { pct: '< 5ms', title: 'Network Latency', sub: 'Dedicated CCTV & Wi-Fi trunking' },
          { pct: '24/7', title: 'NOC Guard Shield', sub: 'Continuous remote perimeter monitoring' },
          { pct: '0', title: 'Data Breaches', sub: 'Zero-trust VPN remote access control' }
        ]
      };

    case 'graph':
      return {
        brandName,
        visualType: 'graph',
        headlinePart1: 'THE UNIFIED IT ECOSYSTEM',
        headlinePart2: 'THAT NEVER SLEEPS.',
        badgeText: 'ENTERPRISE ARCHITECTURE',
        bottomSub: 'Interconnected nodes eliminate physical and digital single points of failure.',
        bottomHook: 'What does your security architecture look like?',
        graphNodes: [
          { name: 'CCTV Mesh', rel: 'surveils' },
          { name: 'Cloud Storage', rel: 'backs_up' },
          { name: 'Fiber WAN', rel: 'transmits' },
          { name: 'UPS Power', rel: 'energizes' },
          { name: 'VPN Shield', rel: 'encrypts' },
          { name: 'Offices', rel: 'protects' }
        ]
      };

    case 'metrics':
      return {
        brandName,
        visualType: 'metrics',
        headlinePart1: 'HARDWARE IS NOT A STRATEGY.',
        headlinePart2: 'BUILT FOR ZERO DOWNTIME.',
        badgeText: 'PROACTIVE SLA BENCHMARK',
        bottomSub: 'Standard cameras record when they can. Tech Sheba guarantees 24/7 capture.',
        bottomHook: 'Is your business truly resilient?',
        metricCards: [
          { label: 'RECORDING AVAILABILITY', value: '99.98%', title: 'Zero Footage Loss', sub: 'Active failover protection during power cuts.' },
          { label: 'REMOTE MONITORING SLA', value: '< 10ms', title: 'Instant Feed Streaming', sub: 'Dedicated encrypted routing for executive access.' },
          { label: 'VULNERABILITY GAP', value: '0', title: 'Unmanaged Blindspots', sub: 'End-to-end cable trunking and port security.' }
        ]
      };

    case 'pipeline':
      return {
        brandName,
        visualType: 'pipeline',
        headlinePart1: 'THE 4-STAGE PROTOCOL',
        headlinePart2: 'FOR UNINTERRUPTED SECURITY.',
        badgeText: 'INFRASTRUCTURE BLUEPRINT',
        bottomSub: 'Every phase is engineered and verified for zero recording interruptions.',
        bottomHook: 'Is your current protocol complete?',
        pipelineSteps: [
          { num: '01', title: 'Power Resilience', detail: 'UPS integration for zero blackout loss', status: 'VERIFIED' },
          { num: '02', title: 'Encrypted Access', detail: 'Secure VPN remote oversight', status: 'ACTIVE' },
          { num: '03', title: 'Hybrid Cloud', detail: 'Redundant off-site disaster recovery', status: 'INDEXED' },
          { num: '04', title: '24/7 NOC Shield', detail: 'Real-time bandwidth & health audit', status: 'LIVE' }
        ]
      };

    case 'table':
      return {
        brandName,
        visualType: 'table',
        headlinePart1: 'TRADITIONAL CCTV INSTALLATION',
        headlinePart2: 'VS. MANAGED IT INFRASTRUCTURE.',
        badgeText: 'CAPABILITY MATRIX',
        bottomSub: 'Standard vendors plug in cameras. We build resilient operational backbones.',
        bottomHook: 'Which infrastructure does your office have?',
        tableTitle: 'Security Resilience: Standard Vendors vs Tech Sheba',
        tableHeaders: ['Capability', 'Power Cut', 'Remote Access', 'Backup', 'Score'],
        tableRows: [
          { name: 'Standard CCTV', c1: 'Offline', c2: 'Unencrypted', c3: 'Local DVR', score: '42' },
          { name: 'Vendor Package B', c1: '15m Battery', c2: 'Slow Port', c3: 'No Cloud', score: '61' },
          { name: 'Vendor Package C', c1: 'No Failover', c2: 'Basic App', c3: 'Single Disk', score: '55' },
          { name: `${brandName} Managed`, c1: '24/7 Online', c2: 'VPN Encrypted', c3: 'Hybrid Cloud', score: '99', isYou: true }
        ]
      };

    case 'terminal':
    default:
      return {
        brandName,
        visualType: 'terminal',
        headlinePart1: 'STOP BUYING WALL ORNAMENTS',
        headlinePart2: 'BUILD A RESILIENT IT BACKBONE.',
        badgeText: '24/7 SURVEILLANCE UPTIME',
        bottomSub: 'Is your current security setup truly monitoring your office?',
        bottomHook: 'Which outcome are your systems getting?',
        terminalCommand: `$ ${brandName.toLowerCase().replace(/\s+/g, '-')}.verify_security_grid()`,
        terminalSuccess: 'STATUS: SECURE  ➔  ZERO_DOWNTIME',
        terminalSuccessDesc: '✓ UPS backup and VPN-encrypted access active. Continuous recording.',
        terminalFailure: 'ERROR: CRITICAL  ➔  NETWORK_OFFLINE',
        terminalFailureDesc: '✕ Power failure. Local-only access. Footage loss detected.'
      };
  }
}
