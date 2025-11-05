# 🌐 AURA

**실시간 웹 접근성 자동 개선 Chrome 확장 프로그램**

스크린 리더 사용자를 위해 웹 접근성 문제를 자동으로 감지하고 수정합니다.

## ⚠️ 중요

**시각적 변화 없이** ARIA 속성과 키보드 접근성만 추가합니다.
- ✅ ARIA 역할, 레이블, 상태, 속성 추가
- ✅ 키보드 이벤트 핸들러 추가
- ❌ DOM 구조 변경 없음
- ❌ CSS 스타일 수정 없음

## 🎯 구현된 기능

### 1. 자동 감지 (DOMScanner)
- **axe-core 통합**: WCAG 2.1 위반 자동 감지
- **비시맨틱 버튼**: `onclick`이 있는 div/span 감지
- **비시맨틱 강조**: CSS만으로 볼드/이탤릭 처리된 요소
- **ARIA 누락**: 역할, 레이블, 상태 누락 감지
- **구조적 문제**: 랜드마크, 제목 계층, alt 텍스트
- **키보드 접근성**: 인터랙티브 요소 키보드 접근 불가
- **폼 레이블**: 레이블 없는 input/select/textarea

### 2. 자동 수정 (TransformationEngine)
- **버튼 접근성**
  - `role="button"` 추가
  - `tabindex="0"` 추가
  - Enter/Space 키보드 이벤트 추가
- **강조 접근성**
  - 볼드 텍스트 → `data-weally-emphasis="strong"` 추가
  - 이탤릭 텍스트 → `data-weally-emphasis="em"` 추가
  - 원본 텍스트 보존 (role="text" 사용 안 함)
- **이미지**
  - alt 속성 누락 시 OpenAI Vision API로 자동 분석 및 생성
  - 50x50 이상 이미지만 분석 (작은 아이콘 제외)
  - Vision API 실패 시 파일명으로 폴백
- **폼**
  - placeholder나 인접 텍스트로 `aria-label` 생성
- **키보드**
  - 클릭 가능 요소에 키보드 이벤트 추가

### 3. ARIA 속성 관리 (ARIAManager)
- **역할 (Roles)**
  - `navigation`: nav 요소, class/id에 "nav" 포함
  - `main`: main 요소, class/id에 "main" 포함
  - `dialog`: modal/popup (fixed/absolute position)
  - `search`: 검색 폼
  - `button`: 버튼처럼 보이는 요소
  - `banner`, `contentinfo`, `complementary` 등
- **레이블 (Labels)**
  - 버튼, 링크, 폼 요소에 `aria-label` 추가
  - 인접 텍스트나 placeholder 활용
- **상태 (States)**
  - `aria-expanded`: 드롭다운, 아코디언
  - `aria-checked`: 체크박스 스타일 요소
  - `aria-selected`: 선택 가능한 항목
- **속성 (Properties)**
  - `aria-modal`: 모달 다이얼로그
  - `aria-haspopup`: 팝업 트리거
  - `aria-controls`: 제어 관계

### 4. 동적 콘텐츠 감지 (AccessibilityObserver)
- **MutationObserver**
  - DOM 변경 실시간 감지
  - 새로 추가된 요소 자동 처리
- **최적화**
  - 100ms debouncing
  - 중복 처리 방지 (WeakSet)
  - 배치 업데이트 (requestAnimationFrame)
  - 무한 루프 방지 (processingElements/recentlyProcessed)
  - ARIA 추가 변경 무시 (자체 수정 제외)
  - 최대 100개 mutation 제한
- **지원**
  - SPA (Single Page Application)
  - AJAX/Fetch 동적 로딩
  - 무한 스크롤
  - 모달/팝업
  - React/Vue 프레임워크

### 5. 팝업 UI
- **통계**
  - 감지: 발견된 접근성 문제 수
  - 수정: 수정된 문제 수
  - ARIA: 추가된 ARIA 속성 수
- **토글 스위치**
  - ON: 활성화 및 자동 스캔
  - OFF: 완전 비활성화 (페이지 새로고침)
