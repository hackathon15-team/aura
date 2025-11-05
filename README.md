# 🌐 Web-Ally

**Automatic Web Accessibility Enhancement Extension**

웹 접근성 문제를 실시간으로 감지하고 자동으로 수정하여 스크린 리더 사용자의 웹 경험을 개선하는 Chrome 확장 프로그램입니다.

## ⚠️ 중요: 시각적 변화 없음

이 확장 프로그램은 **일반 사용자에게는 아무런 시각적 변화가 없습니다**. 웹페이지의 DOM 구조나 CSS 스타일을 변경하지 않으며, 오직 **ARIA 속성과 키보드 접근성만 추가**하여 스크린 리더와 보조 기술 사용자에게만 혜택을 제공합니다.

**What we do:**
- ✅ ARIA 역할, 레이블, 상태, 속성 추가
- ✅ 키보드 이벤트 핸들러 추가 (Enter/Space로 클릭)
- ✅ 이미지 alt 텍스트 추가
- ✅ 폼 요소에 aria-label 추가

**What we DON'T do:**
- ❌ DOM 구조 변경 (요소 교체 없음)
- ❌ CSS 스타일 수정
- ❌ 보이는 요소 추가
- ❌ 페이지 레이아웃 변경

## 🎯 주요 기능

### 자동 감지 및 수정 (시각적 변화 없음)
- **비시맨틱 요소 개선**: `<div onclick>`에 `role="button"` 추가 (DOM 변경 없음)
- **ARIA 속성 자동 추가**: 누락된 role, label, state, property 자동 보완
- **키보드 접근성**: 모든 인터랙티브 요소에 tabindex 및 키보드 이벤트 추가
- **폼 레이블 생성**: 레이블이 없는 입력 필드에 `aria-label` 추가 (가시적 레이블 생성 안 함)
- **이미지 alt 텍스트**: 누락된 alt 속성 자동 추가

### 실시간 모니터링
- **동적 콘텐츠 감지**: MutationObserver로 SPA, AJAX, 무한 스크롤 등 모든 동적 변경 감지
- **성능 최적화**: 배치 업데이트 및 debouncing으로 성능 영향 최소화

### 포괄적 검증
- **axe-core 통합**: WCAG 2.1 표준 준수 자동 검증
- **10+ 감지 규칙**: 버튼, 강조, ARIA, 구조, 키보드, 폼 등 다양한 접근성 문제 감지

## 📦 설치 방법

### 1. 프로젝트 클론 및 빌드

```bash
# 저장소 클론
git clone <repository-url>
cd web-ally

# 의존성 설치
npm install

# 빌드
npm run build
```

빌드가 완료되면 `dist/` 폴더에 확장 프로그램 파일이 생성됩니다.

### 2. Chrome에 확장 프로그램 로드

1. Chrome 브라우저에서 `chrome://extensions/` 페이지 열기
2. 우측 상단의 "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `web-ally/dist` 폴더 선택

### 3. 확장 프로그램 사용

- 확장 프로그램이 로드되면 자동으로 모든 웹 페이지에서 작동합니다
- 확장 프로그램 아이콘을 클릭하여 현재 페이지의 통계 확인 가능
- 개발자 콘솔에서 `[Web-Ally]` 로그를 통해 자세한 작업 내역 확인

## 🏗️ 프로젝트 구조

```
web-ally/
├── src/
│   ├── content.ts                    # 메인 엔트리 포인트
│   ├── scanner/
│   │   └── DOMScanner.ts            # DOM 분석 및 문제 감지
│   ├── transformer/
│   │   └── TransformationEngine.ts  # HTML 변환 엔진
│   ├── aria/
│   │   └── ARIAManager.ts           # ARIA 속성 관리
│   ├── observer/
│   │   └── AccessibilityObserver.ts # 동적 콘텐츠 모니터링
│   ├── utils/
│   │   └── DOMUtils.ts              # DOM 조작 유틸리티
│   └── popup/
│       ├── popup.html               # 확장 프로그램 팝업 UI
│       └── popup.ts                 # 팝업 스크립트
├── manifest.json                     # Chrome 확장 프로그램 매니페스트
├── vite.config.ts                    # Vite 빌드 설정
├── tsconfig.json                     # TypeScript 설정
└── package.json                      # 프로젝트 의존성
```

## 🔧 개발

### 개발 모드 실행

```bash
# 변경 사항 감지 및 자동 리빌드
npm run dev
```

### 타입 체크

```bash
npm run type-check
```

### 빌드

```bash
npm run build
```

