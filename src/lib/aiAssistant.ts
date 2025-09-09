// Interface untuk options AI Assistant
interface AIAssistantOptions {
  maxRetries?: number;
  timeout?: number;
  fallbackResponse?: string;
}

export async function generateAIAssistantResponse(
  userMessage: string, 
  context?: string,
  options: AIAssistantOptions = {}
): Promise<string> {
  const {
    maxRetries = 2,
    timeout = 15000,
    fallbackResponse = "Maaf, saya sedang mengalami gangguan. Silakan coba lagi dalam beberapa saat atau hubungi tim support untuk bantuan lebih lanjut."
  } = options;

  // Build context-aware prompt
  const systemPrompt = `Kamu adalah asisten AI untuk platform ketahanan pangan Indonesia. 
Kamu membantu petani, konsumen, dan stakeholder pertanian dengan:
1. Informasi harga komoditas pertanian
2. Prakiraan cuaca untuk pertanian
3. Tips bercocok tanam
4. Analisis pasar pertanian
5. Edukasi tentang ketahanan pangan

Berikan respons yang:
- Informatif dan akurat
- Ramah dan mudah dipahami
- Menggunakan bahasa Indonesia yang baik
- Fokus pada konteks pertanian Indonesia
- Praktis dan dapat diterapkan

${context ? `\nKonteks saat ini: ${context}` : ''}`;

  // Multiple fallback attempts 
  const fallbackAttempts = [
    // Attempt 1: FerDev API (primary)
    () => callFerDevAPI(systemPrompt, userMessage, 'gemini', timeout),
    // Attempt 2: FerDev API (retry)
    () => callFerDevAPI(systemPrompt, userMessage, 'gemini', timeout),
    // Attempt 3: Local rule-based fallback
    () => Promise.resolve(generateRuleBasedResponse(userMessage))
  ];

  for (let i = 0; i < fallbackAttempts.length; i++) {
    try {
      const result = await fallbackAttempts[i]();
      if (result && result.trim()) {
        return result.trim();
      }
    } catch (error) {
      console.error(`AI Assistant attempt ${i + 1} failed:`, error);
      
      // Jika bukan attempt terakhir, coba lagi
      if (i < fallbackAttempts.length - 1) {
        continue;
      }
    }
  }

  // Final fallback jika semua gagal
  return fallbackResponse;
}

async function callFerDevAPI(
  systemPrompt: string, 
  userMessage: string, 
  model: string, 
  timeout: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const apiKey = 'key-veng'; // Default key atau bisa dari env
    const fullPrompt = `${systemPrompt}\n\nPertanyaan: ${userMessage}`;
    
    const response = await fetch('https://api.ferdev.my.id/ai/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        prompt: fullPrompt
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`FerDev API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    const generatedText = result?.message;
    
    if (!generatedText) {
      throw new Error('No content generated from FerDev API');
    }

    return generatedText.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function generateRuleBasedResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // Rule-based responses untuk topik umum
  if (message.includes('harga') || message.includes('komoditas')) {
    return "🏷️ Untuk informasi harga komoditas terkini, Anda dapat melihat data real-time di halaman Data Harga. Harga dapat berfluktuasi berdasarkan kondisi pasar, cuaca, dan faktor supply-demand lainnya.";
  }
  
  if (message.includes('cuaca') || message.includes('prakiraan')) {
    return "🌤️ Informasi prakiraan cuaca tersedia di widget cuaca dashboard. Cuaca sangat mempengaruhi hasil pertanian, jadi pastikan untuk selalu memantau kondisi terkini untuk perencanaan tanam yang optimal.";
  }
  
  if (message.includes('tanam') || message.includes('bertani') || message.includes('pertanian')) {
    return "🌱 Untuk tips bercocok tanam, Anda dapat mengunjungi halaman Edukasi yang menyediakan artikel-artikel informatif tentang teknik pertanian modern, pemilihan bibit, dan manajemen lahan.";
  }
  
  if (message.includes('komunitas') || message.includes('diskusi')) {
    return "👥 Bergabunglah dengan komunitas petani di halaman Komunitas untuk berbagi pengalaman, bertanya, dan berdiskusi dengan sesama petani di seluruh Indonesia.";
  }
  
  if (message.includes('bantuan') || message.includes('help') || message.includes('support')) {
    return "🆘 Jika Anda memerlukan bantuan khusus, silakan kunjungi halaman Komunitas untuk bertanya kepada sesama pengguna, atau gunakan fitur pencarian untuk menemukan informasi yang Anda butuhkan.";
  }
  
  // Default response
  return "👋 Terima kasih telah menghubungi asisten ketahanan pangan! Saya dapat membantu Anda dengan informasi tentang harga komoditas, prakiraan cuaca, tips pertanian, dan lainnya. Silakan sampaikan pertanyaan Anda dengan lebih spesifik.";
}

// Export utility untuk get context dari dashboard
export function getDashboardContext(
  locationName?: string, 
  weatherCondition?: string, 
  topCommodity?: string
): string {
  const contextParts = [];
  
  if (locationName) {
    contextParts.push(`Lokasi: ${locationName}`);
  }
  
  if (weatherCondition) {
    contextParts.push(`Cuaca: ${weatherCondition}`);
  }
  
  if (topCommodity) {
    contextParts.push(`Komoditas trending: ${topCommodity}`);
  }
  
  return contextParts.join(', ');
}
