import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Open CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/analyze-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    console.log('[Vision API] Analyzing image:', imageUrl.substring(0, 100));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `이 이미지에 대한 alt 텍스트를 작성해주세요. 다음 지침을 따라주세요:

1. 이미지의 **목적과 의미**를 설명하세요 (단순히 외형 묘사는 피하세요)
2. 이미지에 **텍스트**가 포함되어 있다면 반드시 그 내용을 포함하세요
3. **간결하게** 작성하세요 (1-2문장, 최대 125자)
4. "이미지", "사진", "그림" 같은 불필요한 단어는 생략하세요
5. 장식용 이미지라면 "장식용 이미지"라고만 답하세요
6. 버튼이나 링크 이미지라면 그 **기능**을 설명하세요 (예: "검색", "닫기")

핵심 정보만 한국어로 간결하게 작성해주세요.`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 100,
    });

    const altText = response.choices[0].message.content.trim();
    res.json({ altText });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`AURA Vision Server running on port ${port}`);
});
