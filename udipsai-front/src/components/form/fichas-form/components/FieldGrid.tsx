import React from "react";
import Input from "../../input/InputField";
import Label from "../../Label";

interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "email";
  placeholder?: string;
  colSpan?: number;
}

interface FieldGridProps {
  fields: FieldConfig[];
  data: Record<string, any>;
  onChange: (field: string, value: any) => void;
  columns?: number;
  prefix?: string;
}

const FieldGrid: React.FC<FieldGridProps> = ({
  fields,
  data,
  onChange,
  columns = 2,
  prefix,
}) => {
  const getGridClass = (colSpan?: number): string => {
    if (colSpan && colSpan > 1) {
      return `col-span-1 md:col-span-${colSpan}`;
    }
    return "";
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {fields.map((field) => (
        <div key={field.key} className={getGridClass(field.colSpan)}>
          <Label>{field.label}</Label>
          <Input
            type={field.type || "text"}
            value={data[field.key] ?? ""}
            onChange={(e: any) => {
              const value =
                field.type === "number"
                  ? Number(e.target.value)
                  : e.target.value;
              onChange(field.key, value);
            }}
            placeholder={field.placeholder}
          />
        </div>
      ))}
    </div>
  );
};

export default FieldGrid;