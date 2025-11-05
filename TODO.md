# 웹 접근성 개선 브라우저 확장 프로그램 - 작업 목록

**프로젝트:** Web-Ally
**기간:** 3일 (해커톤)
**최종 업데이트:** 2025년 11월 5일

---

## Day 1: 기본 구조 및 핵심 엔진 구현

### 1. 프로젝트 초기 설정
- [ ] 프로젝트 디렉토리 구조 생성
- [ ] package.json 및 의존성 설정
  - [ ] TypeScript 설정
  - [ ] Webpack/Vite 빌드 도구 설정
  - [ ] axe-core 라이브러리 추가
- [ ] Manifest V3 설정 파일 작성
  - [ ] content_scripts 설정
  - [ ] permissions 설정 (activeTab, scripting 등)
  - [ ] icons 및 메타데이터

### 2. DOM 스캔 엔진 구현
- [ ] DOM 트리 완전 순회 알고리즘 구현
- [ ] CSS computed style 분석 기능
- [ ] 이벤트 리스너 감지 로직
- [ ] 접근성 트리(Accessibility Tree) 분석
- [ ] axe-core 통합 및 검증 로직

### 3. 기본 변환 규칙 구현
- [ ] 비시맨틱 요소 → 시맨틱 태그 변환
  - [ ] `<div onclick>` → `<button>` 변환
  - [ ] CSS `font-weight: bold` → `<strong>` 태그 감싸기
  - [ ] 클릭 가능한 `<span>`, `<div>` → `<button>` 또는 `<a>` 변환
- [ ] 안전한 DOM 조작 유틸리티 함수
- [ ] 이벤트 핸들러 보존 및 이전 로직

### 4. 성능 최적화 기반 구축
- [ ] 배치 DOM 업데이트 구현
- [ ] requestAnimationFrame 활용
- [ ] 무한 루프 방지 메커니즘

---

## Day 2: ARIA 속성 및 구조적 개선

### 5. ARIA 속성 자동 추가 시스템
- [ ] ARIA 역할(Roles) 추가
  - [ ] button, dialog, navigation, banner, main 등
  - [ ] 모든 WAI-ARIA 역할 지원
- [ ] ARIA 상태(States) 추가
  - [ ] aria-expanded, aria-hidden, aria-selected 등
  - [ ] aria-checked, aria-pressed, aria-disabled 등
- [ ] ARIA 속성(Properties) 추가
  - [ ] aria-label, aria-labelledby, aria-describedby
  - [ ] aria-live, aria-atomic, aria-relevant
  - [ ] aria-controls, aria-owns, aria-flowto
  - [ ] aria-haspopup, aria-required, aria-readonly
  - [ ] aria-level, aria-posinset, aria-setsize

### 6. 구조적 개선 구현
- [ ] 제목 계층 구조 분석 및 수정 (h1 → h6)
- [ ] 랜드마크 역할 자동 추가
  - [ ] header, nav, main, aside, footer 감지 및 추가
- [ ] 리스트 구조 정리 (ul, ol, li)
- [ ] 테이블 접근성 개선
  - [ ] caption, th, scope 추가
- [ ] 폼 요소와 레이블 자동 연결
- [ ] 이미지 대체 텍스트 검증 및 경고
- [ ] 스킵 네비게이션 링크 추가
- [ ] 포커스 순서 최적화

### 7. 키보드 접근성 개선
- [ ] 인터랙티브 요소에 tabindex 추가
- [ ] 포커스 가시성 확보
- [ ] 키보드 트랩 방지 로직
- [ ] 커스텀 위젯에 키보드 이벤트 추가

### 8. 실시간 감지 및 적용
- [ ] MutationObserver 구현
  - [ ] 동적 콘텐츠 변경 실시간 감지
  - [ ] SPA(Single Page Application) 지원
  - [ ] AJAX/Fetch 콘텐츠 자동 처리