- **수정 로그**
  - 타임스탬프
  - 수정 타입
  - 설명
  - Before/After 비교
  - 최대 50개 유지
- **초기화 버튼**
  - 로그 전체 삭제

### 6. 저장 및 설정
- **Chrome Storage**
  - 토글 상태 저장
  - 페이지 새로고침 시에도 유지
- **메시지 통신**
  - Popup ↔ Content Script
  - `GET_STATS`: 통계 조회
  - `TOGGLE_ENABLED`: ON/OFF 전환
  - `CLEAR_LOGS`: 로그 초기화

## 📦 설치

### 1. 확장 프로그램 빌드

```bash
git clone <repository-url>
cd web-ally
npm install
npm run build
```

### 2. Chrome에 로드

1. `chrome://extensions/` 열기
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `web-ally/dist` 폴더 선택

## 🎨 사용법

1. **웹사이트 방문** → 자동으로 접근성 개선 시작
2. **확장 아이콘 클릭** → 통계 및 로그 확인
3. **토글 스위치** → ON/OFF 전환 (페이지 새로고침)
4. **수정 내역** → 확장/접기 가능, 초기화 버튼

## 🏗️ 프로젝트 구조

```
web-ally/
├── src/
│   ├── content.ts              # 메인 로직
│   ├── scanner/
│   │   └── DOMScanner.ts       # 문제 감지
│   ├── transformer/
│   │   └── TransformationEngine.ts  # 접근성 개선
│   ├── aria/
│   │   └── ARIAManager.ts      # ARIA 관리
│   ├── observer/
│   │   └── AccessibilityObserver.ts # 동적 콘텐츠 감지
│   ├── utils/
│   │   └── DOMUtils.ts         # 유틸리티
│   └── popup/
│       ├── popup.html          # 팝업 UI
│       └── popup.ts            # 팝업 로직
├── manifest.json               # 확장 프로그램 설정
├── vite.config.ts             # 빌드 설정
└── package.json
```

## 🔧 개발

```bash
npm run dev        # 개발 모드 (자동 리빌드)
npm run build      # 프로덕션 빌드
npm run type-check # 타입 체크
```

## 📊 기술 스택

- **TypeScript**: 타입 안전성
- **Vite**: 빠른 빌드
- **axe-core**: WCAG 검증
- **Chrome Extension Manifest V3**: 최신 표준
- **MutationObserver API**: 동적 콘텐츠
- **Chrome Storage API**: 설정 저장

## 🚀 성능 최적화

- **단일 패스 DOM 순회**: querySelectorAll('*') 1회만 호출 (이전 2회)
- **메모리 관리**: WeakSet/WeakMap으로 메모리 누수 방지
- **이벤트 리스너 관리**: 중복 추가 방지, 가비지 컬렉션 가능
- **requestAnimationFrame**: 배치 DOM 업데이트
- **100ms Debouncing**: 과도한 감지 방지
- **getComputedStyle 최적화**: 필요시에만 호출
- **우선순위 처리**: P0 (긴급) → P1 (중요) → P2 (개선)
- **Vision API**: 재시도 2회, 지수 백오프, 10초 타임아웃

## 🎯 WCAG 2.1 준수

- **지각 가능**: 대체 텍스트, ARIA 레이블
- **운용 가능**: 키보드 접근성
- **이해 가능**: 명확한 레이블
- **견고성**: ARIA 표준 준수

## ⚠️ 제약사항

**시각적 변화 없음 원칙**에 따라 다음 항목은 개선하지 않습니다:
- 색상 대비 (color contrast)
- 터치 타겟 크기 (touch target size)
- 레이아웃 및 간격 (spacing)
- 메타 태그 수정 (viewport settings)

이러한 항목은 원본 사이트의 디자인을 변경해야 하므로, 스크린 리더 전용 개선을 목표로 하는 AURA의 범위를 벗어납니다.

## 📝 라이선스

ISC

## 👨‍💻 작성자

황준혁
