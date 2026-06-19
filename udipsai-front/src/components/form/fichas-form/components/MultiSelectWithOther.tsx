import React from "react";
import Label from "../../Label";
import Input from "../../input/InputField";
import Switch from "../../switch/Switch";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectWithOtherProps {
  label: string;
  value: string;
  options: MultiSelectOption[];
  onChange: (value: string) => void;
  otherPlaceholder?: string;
  gridColumns?: number;
}

const MultiSelectWithOther: React.FC<MultiSelectWithOtherProps> = ({
  label,
  value,
  options,
  onChange,
  otherPlaceholder = "Especifique...",
  gridColumns = 2,
}) => {
  const getValues = (): string[] => {
    return value ? value.split(",").filter(Boolean) : [];
  };

  const handleToggle = (optionValue: string, checked: boolean) => {
    const actuales = getValues();
    let nuevos: string[];

    if (checked) {
      if (optionValue === "otros") {
        nuevos = [...actuales, "otros:"];
      } else {
        nuevos = [...actuales, optionValue];
      }
    } else {
      nuevos = actuales.filter((item) => {
        if (optionValue === "otros") return !item.startsWith("otros");
        return item !== optionValue;
      });
    }

    onChange(nuevos.join(","));
  };

  const handleOtherChange = (text: string) => {
    const actuales = getValues().filter((item) => !item.startsWith("otros"));
    const nuevos = [...actuales, `otros:${text}`];
    onChange(nuevos.join(","));
  };

  const isChecked = (optionValue: string): boolean => {
    const values = getValues();
    if (optionValue === "otros") {
      return values.some((v) => v.startsWith("otros"));
    }
    return values.includes(optionValue);
  };

  const incluyeOtros = (): boolean => {
    return getValues().some((v) => v.startsWith("otros"));
  };

  const getOtrosTexto = (): string => {
    const item = getValues().find((v) => v.startsWith("otros:"));
    return item ? item.split(":")[1] || "" : "";
  };

  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className={`grid grid-cols-1 md:grid-cols-${gridColumns} gap-2 mt-2`}>
        {options.map((option) => (
          <Switch
            key={option.value}
            label={option.label}
            checked={isChecked(option.value)}
            onChange={(checked) => handleToggle(option.value, checked)}
          />
        ))}
      </div>
      {incluyeOtros() && (
        <div className="mt-3">
          <Input
            value={getOtrosTexto()}
            onChange={(e: any) => handleOtherChange(e.target.value)}
            placeholder={otherPlaceholder}
          />
        </div>
      )}
    </div>
  );
};

export default MultiSelectWithOther;