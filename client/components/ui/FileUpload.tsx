import React, { useRef, useState } from "react";
import { Camera, Cloud, X, Images } from "lucide-react";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
}

export function FileUpload({ onFilesChange, files }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const takePhotoRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    takePhotoRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onFilesChange([...files, ...newFiles].slice(0, 6));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="w-full">
      <div 
        onClick={handleClick}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files);
            onFilesChange([...files, ...newFiles].slice(0, 6));
          }
        }}
        className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-2 border-dashed transition-all duration-500 py-14 cursor-pointer
          ${isDragging 
            ? "border-blue-500 bg-blue-50/50 scale-[0.99]" 
            : "border-slate-200 bg-slate-50/30 hover:border-blue-300 hover:bg-blue-50/20"
          } dark:border-slate-800 dark:bg-slate-950/20`}
      >
        {/* Decorative Sky Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20 transition-transform duration-700 group-hover:scale-110">
          <Cloud className="absolute top-4 left-1/4 h-16 w-16 text-blue-400/40" />
          <Cloud className="absolute top-8 right-1/4 h-12 w-12 text-blue-300/30" />
          <Cloud className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-40 w-64 text-blue-500/10" />
        </div>

        <input 
          type="file" 
          ref={inputRef}
          className="hidden" 
          multiple 
          accept="image/*,video/*"
          onChange={handleChange}
        />

        <input 
          type="file" 
          ref={takePhotoRef}
          className="hidden" 
          accept="image/*"
          capture="environment"
          onChange={handleChange}
        />

        {/* Premium Button Container */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl dark:bg-slate-900 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12 group-hover:shadow-blue-500/20">
            <Camera className="h-10 w-10 text-blue-600" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95">
              <Images className="h-5 w-5" />
              <span className="text-base">Upload Evidence</span>
            </div>

            <div 
              onClick={handleCameraClick}
              className="flex items-center gap-3 rounded-2xl bg-white border-2 border-slate-200 px-8 py-4 font-bold text-slate-800 shadow-lg transition-all duration-300 hover:border-blue-400 hover:text-blue-600 hover:-translate-y-0.5 active:scale-95 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
            >
              <Camera className="h-5 w-5" />
              <span className="text-base">Take Photo</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Drag & drop or use your camera</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-2 font-bold">Max 6 files • High Quality Uploads</span>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {files.map((file, idx) => (
            <div key={idx} className="group relative aspect-square w-full overflow-hidden rounded-[1.25rem] border-2 border-white shadow-lg ring-1 ring-slate-200 transition-all hover:scale-105 dark:border-slate-900 dark:ring-slate-800">
              <img 
                src={URL.createObjectURL(file)} 
                alt="preview" 
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-red-600 active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

