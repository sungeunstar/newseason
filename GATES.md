# Gates: 31-page portfolio quality pass

Scope: Redesign About Me and visually audit all 31 HTML portfolio pages so small evidence and low-fidelity UI are removed or replaced with verified finished assets.

- [x] G1: About Me contains no company/project employment history and instead presents portrait, positioning, working method, focus, and compact tool context.
  CHECK: node -e "const s=require('fs').readFileSync('scripts/build-portfolio.mjs','utf8'); console.log(!/대한법률구조공단|주식회사 멸치|2025\.05–09/.test(s) && /How I Work|HOW I WORK/.test(s) && /Focus|FOCUS/.test(s) ? 'ABOUT_PASS' : 'ABOUT_FAIL')"
  EXPECT: ABOUT_PASS
  EVIDENCE: `_audit/final-pages/p02.png`; automated check returns `ABOUT_PASS`.

- [x] G2: Every portfolio page has a current 1280×720 render and the audit folder contains exactly 31 numbered page images.
  CHECK: node -e "const fs=require('fs'); const n=fs.readdirSync('_audit/final-pages').filter(x=>/^p\d{2}\.png$/.test(x)).length; console.log('PAGE_RENDERS='+n)"
  EXPECT: PAGE_RENDERS=31
  EVIDENCE: `_audit/final-pages/p01.png`–`p31.png`; render count is 31.

- [x] G3: Combined HTML remains 31 pages, 1280px wide, with no broken content images or browser console errors.
  CHECK: node scripts/verify-portfolio-output.mjs
  EXPECT: VERIFY_PASS pages=31 width=1280 broken=0 consoleErrors=0
  EVIDENCE: `_audit/verify-final.json`; `VERIFY_PASS pages=31 width=1280 broken=0 consoleErrors=0`.

- [x] G4: All 31 rendered pages were visually inspected; elements too small to function as evidence were enlarged or removed.
  EVIDENCE: `_audit/portfolio-contact-final.png` and `_audit/portfolio-qa-final.md`; pages 07, 09, 11, and 27 were enlarged/recomposed.

- [x] G5: Low-fidelity or placeholder UI is not used where a verified finished UI asset exists; every retained UI image is legible and materially supports its page claim.
  EVIDENCE: Topping page 11 wireframe removed; finished `mock-home.png` and `el-*` UI assets used. Page 07 completion wireframe replaced with `el-sub.png`.

- [x] G6: Genesis audit has no critical or major findings and tomob system rules pass.
  CHECK: node scripts/run-final-checks.mjs
  EXPECT: FINAL_CHECKS_PASS
  EVIDENCE: `FINAL_CHECKS_PASS`; Genesis critical 0, major 0; tomob rule check passed.

- [x] G7: A final 31-page contact sheet and page-by-page QA manifest are saved for review.
  CHECK: node -e "const fs=require('fs'); console.log(fs.existsSync('_audit/portfolio-contact-final.png')&&fs.existsSync('_audit/portfolio-qa-final.md')?'QA_ARTIFACTS_PASS':'QA_ARTIFACTS_FAIL')"
  EXPECT: QA_ARTIFACTS_PASS
  EVIDENCE: `_audit/portfolio-contact-final.png` and `_audit/portfolio-qa-final.md`.
