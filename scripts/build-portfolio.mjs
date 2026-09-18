import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const chapters = [
  { id: 'topping', html: 'topping.html', css: 'topping.css', start: 4 },
  { id: 'flowing', html: 'flowing.html', css: 'flowing.css', start: 12 },
  { id: 'skaldworks', html: 'skaldworks.html', css: 'skaldworks.css', start: 22 },
];

function extractBody(source) {
  const match = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!match) throw new Error('body를 찾지 못했습니다.');
  return match[1].trim();
}

function renumber(html, start) {
  let page = start;
  return html.replace(/<span class="folio([^"]*)">\d{2}<\/span>/g, (_, extra) =>
    `<span class="folio${extra}">${String(page++).padStart(2, '0')}</span>`
  );
}

function shadowCss(css) {
  return css
    .replace(/html\s*,\s*body/g, ':host')
    .replace(/:root/g, ':host')
    .replace(/(^|[}\s,{])body\s*\{/gm, '$1:host{')
    + '\n:host{display:block;width:1280px;margin:0 auto}.sheet{margin:0!important;box-shadow:none!important}';
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

const loaded = [];
for (const chapter of chapters) {
  const [html, css] = await Promise.all([
    readFile(path.join(root, chapter.html), 'utf8'),
    readFile(path.join(root, chapter.css), 'utf8'),
  ]);
  loaded.push({
    ...chapter,
    body: renumber(extractBody(html), chapter.start),
    css: shadowCss(css),
  });
}

const introCss = `
  @page{size:338.667mm 190.5mm;margin:0}
  :root{--navy:#0b1425;--navy2:#111f38;--blue:#4774ff;--paper:#f5f3ef;--ink:#131620;--muted:#697183;--line:rgba(255,255,255,.16)}
  *{box-sizing:border-box}html,body{margin:0;padding:0;overflow-x:hidden;background:#05070b;font-family:Pretendard,"Malgun Gothic","Apple SD Gothic Neo",sans-serif;-webkit-font-smoothing:antialiased;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{width:1280px;margin:0 auto}
  portfolio-chapter{display:block;width:1280px}
  .intro-sheet{position:relative;width:1280px;height:720px;overflow:hidden;background:var(--navy);color:#f8f9fb}
  .intro-page{position:absolute;inset:0;padding:58px 83px 70px;display:flex;flex-direction:column}
  .intro-sheet h1,.intro-sheet h2,.intro-sheet h3,.intro-sheet p{margin:0;word-break:keep-all}
  .intro-kicker{color:#7192ff;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
  .intro-folio,.intro-chap{position:absolute;bottom:32px;color:#68758b;font-size:11px;font-weight:800;letter-spacing:.14em}.intro-folio{right:83px}.intro-chap{left:83px;text-transform:uppercase}
  .intro-cover{background:#080a10;color:#f7f9fc}.intro-cover:before{content:"";position:absolute;inset:0;background:radial-gradient(62% 54% at 18% 100%,rgba(48,96,255,.84) 0%,rgba(48,96,255,.4) 38%,transparent 72%),radial-gradient(58% 52% at 84% 102%,rgba(201,79,255,.7) 0%,rgba(201,79,255,.3) 42%,transparent 74%),radial-gradient(72% 48% at 52% 112%,rgba(255,77,147,.68) 0%,rgba(255,77,147,.22) 42%,transparent 72%),linear-gradient(180deg,#080a0f 0%,#0c1019 38%,#14213e 66%,#243a7a 100%);pointer-events:none}.intro-cover:after{content:"";position:absolute;left:10%;right:10%;bottom:-150px;height:390px;border-radius:50%;background:rgba(255,82,145,.2);filter:blur(76px);pointer-events:none}
  .cover-top{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2}.cover-identity{display:flex;align-items:center;gap:12px}.cover-avatar{width:12px;height:12px;border-radius:3px;background:#6381ff;box-shadow:0 0 0 5px rgba(99,129,255,.12)}.cover-identity strong{font-size:13px;letter-spacing:.04em}.cover-status{color:#7f8a9d;font-size:10px}.cover-status i{display:inline-block;width:6px;height:6px;margin-right:6px;border-radius:50%;background:#42d49b}.cover-year{color:#778298;font-size:10px;font-weight:800;letter-spacing:.15em}
  .cover-stage{position:relative;z-index:2;margin:auto 0;display:flex;flex-direction:column;align-items:center;text-align:center;transform:translateY(-4px)}.cover-copy .intro-kicker{color:#8ea4ff}.intro-cover h1{margin-top:15px;font-size:52px;line-height:1.16;letter-spacing:-.056em}.intro-cover h1 em{color:#9bb0ff;font-style:normal}.cover-desc{margin:15px auto 0!important;max-width:690px;color:rgba(235,239,248,.65);font-size:14px;line-height:1.7}
  .brief-console{position:relative;padding:20px;border:1px solid #35415a;background:rgba(8,13,24,.82);box-shadow:0 28px 70px rgba(0,0,0,.38);backdrop-filter:blur(12px)}.brief-console:before{content:"";position:absolute;left:-1px;top:28px;width:3px;height:72px;background:#6f8cff}.console-top{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid #29344a}.console-top b{font:750 10px/1 ui-monospace,Consolas,monospace;letter-spacing:.12em;color:#819aff}.console-top span{color:#68758a;font-size:9px}.message{margin-top:18px;padding:17px 18px;border:1px solid #2a354a}.message small{display:block;margin-bottom:8px;color:#72809a;font:750 9px/1 ui-monospace,Consolas,monospace;letter-spacing:.1em}.message p{color:#cbd2de;font-size:14px;line-height:1.6}.message--answer{margin-left:42px;background:linear-gradient(135deg,rgba(77,103,222,.18),rgba(53,72,146,.06));border-color:#445a9c}.message--answer small{color:#829aff}.message--answer h2{font-size:25px;line-height:1.25;letter-spacing:-.035em}.message--answer p{margin-top:8px;color:#9eabc0;font-size:12px}.console-proof{margin-top:18px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.console-proof div{padding:13px 10px;background:#11192a;border-top:1px solid #34425c}.console-proof b{display:block;color:#eef1f6;font-size:12px}.console-proof span{display:block;margin-top:5px;color:#6f7c92;font-size:9px}.console-command{margin-top:18px;padding:13px 15px;background:#050912;color:#9facbf;font:11px/1.5 ui-monospace,Consolas,monospace}.console-command i{color:#6f8cff;font-style:normal}.console-command em{display:inline-block;width:7px;height:14px;margin-left:5px;vertical-align:middle;background:#6f8cff;animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}@media(prefers-reduced-motion:reduce){.console-command em{animation:none}}
  .ai-prompt{width:760px;min-height:116px;margin-top:34px;padding:19px 18px 16px 20px;border:1px solid rgba(255,255,255,.15);border-radius:25px;background:rgba(10,12,18,.91);box-shadow:0 26px 70px rgba(2,5,14,.42),0 0 0 1px rgba(96,125,255,.08) inset;text-align:left;backdrop-filter:blur(18px)}.ai-prompt>p{color:#e9ecf4;font-size:16px;line-height:1.55;letter-spacing:-.018em}.prompt-tools{margin-top:20px;display:flex;align-items:center;gap:10px}.prompt-add{width:30px;height:30px;border:1px solid rgba(255,255,255,.14);border-radius:50%;display:grid;place-items:center;color:#b1b8c7;font-size:19px;font-weight:300}.prompt-mode{color:#858e9f;font-size:10px;font-weight:700;letter-spacing:.04em}.prompt-mode b{color:#c4cad5}.prompt-submit{margin-left:auto;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#f2f4f8;color:#11141b;font-size:17px;font-weight:900;box-shadow:0 6px 18px rgba(0,0,0,.25)}.prompt-hints{margin-top:17px;color:rgba(237,241,249,.62);font-size:10px;font-weight:700;letter-spacing:.06em}.prompt-hints span+span:before{content:"·";margin:0 10px;color:rgba(255,255,255,.32)}
  .cover-foot{display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.12);padding-top:15px;position:relative;z-index:2}.cover-foot p{color:#7f8a9e;font-size:10px;font-weight:750;letter-spacing:.08em}.cover-foot strong{color:#dce1e9}.cover-projects{color:#7f8a9e;font-size:9px;font-weight:800;letter-spacing:.11em}.intro-cover .intro-chap,.intro-cover .intro-folio{color:#59667d}
  .intro-about{background:radial-gradient(80% 120% at 82% 42%,#151b27 0%,#0b0d12 58%,#08090d 100%);color:#f7f8fa}.intro-about .intro-page{padding-top:48px}.intro-about .intro-kicker{color:#6f8cff}.about-title{font-size:64px;line-height:1;letter-spacing:-.055em}.about-layout{margin:auto 0;display:grid;grid-template-columns:245px 1.12fr .9fr;gap:48px;align-items:start}.about-profile{width:228px;height:290px;object-fit:cover;border-radius:18px;filter:saturate(.82) contrast(1.04);box-shadow:0 18px 50px rgba(0,0,0,.35)}
  .about-copy h2{font-size:30px;line-height:1.42;letter-spacing:-.04em}.about-copy>p{margin-top:22px;color:#aeb5c1;font-size:15px;line-height:1.82;max-width:500px}.about-signature{margin-top:28px;display:flex;gap:12px;color:#d9dde5;font-size:12px;font-weight:750}.about-signature span{padding:8px 11px;border:1px solid #303744;background:rgba(255,255,255,.025)}
  .about-practice{display:grid;gap:28px}.about-block{padding-top:15px;border-top:1px solid #3a414e}.about-block h3{color:#6f8cff;font-size:13px;letter-spacing:.11em}.about-block ol{margin:15px 0 0;padding:0;list-style:none;display:grid;gap:14px;counter-reset:work}.about-block li{position:relative;padding-left:35px;color:#eef0f4;font-size:14px;line-height:1.5;counter-increment:work}.about-block li:before{content:"0" counter(work);position:absolute;left:0;top:1px;color:#6f8cff;font:750 10px/1.6 ui-monospace,Consolas,monospace}.focus-list{margin-top:14px;display:flex;flex-wrap:wrap;gap:8px}.focus-list span{padding:8px 10px;background:#171b23;color:#c8ced8;font-size:11px;border:1px solid #2b313d}.about-tools{margin-top:12px;color:#767f8e;font-size:11px;line-height:1.7}.intro-about .intro-chap,.intro-about .intro-folio{color:#565e6c}
  .intro-index{background:#0b0d12}.index-head{display:grid;grid-template-columns:1.1fr .9fr;gap:80px;align-items:end}.index-head h2{margin-top:18px;font-size:43px;line-height:1.25;letter-spacing:-.045em}.index-head p{color:#8f97a5;font-size:15px;line-height:1.75}
  .project-index{margin-top:auto;margin-bottom:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.project-card{min-height:255px;padding:24px 24px 22px;border-top:2px solid var(--accent);background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.018));display:flex;flex-direction:column}.project-card small{color:var(--accent);font-size:11px;font-weight:800;letter-spacing:.12em}.project-card h3{margin-top:24px;font-size:29px;letter-spacing:-.035em}.project-card>p{margin-top:10px;color:#939ba8;font-size:13px;line-height:1.6}.project-card dl{margin:auto 0 0;padding-top:16px;border-top:1px solid rgba(255,255,255,.11);display:grid;grid-template-columns:52px 1fr;gap:6px 12px;font-size:11px}.project-card dt{color:#676f7d}.project-card dd{margin:0;color:#c5cad2}.project-card--topping{--accent:#8d75f4}.project-card--flowing{--accent:#f45b98}.project-card--skald{--accent:#6f8cff}
  .tools-line{display:flex;justify-content:space-between;padding-top:17px;border-top:1px solid var(--line);color:#7d8593;font-size:11px}.tools-line b{color:#c2c8d1}
  .intro-closing{background:linear-gradient(135deg,#091221,#0c1930 64%,#102449)}.closing-center{margin:auto 0}.closing-center h2{font-size:58px;line-height:1.2;letter-spacing:-.055em}.closing-center p{margin-top:22px;color:#99a6ba;font-size:17px;line-height:1.7}.closing-center strong{color:#fff}.closing-rule{margin-top:65px;width:120px;height:3px;background:#5f82ff}
  @media print{html,body{background:#fff}body{width:auto}.intro-sheet{page-break-after:always}portfolio-chapter{page-break-after:auto}}
`;

const intro = `
<section class="intro-sheet intro-cover">
  <div class="intro-page">
    <div class="cover-top"><div class="cover-identity"><span class="cover-avatar"></span><strong>JEON SUNGEUN</strong><span class="cover-status"><i></i>Ready to build</span></div><p class="cover-year">PORTFOLIO · 2026</p></div>
    <div class="cover-stage">
      <div class="cover-copy"><p class="intro-kicker">PORTFOLIO ASSISTANT</p><h1>안녕하세요,<br>어떤 문제를 해결할 <em>기획자</em>를 찾고 계신가요?</h1><p class="cover-desc">사용자 조사에서 서비스 운영, 실제 제품 제작까지 연결한 세 가지 프로젝트로 답합니다.</p></div>
      <div class="ai-prompt"><p>사용자 문제를 실제 서비스와 제품으로 연결할 기획자를 찾아줘</p><div class="prompt-tools"><span class="prompt-add">＋</span><span class="prompt-mode"><b>Portfolio</b> · Service Planning</span><span class="prompt-submit">↑</span></div></div>
      <p class="prompt-hints"><span>USER RESEARCH</span><span>SERVICE SYSTEM</span><span>PRODUCT BUILD</span></p>
    </div>
    <div class="cover-foot"><p><strong>전성은</strong> · 서비스기획 / 프로덕트기획 / AX</p><p class="cover-projects">TOPPING UP · FLOWING · SCALDWORKS</p></div>
  </div><span class="intro-chap">Jeon Sungeun · Portfolio</span><span class="intro-folio">01</span>
</section>
<section class="intro-sheet intro-about">
  <div class="intro-page">
    <p class="intro-kicker">Service · Product Planner</p>
    <h1 class="about-title">About Me</h1>
    <div class="about-layout">
      <img class="about-profile" src="assets/portfolio/about-profile.png" alt="전성은 프로필 사진">
      <div class="about-copy">
        <h2>사용자와 비즈니스의 문제를 구조적으로 정의하고,<br>실제로 작동하는 서비스와 제품으로 연결합니다.</h2>
        <p>사용자 조사에서 발견한 문제를 목표와 가설로 정리하고, 정책·운영·화면·제작 범위까지 하나의 흐름으로 설계합니다. 빠르게 만든 결과를 다시 검증해 다음 의사결정에 쓸 기준으로 남기는 일을 중요하게 생각합니다.</p>
        <div class="about-signature"><span>문제 정의</span><span>구조 설계</span><span>제품 검증</span></div>
      </div>
      <div class="about-practice">
        <section class="about-block"><h3>HOW I WORK</h3><ol><li>문제를 사용자 언어로 정의합니다.</li><li>정책·운영·화면을 하나의 흐름으로 연결합니다.</li><li>빠르게 만들고 검증하며 다음 기준을 남깁니다.</li></ol></section>
        <section class="about-block"><h3>FOCUS</h3><div class="focus-list"><span>User Research</span><span>Service Planning</span><span>Product Build</span><span>AI Workflow</span></div><p class="about-tools">Figma · Notion · HTML/CSS · Claude · Codex</p></section>
      </div>
    </div>
  </div><span class="intro-chap">About Me</span><span class="intro-folio">02</span>
</section>
<section class="intro-sheet intro-index">
  <div class="intro-page">
    <div class="index-head"><div><p class="intro-kicker">Selected Works</p><h2>사용자 문제에서 시작해,<br>서비스와 제작 시스템까지 확장했습니다.</h2></div><p>세 프로젝트는 같은 화면 설계 사례가 아니에요. 사용자 리서치에서 출발한 제품 구조, 온라인과 오프라인을 잇는 서비스 모델, 그리고 제품 제작 자체를 시스템화한 과정으로 범위를 넓혀갑니다.</p></div>
    <div class="project-index">
      <article class="project-card project-card--topping"><small>01 · PRODUCT PLANNING</small><h3>Topping Up</h3><p>다른 사람의 준비 일정을 내 실행 계획으로 바꾸는 커리어 준비 앱</p><dl><dt>Focus</dt><dd>User Research → Service Structure</dd><dt>Pages</dt><dd>04–11</dd></dl></article>
      <article class="project-card project-card--flowing"><small>02 · SERVICE &amp; BUSINESS</small><h3>Flowing</h3><p>생각과 가치관을 먼저 탐색하는 만남 서비스와 오프라인 운영 모델</p><dl><dt>Focus</dt><dd>Experience → Business &amp; Operation</dd><dt>Pages</dt><dd>12–21</dd></dl></article>
      <article class="project-card project-card--skald"><small>03 · AX PRODUCT SYSTEM</small><h3>SCALDWORKS</h3><p>아이디어를 네 번의 하네스로 검증하는 멀티모델 제품 제작 시스템</p><dl><dt>Focus</dt><dd>Product → Repeatable Build System</dd><dt>Pages</dt><dd>22–30</dd></dl></article>
    </div>
    <div class="tools-line"><span><b>Core</b> · Product Planning · Service Operations · UX/UI · AX Planning</span><span>Figma · Notion · HTML/CSS · React/Next.js · Playwright · Claude · GPT</span></div>
  </div><span class="intro-chap">Project Index</span><span class="intro-folio">03</span>
</section>`;

const closing = `
<section class="intro-sheet intro-closing">
  <div class="intro-page"><p class="intro-kicker">Closing</p><div class="closing-center"><h2>끝까지 읽어주셔서<br>감사합니다.</h2><p><strong>전성은</strong><br>Service · Product · AX Planning</p><div class="closing-rule"></div></div></div>
  <span class="intro-chap">Jeon Sungeun · Portfolio 2026</span><span class="intro-folio">31</span>
</section>`;

const elements = loaded.map((chapter) => `<portfolio-chapter data-id="${chapter.id}"></portfolio-chapter>`).join('\n');
const payload = Object.fromEntries(loaded.map((chapter) => [chapter.id, { css: chapter.css, body: chapter.body }]));

const output = `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><meta name="viewport" content="width=1280"><title>전성은 · 서비스·프로덕트 기획 포트폴리오 2026</title><style>${introCss}</style></head>
<body>${intro}\n${elements}\n${closing}
<script>
const chapters=${safeJson(payload)};
document.querySelectorAll('portfolio-chapter').forEach((host)=>{const data=chapters[host.dataset.id];const root=host.attachShadow({mode:'open'});root.innerHTML='<style>'+data.css+'</style>'+data.body;});
</script></body></html>`;

await writeFile(path.join(root, 'portfolio.html'), output, 'utf8');
console.log(`portfolio.html 생성 완료 · ${3 + 8 + 10 + 9 + 1}쪽`);
