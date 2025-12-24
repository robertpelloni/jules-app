
import { geminiProvider } from './lib/orchestration/providers/gemini';

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      models: [
        { name: 'models/gemini-1.5-flash', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-1.5-pro', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-2.0-flash', supportedGenerationMethods: ['generateContent'] }, // New model
        { name: 'models/embedding-001', supportedGenerationMethods: ['embedContent'] } // Should be filtered out
      ]
    }),
  })
) as jest.Mock;

async function test() {
  const models = await geminiProvider.listModels('fake-key');
  console.log('Models:', models);
}

test();
