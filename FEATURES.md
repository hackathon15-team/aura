# AURA 구현 기능

## 자동 감지 (DOMScanner)
- axe-core 통합으로 WCAG 2.1 위반 자동 감지
- 단일 패스 DOM 순회로 성능 최적화
- 중복 이슈 자동 제거
- React/Vue 프레임워크 이벤트 감지 지원

## 시맨틱 HTML 개선 (TransformationEngine)
- 클릭 가능한 div/span → role="button" + tabindex="0" + 키보드 이벤트
- CSS bold/italic → data-weally-emphasis 마크
- 이미지 alt 누락 → OpenAI Vision API로 자동 생성 (선택적)
- 폼 요소 → aria-label 자동 추가 (placeholder/인접 텍스트 활용)
- 메모리 누수 방지 (WeakMap 이벤트 리스너 관리)

## ARIA 속성 관리 (ARIAManager)
- HTML5 시맨틱 태그 제외 (중복 role 방지)
- 정확한 클래스명 매칭 ([class~=] 사용)
- 검증 로직으로 거짓 양성 최소화

**추가되는 ARIA 역할:**
- role="navigation" (nav 클래스 요소)
- role="main" (main 클래스 요소)
- role="dialog" + aria-modal="true" (modal/popup)
- role="search" (검색 폼)
- role="button" (버튼 모양 요소)
- role="banner" (header)
- role="contentinfo" (footer)
- role="complementary" (sidebar/aside)

**추가되는 ARIA 상태:**
- aria-expanded (드롭다운/아코디언)
- aria-checked (체크박스 스타일)
- aria-selected (선택 가능 항목)
- aria-disabled (비활성 요소)
- aria-haspopup (팝업 트리거)

## 동적 콘텐츠 지원 (AccessibilityObserver)
- MutationObserver로 실시간 감지
- 무한 루프 방지 (processingElements/recentlyProcessed WeakSet)
- ARIA 추가 변경 무시 (자체 변경 제외)
- 배치 제한 (최대 100개 mutation)
- 중복 처리 자동 제거
- SPA/AJAX/무한스크롤 완벽 지원

## 성능 최적화
- querySelectorAll('*') 1회만 호출 (이전 2회)
- getComputedStyle 호출 최소화
- WeakSet/WeakMap으로 메모리 관리
- requestAnimationFrame 배치 업데이트
- 100ms debouncing

## 추가 기능
- 빈 alt vs 누락 alt 구분
- Heading hierarchy 검증 (h1 누락, 레벨 점프)
- target="_blank" 링크 경고 감지
- 무의미한 텍스트 필터링
- OpenAI Vision API 재시도 로직 (2회, 지수 백오프)
- 타임아웃 처리 (10초)
