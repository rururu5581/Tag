
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { TagDisplay } from './components/TagDisplay';
import { generateTagsFromText, generateTagsFromAudio } from './services/geminiService';
import type { GeneratedTags } from './types';

const App: React.FC = () => {
  const [generatedTags, setGeneratedTags] = useState<GeneratedTags | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (data: { text: string; file: File | null }) => {
    setIsLoading(true);
    setError(null);
    setGeneratedTags(null);

    try {
      let tags: GeneratedTags;
      if (data.file) {
        tags = await generateTagsFromAudio(data.file);
      } else if (data.text) {
        tags = await generateTagsFromText(data.text);
      } else {
        setError("テキストを入力するか、音声ファイルをアップロードしてください。");
        setIsLoading(false);
        return;
      }
      setGeneratedTags(tags);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'タグの生成中に不明なエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setGeneratedTags(null);
    setError(null);
    setIsLoading(false);
  }, []);


  return (
    <div className="min-h-screen font-sans text-slate-800">
      <Header />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        <div className="space-y-8">
          <InputArea onGenerate={handleGenerate} onClear={handleClear} isLoading={isLoading} />
          
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-100 p-4 text-center text-red-700">
              <p className="font-semibold">エラーが発生しました</p>
              <p>{error}</p>
            </div>
          )}

          <TagDisplay tags={generatedTags} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default App;
