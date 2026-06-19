import React from "react";
import Switch from "../../switch/Switch";

export interface SwitchGridOption {
  value: string;
  label: string;
}

interface SwitchGridProps {
  options: SwitchGridOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
  label?: string;
}

const SwitchGrid: React.FC<SwitchGridProps> = ({
  options,
  value,
  onChange,
  columns = 2,
  label,
}) => {
  const getValues = (): string[] => {
    return value ? value.split(",").filter(Boolean) : [];
  };

  const handleToggle = (optionValue: string, checked: boolean) => {
    const actuales = getValues();
    let nuevos: string[];

    if (checked) {
      nuevos = [...actuales, optionValue];
    } else {
      nuevos = actuales.filter((item) => item !== optionValue);
    }

    onChange(nuevos.join(","));
  };

  const isChecked = (optionValue: string): boolean => {
    return getValues().includes(optionValue);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-2`}>
        {options.map((option) => (
          <Switch
            key={option.value}
            label={option.label}
            checked={isChecked(option.value)}
            onChange={(checked) => handleToggle(option.value, checked)}
          />
        ))}
      </div>
    </div>
  );
};

export default SwitchGrid;