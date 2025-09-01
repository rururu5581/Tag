
import React, { useCallback, useState } from 'react';
import type { GeneratedTags, TagCategory } from '../types';
import { TAG_CATEGORIES } from '../constants';
import { ActionButton } from './ActionButton';
import { LoadingSpinner } from './LoadingSpinner';

interface TagDisplayProps {
  tags: GeneratedTags | null;
  isLoading: boolean;
}

const convertToCSV = (tags: GeneratedTags): string => {
  let csvContent = "Category,Tag\n";
  Object.keys(tags).forEach(key => {
    const categoryKey = key as TagCategory;
    const categoryName = TAG_CATEGORIES[categoryKey].name;
    tags[categoryKey].forEach(tag => {
      const sanitizedTag = `"${tag.replace(/"/g, '""')}"`;
      csvContent += `${categoryName},${sanitizedTag}\n`;
    });
  });
  return csvContent;
};

const copyToClipboard = async (text: string, onCopy: () => void) => {
  try {
    await navigator.clipboard.writeText(text);
    onCopy();
  } catch (err) {
    console.error('Failed to copy text: ', err);
    alert('クリップボードへのコピーに失敗しました。');
  }
};


export const TagDisplay: React.FC<TagDisplayProps> = ({ tags, isLoading }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopy = useCallback(() => {
    if (!tags) return;
    const textToCopy = Object.keys(tags).map(key => {
        const categoryKey = key as TagCategory;
        const categoryName = TAG_CATEGORIES[categoryKey].name;
        const tagList = tags[categoryKey].join(', ');
        return `${categoryName}: ${tagList}`;
    }).join('\n');
    
    copyToClipboard(textToCopy, () => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    });
  }, [tags]);

  const handleDownloadCSV = useCallback(() => {
    if (!tags) return;
    const csvData = convertToCSV(tags);
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tags.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [tags]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 min-h-[200px] flex flex-col justify-center items-center text-center">
        <LoadingSpinner />
        <p className="mt-4 text-slate-600 font-semibold">AIがタグを生成中です...</p>
        <p className="text-sm text-slate-500">音声ファイルの場合は少し時間がかかることがあります。</p>
      </div>
    );
  }

  if (!tags) {
    return null; // Don't render anything if there are no tags and not loading
  }

  const hasTags = Object.values(tags).some(arr => arr.length > 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-lg font-bold text-slate-800">生成されたタグ</h2>
        {hasTags && (
          <div className="flex gap-2">
            <ActionButton variant="secondary" size="sm" onClick={handleCopy}>
              {copyStatus === 'copied' ? 'コピー完了!' : 'コピー'}
            </ActionButton>
            <ActionButton variant="secondary" size="sm" onClick={handleDownloadCSV}>
              CSVダウンロード
            </ActionButton>
          </div>
        )}
      </div>

      {!hasTags ? (
         <div className="text-center py-8 text-slate-500">
            <p>関連するタグが見つかりませんでした。</p>
            <p className="text-sm">入力内容を変えて再度お試しください。</p>
         </div>
      ) : (
        <div className="space-y-6">
            {(Object.keys(tags) as TagCategory[]).map((category) => (
                tags[category].length > 0 && (
                <div key={category}>
                    <h3 className={`text-md font-semibold mb-2 ${TAG_CATEGORIES[category].color.replace('bg-', 'text-').replace('-100', '-700')}`}>
                    {TAG_CATEGORIES[category].name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                    {tags[category].map((tag, index) => (
                        <span key={index} className={`px-3 py-1 text-sm font-medium rounded-full ${TAG_CATEGORIES[category].color}`}>
                        {tag}
                        </span>
                    ))}
                    </div>
                </div>
                )
            ))}
        </div>
      )}
    </div>
  );
};
