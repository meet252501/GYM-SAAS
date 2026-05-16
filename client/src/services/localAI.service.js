import { pipeline, env } from '@xenova/transformers';

// Configuration for local-only execution
env.allowLocalModels = true;
env.useBrowserCache = true;

class LocalGymAI {
    constructor() {
        this.generator = null;
        this.modelName = 'Xenova/Qwen2.5-0.5B-Instruct'; // ~400MB INT4
        this.isLoading = false;
    }

    async initialize(onProgress) {
        if (this.generator) return;
        this.isLoading = true;
        try {
            this.generator = await pipeline('text-generation', this.modelName, {
                progress_callback: onProgress
            });
        } catch (error) {
            console.error('Local AI Init Error:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    async chat(prompt, history = []) {
        if (!this.generator) throw new Error("Local AI not initialized");

        const systemPrompt = `You are the GymCore Neural Coach. You specialize in gym training, biomechanics, and nutrition. 
        Keep responses concise, technical, and motivating. Limit to 3 sentences. 
        Current Context: Local Basement Mode.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: prompt }
        ];

        // Format for Qwen-style chat
        const formattedPrompt = messages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n') + '\n<|im_start|>assistant\n';

        const output = await this.generator(formattedPrompt, {
            max_new_tokens: 128,
            temperature: 0.7,
            repetition_penalty: 1.1,
            do_sample: true
        });

        return output[0].generated_text.split('<|im_start|>assistant\n').pop().replace('<|im_end|>', '').trim();
    }
}

export const localAI = new LocalGymAI();
