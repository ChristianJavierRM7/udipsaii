import React from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, User } from "lucide-react";

interface Familiar {
  id?: number | null;
  relacion: string;
  nombresApellidos: string;
  edad: number;
  estadoCivil: string;
  instruccion: string;
  ocupacion: string;
  ingresoMensual: number;
  cedula?: string;
  numeroTelefono?: string;
  correoElectronico?: string;
}

interface ConformacionFamiliarProps {
  data: Familiar[];
  onChange?: (
    index: number,
    field: keyof Familiar,
    value: string | number
  ) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  onValidate?: (isValid: boolean, errors: string[]) => void;
  readOnly?: boolean;
}

const validateFamiliar = (familiar: Familiar): string[] => {
  const errors: string[] = [];
  if (!familiar.relacion || familiar.relacion.trim() === "") {
    errors.push("Relación es requerida");
  }
  if (!familiar.nombresApellidos || familiar.nombresApellidos.trim() === "") {
    errors.push("Nombres y apellidos es requerido");
  }
  if (!familiar.edad || familiar.edad <= 0) {
    errors.push("Edad debe ser mayor a 0");
  }
  return errors;
};

const ConformacionFamiliar: React.FC<ConformacionFamiliarProps> = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onValidate,
  readOnly = false,
}) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const relaciones = ["Padre", "Madre", "Hermano", "Hermana", "Abuelo", "Abuela", "Tío", "Tía", "Otro"];


  React.useEffect(() => {
    if (!onValidate) return;

    if (readOnly) {
      onValidate(true, []);
      return;
    }

    if (data.length === 0) {
      onValidate(false, ["No hay familiares registrados"]);
      return;
    }

    const allErrors: string[] = [];

    data.forEach((familiar, index) => {
      const errors = validateFamiliar(familiar);

      if (errors.length > 0) {
        allErrors.push(
          `Familiar #${index + 1}: ${errors.join(", ")}`
        );
      }
    });

    onValidate(allErrors.length === 0, allErrors);

  }, [data, onValidate, readOnly]);

  return (
    <div className="space-y-4">

      {/* 🔹 HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="p-3 rounded-xl bg-brand-50 text-brand-500 dark:bg-gray-800 dark:text-gray-300">
            <User size={20} />
          </div>

          <h2 className="text-lg font-bold uppercase text-gray-800 dark:text-gray-100">
            2. CONFORMACIÓN FAMILIAR
          </h2>
        </div>

        {!readOnly && onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-brand-400 text-white px-4 py-2 rounded-xl hover:bg-brand-500 transition-all"
          >
            <Plus size={18} />
            Agregar
          </button>
        )}
      </div>

      {/* 🔹 LISTA */}
      {data.map((familiar, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={index} className="space-y-2">

            {/* 🔹 HEADER ACORDEÓN */}
            <div
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className={`flex justify-between items-center p-4 cursor-pointer rounded-2xl border-2 transition-all duration-500
              ${isOpen
                  ? "border-brand-100 bg-brand-50/20 dark:border-gray-600 dark:bg-gray-800 scale-[1.01]"
                  : "border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:border-gray-300"
                }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg transition-all ${isOpen
                    ? "bg-brand-400 text-white rotate-12"
                    : "bg-brand-50 text-brand-500 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                >
                  <User size={16} />
                </div>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  Familiar #{index + 1}
                </h3>
              </div>

              <div className="flex items-center gap-4">
                {isOpen ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}

                {!readOnly && onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(index);
                    }}
                    className="flex items-center gap-1 text-red-500 text-sm hover:underline"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {/* 🔹 BODY */}
            {isOpen && (
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-4 animate-in slide-in-from-top-2">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* RELACIÓN */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      RELACIÓN
                    </label>

                    <select
                      value={
                        familiar.relacion === ""
                          ? ""
                          : relaciones.includes(familiar.relacion)
                            ? familiar.relacion
                            : "Otro"
                      }
                      disabled={readOnly}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "Otro") {
                          onChange && onChange(index, "relacion", "Otro");
                        } else {
                          onChange && onChange(index, "relacion", value);
                        }
                      }}
                      className="border p-2 rounded w-full text-sm text-gray-700 
             dark:text-gray-200 dark:bg-gray-800
             focus:outline-none focus:ring-2 focus:ring-brand-400"
                    >
                      <option value="">Seleccione</option>
                      {relaciones.map((rel) => (
                        <option key={rel} value={rel}>
                          {rel}
                        </option>
                      ))}
                    </select>

                    {/* INPUT SI ES OTRO */}
                    {familiar.relacion !== "" &&
                      (familiar.relacion === "Otro" ||
                        !relaciones.includes(familiar.relacion)) && (
                        <input
                          placeholder="Especifique relación"
                          value={
                            familiar.relacion === "Otro" ? "" : familiar.relacion
                          }
                          disabled={readOnly}
                          onChange={(e) =>
                            onChange && onChange(index, "relacion", e.target.value)
                          }
                          className="border p-2 rounded mt-2"
                        />
                      )}
                  </div>

                  {/* NOMBRES */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">
                      NOMBRES Y APELLIDOS
                    </label>
                    <input
                      placeholder="Nombre completo"
                      value={familiar.nombresApellidos || ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange && onChange(index, "nombresApellidos", e.target.value)
                      }
                      className="border p-2 rounded"
                    />
                  </div>

                  {/* EDAD */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">
                      EDAD
                    </label>
                    <input
                      type="number"
                      value={familiar.edad ?? ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange && onChange(
                          index,
                          "edad",
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      className="border p-2 rounded"
                    />
                  </div>

                  {/* ESTADO CIVIL */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      EST. CIVIL
                    </label>
                    <select
                      value={familiar.estadoCivil || ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange && onChange(index, "estadoCivil", e.target.value)
                      }
                      className="border p-2 rounded w-full text-sm text-gray-700 
             dark:text-gray-200 dark:bg-gray-800
             focus:outline-none focus:ring-2 focus:ring-brand-400"
                    >
                      <option value="">Seleccione</option>
                      <option value="Soltero/a">Soltero/a</option>
                      <option value="Casado/a">Casado/a</option>
                      <option value="Divorciado/a">Divorciado/a</option>
                      <option value="Viudo/a">Viudo/a</option>
                      <option value="Unión de Hecho">Unión de Hecho</option>
                    </select>
                  </div>

                  {/* INSTRUCCIÓN */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">
                      INSTRUCCIÓN
                    </label>
                    <input
                      placeholder="Primaria, Secundaria..."
                      value={familiar.instruccion || ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange && onChange(index, "instruccion", e.target.value)
                      }
                      className="border p-2 rounded"
                    />
                  </div>

                  {/* OCUPACIÓN */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">
                      OCUPACIÓN
                    </label>
                    <input
                      placeholder="Trabajo actual"
                      value={familiar.ocupacion || ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange && onChange(index, "ocupacion", e.target.value)
                      }
                      className="border p-2 rounded"
                    />
                  </div>

                  {/* INGRESO MENSUAL */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      INGRESO MENSUAL
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={familiar.ingresoMensual ?? ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange && onChange(
                          index,
                          "ingresoMensual",
                          e.target.value === "" ? 0 : parseFloat(e.target.value)
                        )
                      }
                      className="border p-2 rounded w-full 
               text-sm text-gray-700 
               dark:text-gray-200 dark:bg-gray-800
               focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>

                  {/* CÉDULA */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      CÉDULA
                    </label>
                    <input
                      placeholder="Cédula de identidad"
                      value={familiar.cedula || ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange && onChange(index, "cedula", e.target.value)
                      }
                      className="border p-2 rounded w-full 
               text-sm text-gray-700 
               dark:text-gray-200 dark:bg-gray-800
               focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>

                  {/* TELÉFONO */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      TELÉFONO
                    </label>
                    <input
                      placeholder="Número de teléfono"
                      value={familiar.numeroTelefono || ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange && onChange(index, "numeroTelefono", e.target.value)
                      }
                      className="border p-2 rounded w-full 
               text-sm text-gray-700 
               dark:text-gray-200 dark:bg-gray-800
               focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>

                  {/* CORREO ELECTRÓNICO */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      CORREO ELECTRÓNICO
                    </label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={familiar.correoElectronico || ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange && onChange(index, "correoElectronico", e.target.value)
                      }
                      className="border p-2 rounded w-full 
               text-sm text-gray-700 
               dark:text-gray-200 dark:bg-gray-800
               focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConformacionFamiliar;