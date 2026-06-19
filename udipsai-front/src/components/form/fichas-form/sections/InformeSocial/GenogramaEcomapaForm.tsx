import React, { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";

interface GenogramaEcomapaFormProps {
  genogramaUrl?: string;
  ecomapaUrl?: string;
  onGenogramaChange: (file: File | null) => void;
  onEcomapaChange: (file: File | null) => void;
}

const GenogramaEcomapaForm: React.FC<GenogramaEcomapaFormProps> = ({
  genogramaUrl,
  ecomapaUrl,
  onGenogramaChange,
  onEcomapaChange,
}) => {
  const [genogramaPreview, setGenogramaPreview] = useState<string | null>(
    genogramaUrl || null
  );
  const [ecomapaPreview, setEcomapaPreview] = useState<string | null>(
    ecomapaUrl || null
  );

  useEffect(() => {
    if (genogramaUrl) {
      setGenogramaPreview(genogramaUrl);
    }
  }, [genogramaUrl]);

  useEffect(() => {
    if (ecomapaUrl) {
      setEcomapaPreview(ecomapaUrl);
    }
  }, [ecomapaUrl]);

  const handleGenogramaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onGenogramaChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGenogramaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEcomapaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onEcomapaChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEcomapaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Genograma */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Genograma
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            {genogramaPreview ? (
              <div className="space-y-3">
                <img
                  src={genogramaPreview}
                  alt="Genograma"
                  className="mx-auto max-h-40 max-w-full"
                />
                <button
                  onClick={() => {
                    setGenogramaPreview(null);
                    onGenogramaChange(null);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center justify-center gap-1"
                >
                  <X size={14} />
                  Eliminar imagen
                </button>
              </div>
            ) : (
              <label className="cursor-pointer space-y-2">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clic para cargar genograma
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGenogramaChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Ecomapa */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ecomapa
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            {ecomapaPreview ? (
              <div className="space-y-3">
                <img
                  src={ecomapaPreview}
                  alt="Ecomapa"
                  className="mx-auto max-h-40 max-w-full"
                />
                <button
                  onClick={() => {
                    setEcomapaPreview(null);
                    onEcomapaChange(null);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center justify-center gap-1"
                >
                  <X size={14} />
                  Eliminar imagen
                </button>
              </div>
            ) : (
              <label className="cursor-pointer space-y-2">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clic para cargar ecomapa
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEcomapaChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenogramaEcomapaForm;
