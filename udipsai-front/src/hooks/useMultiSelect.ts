import { useState, useCallback } from "react";

interface UseMultiSelectReturn {
  values: string[];
  isChecked: (optionValue: string) => boolean;
  toggle: (optionValue: string) => void;
  setValues: (values: string[]) => void;
  includesOther: boolean;
  getOtherText: () => string;
  setOtherText: (text: string) => void;
}

export const useMultiSelect = (
  initialValue: string = ""
): UseMultiSelectReturn => {
  const getValues = useCallback((value: string): string[] => {
    return value ? value.split(",").filter(Boolean) : [];
  }, []);

  const [values, setValuesState] = useState<string[]>(getValues(initialValue));

  const isChecked = useCallback(
    (optionValue: string): boolean => {
      if (optionValue === "otros") {
        return values.some((v) => v.startsWith("otros"));
      }
      return values.includes(optionValue);
    },
    [values]
  );

  const toggle = useCallback(
    (optionValue: string) => {
      let nuevos: string[];

      if (isChecked(optionValue)) {
        nuevos = values.filter((item) => {
          if (optionValue === "otros") return !item.startsWith("otros");
          return item !== optionValue;
        });
      } else {
        if (optionValue === "otros") {
          nuevos = [...values, "otros:"];
        } else {
          nuevos = [...values, optionValue];
        }
      }

      setValuesState(nuevos);
    },
    [values, isChecked]
  );

  const setValues = useCallback((newValues: string[]) => {
    setValuesState(newValues);
  }, []);

  const includesOther = values.some((v) => v.startsWith("otros"));

  const getOtherText = useCallback((): string => {
    const item = values.find((v) => v.startsWith("otros:"));
    return item ? item.split(":")[1] || "" : "";
  }, [values]);

  const setOtherText = useCallback(
    (text: string) => {
      const sinOtros = values.filter((item) => !item.startsWith("otros"));
      const nuevos = [...sinOtros, `otros:${text}`];
      setValuesState(nuevos);
    },
    [values]
  );

  return {
    values,
    isChecked,
    toggle,
    setValues,
    includesOther,
    getOtherText,
    setOtherText,
  };
};

export const multiSelectToString = (values: string[]): string => {
  return values.join(",");
};

export const multiSelectFromString = (value: string): string[] => {
  return value ? value.split(",").filter(Boolean) : [];
};