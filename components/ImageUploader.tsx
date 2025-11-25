import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  currentImage: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, currentImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      
      {!currentImage ? (
        <div 
          onClick={triggerUpload}
          className="border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/5 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 h-64 w-full"
        >
          <div className="bg-slate-800 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-200 font-medium text-lg">Загрузите изображение</p>
          <p className="text-slate-500 text-sm mt-2">JPG, PNG или WebP</p>
        </div>
      ) : (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/50">
           <img 
             src={currentImage} 
             alt="Original" 
             className="w-full h-auto max-h-[400px] object-contain mx-auto"
           />
           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button 
               onClick={triggerUpload}
               className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium hover:bg-slate-100 transition-colors"
             >
               Изменить фото
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;