- [ ] 무한 스크롤 처리
- [ ] 동적 모달 처리
- [ ] 변환 우선순위 설정

### 9. 추가 시맨틱 변환 규칙
- [ ] `<div>` (팝업) → `role="dialog"` 추가
- [ ] 이미지 컨테이너 → `<figure>`, `<figcaption>`
- [ ] 네비게이션 영역 → `<nav>`
- [ ] 메인 콘텐츠 영역 → `<main>`

---

## Day 3: 고급 기능 및 테스트

### 10. 색상 및 대비 개선
- [ ] 텍스트 색상 대비 자동 검증
- [ ] WCAG AA/AAA 기준 검사
- [ ] 기준 미달 시 색상 자동 조정 로직
- [ ] 색맹 사용자를 위한 패턴 추가

### 11. 멀티미디어 접근성
- [ ] 비디오 자막 트랙 검증
- [ ] 오디오 대체 텍스트 제공
- [ ] 자동재생 미디어 감지 및 제어

### 12. 테스트 및 검증
- [ ] 주요 웹사이트 테스트
  - [ ] 네이버
  - [ ] 다음
  - [ ] 쿠팡
  - [ ] 기타 주요 사이트
- [ ] 스크린 리더 호환성 테스트
  - [ ] NVDA 테스트
  - [ ] JAWS 테스트 (가능 시)
  - [ ] VoiceOver 테스트
- [ ] 성능 테스트
  - [ ] 페이지 로딩 속도 영향 측정
  - [ ] 메모리 사용량 확인
- [ ] 버그 수정 및 안정화

### 13. UI/UX 추가 기능 (선택적)
- [ ] 확장 프로그램 팝업 UI
  - [ ] 현재 페이지 접근성 점수 표시
  - [ ] 수정된 항목 수 표시
  - [ ] 온/오프 토글
- [ ] 개발자 도구 패널 (선택적)
  - [ ] 수정 내역 로그
  - [ ] 수정 전/후 비교

### 14. 문서화 및 데모 준비
- [ ] README.md 작성
  - [ ] 설치 방법
  - [ ] 사용 방법
  - [ ] 기능 설명
- [ ] 데모 시나리오 준비
  - [ ] Before/After 스크린샷
  - [ ] 스크린 리더 데모 영상
- [ ] 발표 자료 준비
  - [ ] 문제 정의
  - [ ] 솔루션 소개
  - [ ] 기술적 접근
  - [ ] 성과 지표

---

## 추가 고려사항

### 기술적 도전 과제
- [ ] 스타일 충돌 방지 메커니즘
- [ ] 기존 웹사이트 기능 보존 확인
- [ ] 다양한 프레임워크 호환성 (React, Vue, Angular 등)
- [ ] Shadow DOM 처리

### 확장 가능성
- [ ] 사용자 설정 저장 (chrome.storage)
- [ ] 화이트리스트/블랙리스트 기능
- [ ] 커스텀 규칙 추가 기능
- [ ] 다국어 지원

---

## 우선순위

### 필수 (P0)
- DOM 스캔 엔진
- 기본 시맨틱 변환 (button, strong)
- ARIA 속성 추가 (핵심 속성)
- MutationObserver
- 주요 사이트 테스트

### 중요 (P1)
- 구조적 개선 (랜드마크, 제목 계층)
- 키보드 접근성
- 색상 대비 개선
- 성능 최적화

### 선택 (P2)
- 확장 프로그램 UI
- 멀티미디어 접근성
- 개발자 도구 패널
- 사용자 설정 기능

---

## 성공 지표 체크리스트

- [ ] 접근성 점수 평균 50% 이상 향상 확인
- [ ] 주요 사이트 95% 이상 개선 확인
- [ ] 스크린 리더 사용자 테스트 수행
- [ ] 데모 성공적으로 완료

---

**핵심 원칙:** "예시로 나열된 것만 하는 것이 아니라, 웹 접근성을 개선할 수 있는 모든 것을 한다"
