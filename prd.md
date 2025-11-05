# 웹 접근성 개선 브라우저 확장 프로그램 PRD

**문서 버전:** v1.0  
**작성일:** 2025년 11월 5일  
**작성자:** 황준혁  
**프로젝트 유형:** 해커톤

---

## 1. 프로젝트 개요

시각 장애인의 웹 사용성을 높이기 위해 웹 접근성이 부족한 사이트를 실시간으로 보완하는 브라우저 확장 프로그램

### 배경
현재 대다수 웹사이트에서 발생하는 접근성 문제:
- 팝업과 일반 콘텐츠를 스크린 리더가 구분하지 못함
- CSS로만 강조 처리하여 의미론적 강조가 전달되지 않음
- 비표준 인터랙션 요소 사용 (예: `<div onclick>`)
- ARIA 속성 누락
- 시맨틱 HTML 미사용

### 목표
**웹사이트의 모든 접근성 문제를 자동으로 감지하고 수정하여 스크린 리더 호환성을 극대화**

---

## 2. 타겟 사용자

- **주요 사용자**: 시각 장애인 및 스크린 리더 사용자 (NVDA, JAWS, VoiceOver 등)

---

## 3. 핵심 기능

### 3.1 포괄적 웹 접근성 개선

**목표:** 웹 페이지의 모든 접근성 문제를 감지하고 자동으로 수정

확장 프로그램은 페이지를 스캔하여 접근성 표준(WCAG 2.1)을 위반하는 모든 요소를 찾아내고 자동으로 개선합니다.

### 3.2 시맨틱 HTML 변환

비시맨틱 요소를 적절한 시맨틱 태그로 자동 변환합니다.

**변환 예시 (일부):**
- `<div onclick>` → `<button>`
- CSS `font-weight: bold` → `<strong>` 태그로 감싸기
- `<div>` (팝업) → `role="dialog"` 추가
- 클릭 가능한 `<span>`, `<div>` → `<button>` 또는 `<a>`
- 이미지 컨테이너 → `<figure>`, `<figcaption>`
- 네비게이션 영역 → `<nav>`
- 메인 콘텐츠 영역 → `<main>`

**위 예시는 일부이며, 모든 비시맨틱 패턴을 감지하고 변환합니다.**

### 3.3 ARIA 속성 포괄적 추가

누락된 모든 ARIA 속성을 감지하고 추가합니다.

**추가되는 속성 카테고리:**

**1) 역할 (Roles):**
- button, dialog, navigation, banner, main, complementary, search, form, article, region 등
- 모든 WAI-ARIA 역할 지원

**2) 상태 (States):**
- aria-expanded, aria-hidden, aria-selected, aria-checked, aria-pressed
- aria-disabled, aria-invalid, aria-busy

**3) 속성 (Properties):**
- aria-label, aria-labelledby, aria-describedby
- aria-live, aria-atomic, aria-relevant
- aria-controls, aria-owns, aria-flowto
- aria-haspopup, aria-required, aria-readonly
- aria-level, aria-posinset, aria-setsize

**모든 필요한 ARIA 속성을 컨텍스트에 맞게 자동 추가합니다.**

### 3.4 구조적 개선

**모든 페이지 구조 문제를 개선합니다:**
- 제목 계층 구조 분석 및 수정 (h1 → h6)
- 랜드마크 역할 자동 추가 (header, nav, main, aside, footer)
- 리스트 구조 정리 (ul, ol, li)
- 테이블 접근성 (caption, th, scope)
- 폼 요소와 레이블 자동 연결
- 이미지 대체 텍스트 검증
- 스킵 네비게이션 링크 추가
- 포커스 순서 최적화

### 3.5 키보드 접근성 개선

- 모든 인터랙티브 요소에 tabindex 추가
- 포커스 가시성 확보
- 키보드 트랩 방지
- 커스텀 위젯에 키보드 이벤트 추가

### 3.6 실시간 감지 및 적용

- 페이지 로드 시 즉시 전체 DOM 스캔
- MutationObserver로 동적 콘텐츠 변경 실시간 감지
- SPA(Single Page Application) 완벽 지원
- AJAX/Fetch로 로드되는 콘텐츠 자동 처리
- 무한 스크롤, 동적 모달 등 모든 동적 요소 처리

### 3.7 색상 및 대비 개선

- 텍스트 색상 대비 자동 검증
- WCAG AA/AAA 기준 미달 시 색상 자동 조정
- 색맹 사용자를 위한 패턴 추가

### 3.8 멀티미디어 접근성

- 비디오에 자막 트랙 추가 촉구
- 오디오 대체 텍스트 제공
- 자동재생 미디어 감지 및 제어

---

## 4. 기술적 접근 방법

### 4.1 감지 알고리즘
- DOM 트리 완전 순회
- CSS computed style 분석
- 이벤트 리스너 감지
- 접근성 트리(Accessibility Tree) 분석
- axe-core 등 검증 라이브러리 활용

### 4.2 변환 엔진
- 안전한 DOM 조작 (기존 기능 보존)
- 스타일 충돌 방지
- 이벤트 핸들러 보존 및 이전
- 점진적 적용 (progressive enhancement)

### 4.3 성능 최적화
- 배치 DOM 업데이트
- requestAnimationFrame 활용
- 변환 우선순위 설정
- 무한 루프 방지

---

## 5. 기술 스택

- **Manifest V3** (Chrome Extension API)
- **TypeScript**
- **Content Script**: DOM 조작 및 변환
- **MutationObserver API**: 동적 감지
- **axe-core**: 접근성 검증
- **Webpack/Vite**: 빌드 도구

---

## 6. 성공 지표

- 접근성 점수 평균 50% 이상 향상
- 주요 사이트 95% 이상 개선 확인
- 스크린 리더 사용자 만족도 조사 긍정 응답 80% 이상

---

## 7. 개발 일정 (해커톤)

**Day 1:**
- 기본 확장 프로그램 구조
- DOM 스캔 엔진 구현
- 기본 변환 규칙 (button, strong)

**Day 2:**
- ARIA 속성 자동 추가
- 구조적 개선 로직
- MutationObserver 통합

**Day 3:**
- 테스트 및 디버깅
- 주요 사이트 검증
- 데모 준비

---

## 8. 핵심 철학

**"예시로 나열된 것만 하는 것이 아니라, 웹 접근성을 개선할 수 있는 모든 것을 한다"**

이 확장 프로그램은 WCAG 2.1의 모든 원칙을 구현하고, 발견되는 모든 접근성 문제를 해결하는 것을 목표로 합니다. 문서에 명시되지 않은 접근성 문제도 감지되면 자동으로 해결합니다.