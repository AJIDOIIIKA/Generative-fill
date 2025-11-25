import React, { useState, useEffect } from 'react';
import { AspectRatio, ProcessingState } from './types';
import { generateExtendedImage } from './services/geminiService';
import Button from './components/Button';
import AspectRatioSelector from './components/AspectRatioSelector';
import ImageUploader from './components/ImageUploader';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [prompt, setPrompt] = useState<string>('');
  
  const [processing, setProcessing] = useState<ProcessingState>({
    isLoading: false,
    error: null,
  });

  // Convert File to Base64 for API
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSelect = (file: File) => {
    setOriginalImage(file);
    setGeneratedImageUrl(null); // Reset result on new upload
    const objectUrl = URL.createObjectURL(file);
    setOriginalImagePreview(objectUrl);
  };

  useEffect(() => {
    return () => {
      if (originalImagePreview) URL.revokeObjectURL(originalImagePreview);
    };
  }, [originalImagePreview]);

  const handleGenerate = async () => {
    if (!originalImage) return;

    setProcessing({ isLoading: true, error: null });
    
    try {
      const base64Data = await fileToBase64(originalImage);
      const resultImage = await generateExtendedImage(
        base64Data,
        originalImage.type,
        prompt,
        selectedRatio
      );
      
      setGeneratedImageUrl(resultImage);
    } catch (err: any) {
      setProcessing({ 
        isLoading: false, 
        error: err.message || "Ошибка генерации. Попробуйте еще раз." 
      });
    } finally {
      setProcessing(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `gemini-fill-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                 <line x1="16" y1="5" x2="22" y2="5" />
                 <line x1="19" y1="2" x2="19" y2="8" />
                 <circle cx="9" cy="9" r="2" />
                 <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
              Gemini ArtFill
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 1. Upload */}
            <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs text-slate-300">1</span>
                Исходное фото
              </h2>
              <ImageUploader 
                onImageSelected={handleImageSelect} 
                currentImage={originalImagePreview} 
              />
            </section>

            {/* 2. Aspect Ratio */}
            <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs text-slate-300">2</span>
                Формат
              </h2>
              <AspectRatioSelector 
                selected={selectedRatio} 
                onSelect={setSelectedRatio}
                disabled={processing.isLoading}
              />
            </section>

            {/* 3. Prompt (Optional) */}
            <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-2 text-slate-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs text-slate-300">3</span>
                Промпт (Опционально)
              </h2>
              <p className="text-xs text-slate-400 mb-3">Опишите, что должно быть на расширенном фоне. Если пусто, ИИ решит сам.</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Пример: футуристический ночной город, неоновые огни..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-24"
                disabled={processing.isLoading}
              />
            </section>

            {/* Action Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={!originalImage || processing.isLoading}
              isLoading={processing.isLoading}
              className="w-full py-4 text-lg shadow-lg shadow-indigo-500/20"
            >
              {processing.isLoading ? 'Генерация...' : 'Заполнить фон'}
            </Button>

            {processing.error && (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
                {processing.error}
              </div>
            )}
          </div>

          {/* Right Panel: Result */}
          <div className="lg:col-span-8">
            <div className="bg-slate-800/30 rounded-3xl border border-slate-700/50 min-h-[600px] flex flex-col items-center justify-center p-8 relative overflow-hidden backdrop-blur-sm">
              
              {/* Background grid pattern */}
              <div className="absolute inset-0 opacity-10" 
                style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
              </div>

              {!generatedImageUrl ? (
                <div className="text-center z-10 max-w-md">
                   {processing.isLoading ? (
                     <div className="flex flex-col items-center animate-pulse">
                       <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="text-indigo-300 text-lg font-medium">Создаем магию...</p>
                       <p className="text-slate-500 mt-2">Это может занять несколько секунд</p>
                     </div>
                   ) : (
                     <>
                      <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-slate-300 mb-2">Здесь появится результат</h3>
                      <p className="text-slate-500">Загрузите фото, выберите формат и нажмите кнопку генерации</p>
                     </>
                   )}
                </div>
              ) : (
                <div className="z-10 w-full flex flex-col items-center">
                  <div className="relative rounded-lg overflow-hidden shadow-2xl border border-slate-600/50 bg-black/40 mb-6">
                    <img 
                      src={generatedImageUrl} 
                      alt="Generated" 
                      className="max-h-[70vh] w-auto object-contain"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                     <Button onClick={handleDownload} variant="primary">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                       </svg>
                       Скачать результат
                     </Button>
                     <Button onClick={() => setGeneratedImageUrl(null)} variant="secondary">
                       Сбросить
                     </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;