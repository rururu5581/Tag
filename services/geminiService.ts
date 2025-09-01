import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedTags } from '../types';

const systemInstruction = `あなたは、優秀な人材エージェントのコンサルタントです。あなたのタスクは、提供された企業、求人、または求職者に関するテキスト情報（または音声情報の文字起こし）を分析し、関連性の高いタグを抽出することです。

重要事項:
- タグは、提供された情報源に明確に記載されているか、直接的に示唆されている内容に限定してください。
- 過度な推測や、情報源に基づかない情報の生成は絶対に避けてください。
- 特に「希望」や「その他・人柄」のカテゴリについては、発言者の言葉遣い、表現、明確な要望から客観的に判断できる事実のみをタグとしてください。
-「人柄」は音声の時の話し方、またはコンサルタントの面談メモで書いてある以外は読み取れないと思うので無理に生成しないでください。
- 該当する情報がない場合、そのカテゴリのタグは空の配列（[]）として問題ありません。無理にタグを生成する必要はありません。

タグは「情報」「条件」「希望」「その他・人柄」の4つのカテゴリに分類し、指定されたJSONスキーマに厳密に従ってアウトプットしてください。`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    information: {
      type: Type.ARRAY,
      description: "企業名、役職、スキル、経験年数などの事実情報に関するタグ。",
      items: { type: Type.STRING }
    },
    conditions: {
      type: Type.ARRAY,
      description: "給与、勤務地、必須資格などの具体的な条件や要件に関するタグ。",
      items: { type: Type.STRING }
    },
    preferences: {
      type: Type.ARRAY,
      description: "本人が明確に述べた希望する社風、キャリアゴール、ワークライフバランスなどに関するタグ。",
      items: { type: Type.STRING }
    },
    personality: {
      type: Type.ARRAY,
      description: "「熱意が感じられる話し方」「論理的」など、言葉遣いや表現から客観的に判断できる人柄やその他の所見に関するタグ。",
      items: { type: Type.STRING }
    },
  },
  required: ['information', 'conditions', 'preferences', 'personality']
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the "data:mime/type;base64," prefix
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const callGeminiAPI = async (parts: any[]): Promise<GeneratedTags> => {
    // FIX: Per coding guidelines, the API key must be retrieved from process.env.API_KEY.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("APIキーが設定されていません。環境変数 'API_KEY' を設定してください。");
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        // Sometimes the response can be wrapped in ```json ... ```
        const sanitizedJsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '');
        const parsed = JSON.parse(sanitizedJsonText);

        // Ensure all categories exist, even if empty
        return {
            information: parsed.information || [],
            conditions: parsed.conditions || [],
            preferences: parsed.preferences || [],
            personality: parsed.personality || [],
        };
    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
             throw new Error("APIキーが無効です。正しいキーが設定されているか確認してください。");
        }
        throw new Error("AIモデルからの応答取得に失敗しました。入力内容を確認するか、時間をおいて再度お試しください。");
    }
};

export const generateTagsFromText = async (text: string): Promise<GeneratedTags> => {
  if (!text.trim()) {
    throw new Error("テキストが入力されていません。");
  }
  const parts = [{ text }];
  return callGeminiAPI(parts);
};

export const generateTagsFromAudio = async (file: File): Promise<GeneratedTags> => {
  const base64Audio = await fileToBase64(file);
  const audioPart = {
    inlineData: {
      data: base64Audio,
      mimeType: file.type,
    },
  };
  const textPart = { text: "この音声ファイルの内容を分析し、タグを生成してください。" };
  const parts = [audioPart, textPart];
  return callGeminiAPI(parts);
};
