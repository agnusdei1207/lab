import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, extname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import test from "node:test"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

const domains = [
  ["에이전트", 1],
  ["rag-컨텍스트", 1],
  ["ai-모델-보호", 1],
  ["플랫폼-평가", 1],
]

const reportPaths = [
  "content/에이전트/보안/red-team.md",
  "content/에이전트/보안/blue-team.md",
  "content/에이전트/보안/dynamic-honeypot.md",
  "content/rag-컨텍스트/하이브리드-검색.md",
  "content/ai-모델-보호/pii-보호.md",
  "content/플랫폼-평가/에이전트-kpi.md",
]

function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? collectFiles(path) : [path]
  })
}

test("메인 페이지는 카드 없이 네 개 도메인을 안내한다", () => {
  const index = readFileSync(resolve(root, "content/index.md"), "utf8")

  for (const [slug] of domains) {
    assert.match(
      index,
      new RegExp(`(?:href=|\\]\\()["']?[^"')]*${slug}|\\[\\[${slug}[^\\]]*\\]\\]`, "u"),
      slug,
    )
  }
  assert.doesNotMatch(index, /red-agent|blue-agent|pii-privacy-module/u)
  assert.doesNotMatch(index, /domain-grid|domain-card/u)
  assert.equal((index.match(/연구/gu) ?? []).length <= 1, true)
})

test("각 도메인 페이지는 소속 연구만 연결한다", () => {
  for (const [slug, count] of domains) {
    const index = readFileSync(resolve(root, "content", slug, "index.md"), "utf8")
    const studyLinks = [...index.matchAll(/\[\[[^\]]+(?:\|[^\]]+)?\]\]/gu)]
    assert.equal(studyLinks.length, count, slug)
  }
})

test("탐색 구조는 에이전트 아래 보안을 두고 본문을 한 번에 연다", () => {
  const securityIndex = readFileSync(resolve(root, "content/에이전트/보안/index.md"), "utf8")

  for (const section of ["red-team", "blue-team", "dynamic-honeypot"]) {
    assert.match(securityIndex, new RegExp(`\\[\\[에이전트/보안/${section}`, "u"), section)
  }

  assert.equal(
    collectFiles(resolve(root, "content")).some((path) => path.endsWith("연구결과.md")),
    false,
  )
})

test("frontmatter 제목은 읽되 속성 표는 화면에 노출하지 않는다", () => {
  const config = readFileSync(resolve(root, "quartz.config.yaml"), "utf8")

  assert.match(
    config,
    /source: "@quartz-community\/note-properties"[\s\S]*?enabled: true[\s\S]*?hidePropertiesView: true/u,
  )
})

test("탐색기는 문서 제목을 펼쳐 보여주고 이전 상태를 재사용하지 않는다", () => {
  const config = readFileSync(resolve(root, "quartz.config.yaml"), "utf8")

  assert.match(
    config,
    /source: "@quartz-community\/explorer"[\s\S]*?title: 문서[\s\S]*?folderDefaultState: open[\s\S]*?useSavedState: false/u,
  )
})

test("모든 연구 문서는 공개 메타데이터를 가진다", () => {
  for (const reportPath of reportPaths) {
    const report = readFileSync(resolve(root, reportPath), "utf8")
    assert.match(report, /^---\r?\n[\s\S]+?\r?\n---/u, reportPath)
    assert.match(report, /^title:\s*.+$/mu, reportPath)
    assert.match(report, /^description:\s*.+$/mu, reportPath)
    assert.match(report, /^tags:\s*$/mu, reportPath)
    assert.match(report, /^date:\s*2026-08-31$/mu, reportPath)
    assert.match(report, /^publish:\s*true$/mu, reportPath)
  }
})

test("보고서에 연결된 모든 로컬 그림이 실제로 존재한다", () => {
  for (const reportPath of reportPaths) {
    const report = readFileSync(resolve(root, reportPath), "utf8")
    const reportDirectory = dirname(resolve(root, reportPath))
    for (const [, imagePath] of report.matchAll(/!\[[^\]]*\]\(([^)]+)\)/gu)) {
      assert.equal(
        existsSync(resolve(reportDirectory, decodeURI(imagePath))),
        true,
        `${reportPath}: ${imagePath}`,
      )
    }
  }
})

