import React from 'react';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
  disabled?: boolean;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onSelect, disabled }) => {
  const ratios = [
    { value: AspectRatio.SQUARE, label: '1:1', desc: 'Квадрат' },
    { value: AspectRatio.PORTRAIT, label: '3:4', desc: 'Портрет' },
    { value: AspectRatio.LANDSCAPE, label: '4:3', desc: 'Альбом' },
    { value: AspectRatio.MOBILE_PORTRAIT, label: '9:16', desc: 'История' },
    { value: AspectRatio.WIDE, label: '16:9', desc: 'Кино' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {ratios.map((ratio) => (
        <button
          key={ratio.value}
          onClick={() => onSelect(ratio.value)}
          disabled={disabled}
          className={`
            relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
            ${selected === ratio.value 
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
              : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="text-sm font-bold">{ratio.label}</span>
          <span className="text-xs opacity-70 mt-1">{ratio.desc}</span>
          
          {/* Visual indicator of ratio */}
          <div 
            className={`mt-2 border rounded-sm ${selected === ratio.value ? 'border-indigo-500' : 'border-slate-600'}`}
            style={{
               width: '24px',
               height: ratio.value === AspectRatio.SQUARE ? '24px' :
                       ratio.value === AspectRatio.PORTRAIT ? '32px' :
                       ratio.value === AspectRatio.LANDSCAPE ? '18px' :
                       ratio.value === AspectRatio.MOBILE_PORTRAIT ? '42px' : '14px'
            }}
          />
        </button>
      ))}
    </div>
  );
};

export default AspectRatioSelector;