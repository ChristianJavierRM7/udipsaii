import React from "react";

interface SituacionLaboralFormProps {
  data: string;
  onChange: (value: string) => void;
  onValidate?: (isValid: boolean) => void;
}

const SituacionLaboralForm: React.FC<SituacionLaboralFormProps> = ({
  data,
  onChange,
  onValidate,
}) => {
  const handleChange = (value: string) => {
    onChange(value);
    if (onValidate) {
      onValidate(value.trim().length > 0);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción de la Situación Laboral
        </label>
        <textarea
          value={data || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Describa la situación laboral del paciente y su familia..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default SituacionLaboralForm;