test("모든 위키링크는 실제 문서로 연결된다", () => {
  const contentRoot = resolve(root, "content")

  for (const file of collectFiles(contentRoot).filter((path) => extname(path) === ".md")) {
    const markdown = readFileSync(file, "utf8")
    for (const [, rawTarget] of markdown.matchAll(
      /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/gu,
    )) {
      const target = rawTarget.trim()
      const candidates = [
        resolve(contentRoot, `${target}.md`),
        resolve(contentRoot, target, "index.md"),
      ]
      assert.equal(candidates.some(existsSync), true, `${relative(root, file)} -> ${target}`)
    }
  }
})

test("공개 연구 자료는 Markdown과 정상 PNG 파일로만 구성된다", () => {
  const contentRoot = resolve(root, "content")
  const pngSignature = "89504e470d0a1a0a"

  for (const file of collectFiles(contentRoot)) {
    assert.equal([".md", ".png"].includes(extname(file)), true, relative(root, file))
    if (extname(file) === ".png") {
      assert.equal(
        readFileSync(file).subarray(0, 8).toString("hex"),
        pngSignature,
        relative(root, file),
      )
    }
  }
})

test("모든 결과보고서는 질문·결론·해석 범위를 설명한다", () => {
  for (const reportPath of reportPaths) {
    const report = readFileSync(resolve(root, reportPath), "utf8")
    assert.match(report, /^## 한 줄 결론$/mu, reportPath)
    assert.match(report, /^## 연구 질문$/mu, reportPath)
    assert.match(report, /^## .*?(?:한계|논의|주의사항).*$/mu, reportPath)
  }
})

test("공개 콘텐츠는 개인 정보나 내부 작업명을 노출하지 않는다", () => {
  const publicPaths = [
    "README.md",
    ...collectFiles(resolve(root, "content")).filter((path) => extname(path) === ".md"),
  ]
  const forbidden = [
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu,
    /양주성|곽진|광주대학교|아주대학교/iu,
    /RS-2026|제10-2026/iu,
    /C:\\workspace|RndSecurity|red-paper/iu,
    /\b[\w.-]+\.jsonl\b/iu,
    /l2_모델_2종_실험|실험결과\.md/iu,
  ]

  for (const publicPath of publicPaths) {
    const fullPath = resolve(root, publicPath)
    const content = readFileSync(fullPath, "utf8")
    for (const pattern of forbidden) {
      assert.doesNotMatch(content, pattern, `${relative(root, fullPath)}: ${pattern}`)
    }
  }
})

test("연구 탐색 기능과 아이콘 다크 모드를 유지한다", () => {
  const config = readFileSync(resolve(root, "quartz.config.yaml"), "utf8")

  for (const plugin of ["search", "darkmode", "graph", "backlinks"]) {
    assert.match(
      config,
      new RegExp(`source: "@quartz-community/${plugin}"[\\s\\S]*?enabled: true`, "u"),
      plugin,
    )
  }
  assert.match(config, /source: "@quartz-community\/darkmode"[\s\S]*?group: toolbar/u)
})

test("일관된 모션과 움직임 감소 설정을 제공한다", () => {
  const styles = readFileSync(resolve(root, "quartz/styles/custom.scss"), "utf8")
  const motion = readFileSync(resolve(root, "quartz/components/scripts/motion.inline.ts"), "utf8")

  assert.match(styles, /--motion-duration/u)
  assert.match(styles, /body\[data-slug="index"\]/u)
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/u)
  assert.match(motion, /document\.addEventListener\("nav"/u)
  assert.match(motion, /\.animate\(/u)
  assert.match(motion, /prefers-reduced-motion/u)
})

test("모의해킹 컨텍스트 연구는 검색 구조의 진화와 경량화 근거를 논문 형식으로 설명한다", () => {
  const report = readFileSync(resolve(root, reportPaths[3]), "utf8")

  for (const concept of [
    "BM25",
    "외부 VectorDB",
    "인메모리",
    "all-MiniLM-L6-v2",
    "all-mpnet-base-v2",
    "Splade_PP_en_v2",
    "2-hop",
  ]) {
    assert.match(report, new RegExp(concept, "u"), concept)
  }
  assert.match(report, /```mermaid[\s\S]+?```/u)
})

test("공방 KPI는 이름이 아니라 정의와 산식으로 설명한다", () => {
  const report = readFileSync(resolve(root, reportPaths[5]), "utf8")

  for (const section of ["RED 공격", "BLUE 탐지", "다이나믹 허니팟", "안전 통제"]) {
    assert.match(report, new RegExp(`^### ${section}$`, "mu"), section)
  }

  for (const metric of [
    "과제 완수율",
    "취약점 활용률",
    "최초 성과 시간",
    "정탐률",
    "오탐률",
    "평균 탐지 시간",
    "기만 성공률",
    "공격 자원 소모",
    "정책 위반 위험률",
    "승인 대기 시간",
    "강제 중단 성공률",
    "격리 유지율",
  ]) {
    assert.match(report, new RegExp(metric, "u"), metric)
  }

  assert.match(report, /분자/u)
  assert.match(report, /분모/u)
  assert.match(report, /중앙값/u)
  assert.match(report, /95% 신뢰구간/u)
})

test("RED 에이전트 문서는 선행연구와 설계 차이를 갖춘 논문 형식이다", () => {
  const report = readFileSync(resolve(root, reportPaths[0]), "utf8")

  for (const heading of [
    "초록",
    "관련 연구",
    "방법론",
    "절제 실험",
    "한계와 타당성 위협",
    "참고문헌",
  ]) {
    assert.match(report, new RegExp(`^## ${heading}$`, "mu"), heading)
  }

  for (const concept of [
    "동적 AI-to-AI 프롬프팅",
    "계층형 메모리 관리",
    "D-CIPHER",
    "Auto-prompter",
    "Planner–Executor",
    "PentestGPT",
    "EnIGMA",
    "ReAct",
    "Reflexion",
    "MemGPT",
  ]) {
    assert.match(report, new RegExp(concept, "u"), concept)
  }

  assert.match(report, /https:\/\/arxiv\.org\/abs\/2502\.10931/u)
  assert.match(
    report,
    /https:\/\/www\.usenix\.org\/conference\/usenixsecurity24\/presentation\/deng/u,
  )
  assert.match(report, /확인일: 2026-08-31/u)
})

test("GitHub Pages는 main 브랜치의 Quartz 빌드를 배포한다", () => {
  const workflow = readFileSync(resolve(root, ".github/workflows/deploy.yml"), "utf8")
  const config = readFileSync(resolve(root, "quartz.config.yaml"), "utf8")

  assert.match(workflow, /branches:\s*\r?\n\s*- main/u)
  assert.match(workflow, /node-version: 24/u)
  assert.match(workflow, /run: npm ci/u)
  assert.match(workflow, /run: npx quartz build/u)
  assert.match(workflow, /actions\/upload-pages-artifact@v3/u)
  assert.match(workflow, /actions\/deploy-pages@v4/u)
  assert.match(config, /baseUrl: agnusdei1207\.github\.io\/lab/u)
})

test("포털 브랜드는 특정 연구 분야로 한정하지 않는다", () => {
  const publicBranding = ["content/index.md", "README.md", "quartz.config.yaml"]
    .map((path) => readFileSync(resolve(root, path), "utf8"))
    .join("\n")

  assert.doesNotMatch(publicBranding, /AI 보안 연구/u)
  assert.match(publicBranding, /LAB ARCHIVE/u)
})

test("GitHub Pages 루트는 README가 아니라 Quartz 결과를 제공한다", () => {
  const html = readFileSync(resolve(root, "index.html"), "utf8")

  assert.match(html, /<meta name="generator" content="Quartz"/u)
  assert.doesNotMatch(html, /class="domain-card"/u)
  assert.match(html, /class="explorer/u)
  assert.match(html, /class="darkmode"/u)
  assert.match(html, /class="search"/u)
})

test("학술 출판물에 가까운 서체와 색상 체계를 사용한다", () => {
  const config = readFileSync(resolve(root, "quartz.config.yaml"), "utf8")
  const styles = readFileSync(resolve(root, "quartz/styles/custom.scss"), "utf8")

  assert.match(config, /header: Noto Serif KR/u)
  assert.match(config, /body: Noto Sans KR/u)
  assert.match(config, /secondary: "#7a2432"/u)
  assert.match(config, /light: "#f7f4ed"/u)
  assert.match(styles, /--rule-color/u)
  assert.doesNotMatch(styles, /\.domain-card/u)
})
