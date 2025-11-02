
import { GoogleGenAI, Modality } from "@google/genai";
import { GoalFormData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function createPrompt(formData: GoalFormData): string {
  const formattedAmount = new Intl.NumberFormat('vi-VN').format(Number(formData.amount) || 0);

  // Date formatting: YYYY-MM-DD -> DD-MM-YYYY
  let formattedDate = formData.date;
  if (formData.date && formData.date.includes('-')) {
    const parts = formData.date.split('-');
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  return `
Bạn là một chuyên gia viết văn đầy cảm hứng, chuyên tạo ra những "bức tranh mục tiêu" sống động và mạnh mẽ.
Nhiệm vụ của bạn là viết một câu chuyện ở thì hiện tại, kể lại khoảnh khắc một người đạt được mục tiêu 30 ngày của họ.
Hãy sử dụng những thông tin sau đây để xây dựng câu chuyện:

- Ngày đạt được: ${formattedDate}
- Tên nhân vật chính: ${formData.name}
- Địa điểm: ${formData.location}
- Số tiền đạt được: ${formattedAmount} VND
- Tài khoản ngân hàng: ${formData.account}
- Khoảnh khắc nhận ra thành công: ${formData.moment}
- Ăn mừng trực tiếp cùng: ${formData.celebrateWith1}
- Những người nhắn tin chúc mừng: ${formData.celebrateWith2}
- Cách họ gọi nhân vật chính qua tin nhắn: ${formData.celebrateWith2Pronoun}
- Nơi nhắn tin báo tin vui: ${formData.messageTo}

**Yêu cầu BẮT BUỘC:**

1.  **Thì Hiện Tại:** Toàn bộ câu chuyện phải được viết ở thì hiện tại, như thể nó đang xảy ra ngay bây giờ. Bắt đầu bằng "Hôm nay, ngày ${formattedDate}, tôi, ${formData.name}, đang...".
2.  **Tích hợp 6 Nhu Cầu Con Người của Tony Robbins:** Lồng ghép một cách tự nhiên những cảm xúc và trạng thái liên quan đến:
    *   **Chắc chắn (Certainty):** Cảm giác an toàn, tự tin, mọi thứ trong tầm kiểm soát.
    *   **Đa dạng (Variety):** Cảm giác phấn khích, bất ngờ thú vị.
    *   **Tầm quan trọng (Significance):** Cảm giác được công nhận, đặc biệt, đáng tự hào.
    *   **Kết nối & Yêu thương (Connection & Love):** Cảm giác ấm áp khi chia sẻ với người thân yêu.
    *   **Phát triển (Growth):** Cảm giác trưởng thành, vượt qua thử thách.
    *   **Cống hiến (Contribution):** Cảm giác thành công này có ý nghĩa lớn hơn cho cộng đồng (ví dụ: truyền cảm hứng cho nhóm).
3.  **Sử dụng 6 Giác Quan:** Mô tả chi tiết trải nghiệm bằng cách sử dụng:
    *   **Thị giác (Nhìn):** Họ thấy gì? (Ánh đèn, màu sắc, khung cảnh, màn hình điện thoại...)
    *   **Thính giác (Nghe):** Họ nghe thấy gì? (Tiếng "ting ting", nhạc, tiếng nói, tiếng reo hò...)
    *   **Xúc giác (Chạm):** Họ chạm vào gì? (Ly rượu, cái nắm tay, màn hình điện thoại...)
    *   **Khứu giác (Ngửi):** Họ ngửi thấy mùi gì? (Mùi thức ăn, nước hoa, không khí trong lành...)
    *   **Vị giác (Nếm):** Họ nếm vị gì? (Vị rượu vang, món ăn ngon...)
    *   **Cảm giác (Cảm xúc nội tâm):** Họ cảm thấy thế nào trong cơ thể? (Tim đập nhanh, lồng ngực ấm áp, sự nhẹ nhõm...)
4.  **Cấu trúc câu chuyện:**
    *   Mở đầu bằng bối cảnh (ngày, tên, địa điểm).
    *   Mô tả không gian bằng các giác quan.
    *   Diễn tả cảm xúc liên quan đến 6 nhu cầu.
    *   Mô tả khoảnh khắc "${formData.moment}" và nhìn thấy số tiền.
    *   Kể lại cuộc đối thoại với ${formData.celebrateWith1}.
    *   Kể lại việc nhận tin nhắn từ ${formData.celebrateWith2}. Họ sẽ nhắn những lời chúc mừng và gọi nhân vật chính là "${formData.celebrateWith2Pronoun}". Ví dụ: "Chúc mừng ${formData.celebrateWith2Pronoun} nhé!".
    *   Kể lại việc nhắn tin vào ${formData.messageTo} và phản ứng của mọi người.
    *   Kết thúc bằng câu: "Hôm nay là một ngày tuyệt vời của tôi."

**QUAN TRỌNG:** KHÔNG thêm bất kỳ lời cảm ơn nào ở cuối bài viết.
`;
}


export const generateStory = async (formData: GoalFormData): Promise<string> => {
  const prompt = createPrompt(formData);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });
  return response.text;
};

export const generateAudio = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // A standard male voice
          },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data received from API.");
  }
  return base64Audio;
};
