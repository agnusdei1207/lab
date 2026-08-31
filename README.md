# LAB 연구 아카이브

여러 분야의 연구를 서로 연결해 탐색하는 [Quartz v5](https://quartz.jzhao.xyz/) 기반 정적 사이트입니다. 현재 공개된 연구는 에이전트, RAG·컨텍스트, AI 모델 보호, 플랫폼·평가 분야이며 새 도메인을 계속 추가할 수 있습니다.

- 공개 사이트: <https://agnusdei1207.github.io/lab/>
- 메인 페이지: 연구 도메인 분류
- 도메인 페이지: 해당 분야의 연구 목록
- 연구 페이지: 검색, 목차, 백링크, 로컬·전체 그래프
- 화면 설정: 아이콘 방식의 다크·라이트 모드와 움직임 감소 지원

## 로컬 실행

Node.js 22 이상이 필요합니다. 이 저장소의 배포 환경은 Node.js 24를 사용합니다.

```sh
npm ci
npx quartz build --serve
```

브라우저에서 `http://localhost:8080`을 엽니다.

## 연구 추가 방법

1. `content/<도메인>/<연구-slug>/`에 Markdown과 이미지를 둡니다.
2. 문서에 다음 frontmatter를 추가합니다.
3. 도메인의 `index.md`에서 새 문서를 `[[위키링크]]`로 연결합니다.
4. 관련 연구를 본문에서 연결해 백링크와 그래프 관계를 만듭니다.
5. 테스트와 빌드를 실행한 뒤 `main`에 푸시합니다.

```yaml
---
title: 연구 제목
description: 한두 문장의 연구 요약
tags:
  - domain/example
  - topic/example
date: 2026-08-31
publish: true
---
```

검색 과정에서 확인한 자료는 문서의 `## 참고문헌`에 원문 링크와 확인일을 남깁니다. 실측 결과와 문헌 인용 수치를 구분하고, 측정하지 않은 값은 추정치처럼 쓰지 않습니다.

## 검증 및 배포

```sh
node --test tests/portal.test.mjs
npm run check
npx quartz build
```

`main` 브랜치에 푸시하면 `.github/workflows/deploy.yml`이 `public/`을 빌드해 GitHub Pages에 배포합니다.
