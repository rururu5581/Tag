
import React, { useState, useCallback, useRef } from 'react';
import { ActionButton } from './ActionButton';

interface InputAreaProps {
  onGenerate: (data: { text: string; file: File | null }) => void;
  onClear: () => void;
  isLoading: boolean;
}

enum InputType {
  Text = 'text',
  Audio = 'audio'
}

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, onClear, isLoading }) => {
  const [inputType, setInputType] = useState<InputType>(InputType.Text);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setText(''); // Clear text when a file is selected
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    setFile(null); // Clear file when text is typed
    setFileName('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onGenerate({ text, file });
  };
  
  const handleClear = () => {
    setText('');
    setFile(null);
    setFileName('');
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  const TabButton = useCallback(<T,>({ type, label }: { type: InputType; label: string }) => (
      <button
        type="button"
        onClick={() => setInputType(type)}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 ${
          inputType === type
            ? 'bg-white text-red-600 border-b-2 border-red-600'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {label}
      </button>
  ), [inputType]);


  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200">
      <form onSubmit={handleSubmit}>
        <div className="border-b border-slate-200 mb-4">
            <TabButton type={InputType.Text} label="テキスト入力" />
            <TabButton type={InputType.Audio} label="音声ファイル" />
        </div>

        {inputType === InputType.Text ? (
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="ここに企業情報、求人内容、または求職者との面談内容を貼り付けてください..."
            className="w-full h-48 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            disabled={isLoading}
          />
        ) : (
          <div className="flex items-center justify-center w-full">
            <label htmlFor="audio-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">クリックしてアップロード</span>またはドラッグ＆ドロップ</p>
                    <p className="text-xs text-slate-500">MP3, WAV, M4Aなど</p>
                    {fileName && <p className="text-sm text-green-600 mt-2">{fileName}</p>}
                </div>
                <input ref={fileInputRef} id="audio-upload" type="file" className="hidden" accept="audio/*" onChange={handleFileChange} disabled={isLoading} />
            </label>
          </div> 
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <ActionButton type="submit" variant="primary" disabled={isLoading || (!text && !file)}>
                {isLoading ? '生成中...' : 'タグを生成'}
            </ActionButton>
            <ActionButton type="button" variant="secondary" onClick={handleClear} disabled={isLoading}>
                クリア
            </ActionButton>
        </div>
      </form>
    </div>
  );
};
