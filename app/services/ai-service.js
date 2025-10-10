import { OPENAI_CONFIG } from '../config.js';

export class AIService {
    static async transcribeAudio(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob);
            formData.append('model', 'whisper-1');
            
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Transcription failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error('Transcription error:', error);
            throw error;
        }
    }

    static async analyzeImage(imageUrl) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
                },
                body: JSON.stringify({
                    model: OPENAI_CONFIG.modelVersion,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Please describe this image in detail and extract any visible text.'
                                },
                                {
                                    type: 'image_url',
                                    image_url: imageUrl
                                }
                            ]
                        }
                    ],
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`Image analysis failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Image analysis error:', error);
            throw error;
        }
    }

    static async generateDescription(mediaUrls, mediaTypes) {
        try {
            let context = 'Based on the following media analysis, generate a cohesive story description:\n\n';
            
            for (let i = 0; i < mediaUrls.length; i++) {
                const url = mediaUrls[i];
                const type = mediaTypes[i];
                
                if (type.startsWith('image/')) {
                    const imageAnalysis = await this.analyzeImage(url);
                    context += `Image ${i + 1}: ${imageAnalysis}\n\n`;
                } else if (type.startsWith('audio/')) {
                    const transcription = await this.transcribeAudio(url);
                    context += `Audio ${i + 1} Transcription: ${transcription}\n\n`;
                }
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'user',
                            content: context + '\nPlease generate a coherent story description based on the above media analysis.'
                        }
                    ],
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`Description generation failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Description generation error:', error);
            throw error;
        }
    }
}