import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "../../../../ui/button/Button";

interface FamiliarItem {
  id?: number;
  nombres: string;
  parentesco: string;
  edad?: number;
  estadoCivil?: string;
  instruccion?: string;
  ocupacion?: string;
  ingresos?: number;
  cedula?: string;
  telefono?: string;
  correo?: string;
}

interface FamiliaresFormProps {
  data: FamiliarItem[];
  onChange: (familares: FamiliarItem[]) => void;
  onValidate?: (isValid: boolean) => void;
}

const FamiliaresForm: React.FC<FamiliaresFormProps> = ({
  data,
  onChange,
  onValidate,
}) => {
  const [familiarForm, setFamiliarForm] = useState<FamiliarItem>({
    nombres: "",
    parentesco: "",
  });

  const handleAddFamiliar = () => {
    if (!familiarForm.nombres.trim() || !familiarForm.parentesco.trim()) {
      return;
    }

    const newFamiliares = [...data, familiarForm];
    onChange(newFamiliares);
    setFamiliarForm({ nombres: "", parentesco: "" });

    if (onValidate) {
      onValidate(newFamiliares.length > 0);
    }
  };

  const handleRemoveFamiliar = (index: number) => {
    const newFamiliares = data.filter((_, i) => i !== index);
    onChange(newFamiliares);

    if (onValidate) {
      onValidate(newFamiliares.length > 0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Agregar Miembro Familiar
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombres
            </label>
            <input
              type="text"
              value={familiarForm.nombres}
              onChange={(e) =>
                setFamiliarForm({ ...familiarForm, nombres: e.target.value })
              }
              placeholder="Nombres del familiar"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parentesco
            </label>
            <select
              value={familiarForm.parentesco}
              onChange={(e) =>
                setFamiliarForm({
                  ...familiarForm,
                  parentesco: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar parentesco</option>
              <option value="Padre">Padre</option>
              <option value="Madre">Madre</option>
              <option value="Hermano/a">Hermano/a</option>
              <option value="Hijo/a">Hijo/a</option>
              <option value="Cónyuge">Cónyuge</option>
              <option value="Abuelo/a">Abuelo/a</option>
              <option value="Tío/a">Tío/a</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Edad
            </label>
            <input
              type="number"
              value={familiarForm.edad || ""}
              onChange={(e) =>
                setFamiliarForm({
                  ...familiarForm,
                  edad: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="Edad"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ingresos Mensuales
            </label>
            <input
              type="number"
              value={familiarForm.ingresos || ""}
              onChange={(e) =>
                setFamiliarForm({
                  ...familiarForm,
                  ingresos: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cédula/Pasaporte
            </label>
            <input
              type="text"
              value={familiarForm.cedula || ""}
              onChange={(e) =>
                setFamiliarForm({
                  ...familiarForm,
                  cedula: e.target.value,
                })
              }
              placeholder="Cédula o Pasaporte"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={familiarForm.telefono || ""}
              onChange={(e) =>
                setFamiliarForm({
                  ...familiarForm,
                  telefono: e.target.value,
                })
              }
              placeholder="Número de teléfono"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={familiarForm.correo || ""}
              onChange={(e) =>
                setFamiliarForm({
                  ...familiarForm,
                  correo: e.target.value,
                })
              }
              placeholder="correo@ejemplo.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <Button
          onClick={handleAddFamiliar}
          variant="outline"
          className="w-full"
        >
          <Plus size={16} className="mr-2" />
          Agregar Familiar
        </Button>
      </div>

      {data.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Familiares Agregados ({data.length})
          </h4>
          {data.map((familiar, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {familiar.nombres}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {familiar.parentesco}
                  {familiar.edad && ` • ${familiar.edad} años`}
                  {familiar.ingresos && ` • $${familiar.ingresos}`}
                </p>
                {(familiar.cedula || familiar.telefono || familiar.correo) && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {familiar.cedula && `ID: ${familiar.cedula}`}
                    {familiar.cedula && familiar.telefono && " • "}
                    {familiar.telefono && `Tel: ${familiar.telefono}`}
                    {(familiar.cedula || familiar.telefono) && familiar.correo && " • "}
                    {familiar.correo && `${familiar.correo}`}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveFamiliar(index)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamiliaresForm;
