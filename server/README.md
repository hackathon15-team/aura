# AURA Vision Server

이미지 분석을 위한 간단한 Express 서버

## 설치

```bash
cd server
npm install
```

## 설정

`.env` 파일 생성:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

## 실행

```bash
npm start
```

## API

### POST /analyze-image

이미지 URL을 받아서 alt 텍스트 반환

Request:
```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```

Response:
```json
{
  "altText": "분석된 이미지 설명"
}
```
