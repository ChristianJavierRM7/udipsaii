import React from "react";

export interface NumberFieldConfig {
  key: string;
  label: string;
}

interface NumberInputGroupProps {
  fields: NumberFieldConfig[];
  data: Record<string, number>;
  onChange: (field: string, value: number) => void;
  prefix?: string;
  suffix?: string;
  columns?: number;
}

const NumberInputGroup: React.FC<NumberInputGroupProps> = ({
  fields,
  data,
  onChange,
  prefix = "$",
  suffix = "",
  columns = 2,
}) => {
  const total = fields.reduce((acc, field) => {
    return acc + (Number(data[field.key]) || 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              {field.label}
            </label>
            <div className="relative">
              {prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {prefix}
                </span>
              )}
              <input
                type="number"
                step="0.01"
                min="0"
                value={data[field.key] ?? 0}
                onChange={(e) =>
                  onChange(field.key, parseFloat(e.target.value) || 0)
                }
                className={`w-full px-4 py-2 border rounded-lg ${
                  prefix ? "pl-7" : ""
                }`}
              />
              {suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total
          </span>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {prefix}
            {total.toFixed(2)}
            {suffix}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NumberInputGroup;