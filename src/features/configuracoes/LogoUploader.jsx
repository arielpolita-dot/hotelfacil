import { useRef, useState } from 'react';
import { Upload, Image } from 'lucide-react';

export function LogoUploader({ logoUrl, onFileSelected, logoPreview }) {
  const fileInputRef = useRef(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Image className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Logotipo</h3>
      </div>
      <div className="flex items-center gap-6">
        {/* Preview */}
        <div
          className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden cursor-pointer hover:border-blue-400 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
          ) : (
            <div className="text-center">
              <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Clique para<br />adicionar logo</p>
            </div>
          )}
        </div>
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
          >
            <Upload className="h-4 w-4" />
            {logoPreview ? 'Alterar logotipo' : 'Enviar logotipo'}
          </button>
          <p className="text-xs text-slate-400 mt-2">PNG, JPG ou SVG. Maximo 2MB.</p>
          <p className="text-xs text-slate-400">Recomendado: 200x200px ou maior.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileSelected}
        />
      </div>
    </div>
  );
}
