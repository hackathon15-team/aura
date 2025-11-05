# 🌐 AURA

**실시간 웹 접근성 자동 개선 확장 프로그램**

스크린 리더 사용자를 위해 웹 접근성 문제를 자동으로 감지하고 수정하는 Chrome 확장 프로그램입니다.

## ⚠️ 중요

이 확장 프로그램은 **시각적 변화 없이** ARIA 속성과 키보드 접근성만 추가합니다.
- ✅ ARIA 역할, 레이블, 상태, 속성 추가
- ✅ 키보드 이벤트 핸들러 추가
- ❌ DOM 구조 변경 없음
- ❌ CSS 스타일 수정 없음

## 🎯 주요 기능

### 자동 접근성 개선
- 비시맨틱 요소에 ARIA 역할 추가 (`<div onclick>` → `role="button"`)
- 누락된 ARIA 속성 자동 추가
- 키보드 접근성 확보 (Enter/Space 이벤트)
- 폼 요소에 aria-label 추가
- 이미지 alt 텍스트 자동 생성

### 실시간 모니터링
- MutationObserver로 동적 콘텐츠 감지
- SPA, AJAX, 무한 스크롤 지원
- Debouncing으로 성능 최적화

### 토글 기능
- 팝업에서 ON/OFF 전환 가능
- OFF 시 완전히 비활성화 (감지 안 함)
- 설정 자동 저장

### 상세 로그
- 각 수정 사항 실시간 기록
- Before/After 비교
- 타임스탬프 포함
- 최대 50개 로그 유지

## 📦 설치

### 1. 빌드

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

### 기본 사용
1. 웹사이트 방문 → 자동으로 접근성 개선 시작
2. 확장 프로그램 아이콘 클릭 → 통계 및 로그 확인

### 토글 ON/OFF
- 팝업 우측 상단 토글 스위치
- OFF: 완전히 비활성화 (페이지 새로고침)
- ON: 활성화 후 즉시 스캔 시작

### 로그 확인
- 팝업 하단에서 모든 수정 내역 확인
- "초기화" 버튼으로 로그 삭제

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

## 📊 감지하는 문제

1. 비시맨틱 버튼 (onclick이 있는 div/span)
2. 비시맨틱 강조 (CSS만으로 볼드/이탤릭)
3. 누락된 ARIA 레이블
4. 누락된 ARIA 역할
5. 이미지 alt 텍스트 누락
6. 키보드 접근 불가능한 요소
7. 레이블 없는 폼 요소
8. WCAG 위반 (axe-core 통합)

## 🎯 WCAG 2.1 준수

- **지각 가능**: 대체 텍스트, ARIA 레이블
- **운용 가능**: 키보드 접근성
- **이해 가능**: 명확한 레이블
- **견고성**: ARIA, 표준 준수

## 🚀 성능

- requestAnimationFrame 배치 업데이트
- 100ms Debouncing
- WeakSet 중복 방지
- 우선순위 기반 처리 (P0 → P1 → P2)

## 📋 기술 스택

- TypeScript
- Vite
- axe-core
- Chrome Extension Manifest V3
- MutationObserver API

## 📝 라이선스

ISC

## 👨‍💻 작성자

황준혁