## 🎨 구현된 접근성 개선 규칙

### 1. 비시맨틱 버튼 → ARIA 버튼 (DOM 변경 없음)
```html
<!-- Before -->
<div onclick="handleClick()" style="cursor: pointer">클릭</div>

<!-- After (DOM 구조 동일, ARIA만 추가) -->
<div onclick="handleClick()" style="cursor: pointer"
     role="button" tabindex="0" aria-label="클릭">클릭</div>
<!-- + Enter/Space 키 이벤트 핸들러 자동 추가 (시각적 변화 없음) -->
```

### 2. CSS 강조 → ARIA 설명 추가 (시각적 변화 없음)
```html
<!-- Before -->
<span style="font-weight: bold">중요</span>

<!-- After (스타일 동일) -->
<span style="font-weight: bold" role="text" aria-label="강조: 중요">중요</span>
```

### 3. ARIA 속성 추가 (시각적 변화 없음)
```html
<!-- Before -->
<div class="modal">...</div>

<!-- After -->
<div class="modal" role="dialog" aria-modal="true">...</div>
```

### 4. 키보드 접근성 (시각적 변화 없음)
```html
<!-- Before -->
<div onclick="handleClick()">액션</div>

<!-- After -->
<div onclick="handleClick()" tabindex="0" role="button" aria-label="액션">액션</div>
<!-- + Enter/Space 키 이벤트 핸들러 자동 추가 -->
```

### 5. 폼 레이블 (가시적 요소 추가 없음)
```html
<!-- Before -->
<input type="text" placeholder="이름">

<!-- After (aria-label만 추가) -->
<input type="text" placeholder="이름" aria-label="이름">
```

## 📊 감지하는 접근성 문제

1. **비시맨틱 버튼**: onclick이 있는 div/span
2. **비시맨틱 강조**: CSS만으로 볼드/이탤릭 처리
3. **누락된 ARIA 레이블**: 인터랙티브 요소의 레이블 부재
4. **누락된 ARIA 역할**: 적절한 role 속성 부재
5. **구조 문제**: 이미지 alt 텍스트 누락 등
6. **키보드 접근성**: 키보드로 접근 불가능한 인터랙티브 요소
7. **폼 문제**: 레이블이 없는 입력 필드
8. **색상 대비**: 낮은 색상 대비율 (감지 구현, 수정 예정)
9. **WCAG 위반**: axe-core를 통한 모든 WCAG 2.1 위반 사항

## 🚀 성능 최적화

- **배치 업데이트**: requestAnimationFrame을 사용한 DOM 조작 최적화
- **Debouncing**: 100ms debounce로 과도한 MutationObserver 호출 방지
- **WeakSet 추적**: 중복 변환 방지
- **우선순위 기반 처리**: P0 (긴급) → P1 → P2 순서로 문제 해결

## 📋 기술 스택

- **TypeScript**: 타입 안전성
- **Vite**: 빌드 도구
- **axe-core**: 접근성 검증 라이브러리
- **Manifest V3**: 최신 Chrome 확장 프로그램 API
- **MutationObserver API**: 실시간 DOM 변경 감지

## 🎯 WCAG 2.1 준수

이 확장 프로그램은 다음 WCAG 원칙을 준수하도록 설계되었습니다:

- **지각 가능 (Perceivable)**: 대체 텍스트, ARIA 레이블
- **운용 가능 (Operable)**: 키보드 접근성, 포커스 관리
- **이해 가능 (Understandable)**: 시맨틱 HTML, 명확한 레이블
- **견고성 (Robust)**: ARIA, 표준 준수

## 📝 개발 일정 (해커톤)

### Day 1 ✅ (완료)
- 프로젝트 설정 및 구조
- DOM 스캐너 엔진
- 변환 엔진 (5가지 변환)
- ARIA 관리자
- MutationObserver

### Day 2 (예정)
- 구조적 개선 (제목 계층, 테이블, 리스트)
- 색상 대비 자동 수정
- 고급 키보드 네비게이션
- 실제 웹사이트 테스트

### Day 3 (예정)
- 스크린 리더 호환성 테스트
- 버그 수정 및 안정화
- 데모 준비

## 🤝 기여

이 프로젝트는 해커톤 프로젝트입니다. 피드백과 제안은 언제나 환영합니다!

## 📄 라이선스

ISC

## 👨‍💻 작성자

황준혁

---

**Note**: 이 프로젝트는 웹 접근성 개선을 위한 실험적 도구입니다. 프로덕션 환경에서 사용하기 전에 충분한 테스트를 수행하세요.
