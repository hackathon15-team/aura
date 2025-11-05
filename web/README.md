# AURA 시연 웹사이트

접근성 문제가 있는 데모 쇼핑몰 페이지입니다.

## 포함된 접근성 문제

### 1. 비시맨틱 버튼
- "할인 받기", "구매하기", "구독하기", "쿠폰 받기" 등이 `<div onclick>`으로 구현
- `role="button"`, `tabindex`, 키보드 이벤트 없음

### 2. 이미지 alt 누락
- 상품 이미지 4개에 alt 속성 없음
- Vision API가 자동으로 분석하여 alt 생성

### 3. 폼 레이블 누락
- 이메일 입력란에 `<label>` 없음
- 체크박스에 연결된 `<label>` 없음

### 4. ARIA 역할 누락
- header에 `role="banner"` 없음
- nav에 `role="navigation"` 없음
- main 콘텐츠에 `role="main"` 없음
- footer에 `role="contentinfo"` 없음
- 모달에 `role="dialog"`, `aria-modal` 없음

### 5. ARIA 상태 누락
- 드롭다운에 `aria-expanded` 없음
- 체크박스 스타일 요소에 `aria-checked` 없음

### 6. 키보드 접근성
- 클릭 가능한 요소들이 Tab으로 포커스 불가
- Enter/Space로 활성화 불가

### 7. 강조 표시
- CSS로만 bold/italic 처리된 텍스트

## 사용 방법

1. 브라우저에서 `index.html` 열기
2. AURA 확장 프로그램 활성화
3. 팝업에서 통계 및 수정 로그 확인
4. 스크린 리더로 테스트

## AURA가 수정하는 내용

- ✅ 모든 div 버튼 → `role="button"` + `tabindex="0"` + 키보드 이벤트
- ✅ 이미지 → Vision API로 alt 텍스트 생성
- ✅ 폼 요소 → `aria-label` 추가
- ✅ 레이아웃 → 적절한 landmark 역할 추가
- ✅ 드롭다운 → `aria-expanded` 추가
- ✅ 모달 → `role="dialog"` + `aria-modal="true"`
- ✅ 볼드/이탤릭 → `aria-label`로 강조 표시
