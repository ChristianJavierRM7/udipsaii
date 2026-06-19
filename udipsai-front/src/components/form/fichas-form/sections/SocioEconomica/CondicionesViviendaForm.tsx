import React from "react";
import Label from "../../../Label";
import Input from "../../../input/InputField";
import Select from "../../../Select";
import Switch from "../../../switch/Switch";
import { toast } from "react-toastify";

interface CondicionesViviendaFormProps {
    data: {
        tipoTenencia: string;
        materialParedes: string;
        materialPiso: string;
        materialTecho: string;

        numeroCuartos: number;
        numeroDormitorios: number;
        numeroCamas: number;
        numeroSanitarios: number;

        tipoSanitario: string;
        procedenciaAgua: string;
        detalleElectricidad: string;

        tieneElectricidad?: boolean;
        numeroFocos?: number;
        otrosDetallesElectricidad?: string;
        tieneInternet?: boolean;
        tieneDucha?: boolean;
    };
    onChange: (field: string, value: any) => void;
    onValidate?: (isValid: boolean, errors: string[]) => void;
}

const validateCondicionesVivienda = (data: CondicionesViviendaFormProps["data"]): string[] => {
  const errors: string[] = [];
  if (!data.tipoTenencia || data.tipoTenencia.trim() === "") {
    errors.push("Tipo de tenencia es requerido");
  }
  if (!data.materialParedes || data.materialParedes.trim() === "") {
    errors.push("Material de paredes es requerido");
  }
  if (!data.materialPiso || data.materialPiso.trim() === "") {
    errors.push("Material de piso es requerido");
  }
  if (!data.materialTecho || data.materialTecho.trim() === "") {
    errors.push("Material de techo es requerido");
  }
  if (data.numeroCuartos === undefined || data.numeroCuartos < 0) {
    errors.push("Número de cuartos es requerido");
  }
  if (data.numeroDormitorios === undefined || data.numeroDormitorios < 0) {
    errors.push("Número de dormitorios es requerido");
  }
  if (data.numeroCamas === undefined || data.numeroCamas < 0) {
    errors.push("Número de camas es requerido");
  }
  if (data.numeroSanitarios === undefined || data.numeroSanitarios < 0) {
    errors.push("Número de sanitarios es requerido");
  }
  if (!data.tipoSanitario || data.tipoSanitario.trim() === "") {
    errors.push("Tipo de sanitario es requerido");
  }
  if (!data.procedenciaAgua || data.procedenciaAgua.trim() === "") {
    errors.push("Procedencia de agua es requerida");
  }
  return errors;
};

const CondicionesViviendaForm: React.FC<CondicionesViviendaFormProps> = ({ data, onChange, onValidate }) => {
    const lastValidationRef = React.useRef("");

    React.useEffect(() => {
        if (onValidate) {
            const errors = validateCondicionesVivienda(data);
            const serialized = JSON.stringify(errors);
            if (serialized !== lastValidationRef.current) {
                lastValidationRef.current = serialized;
                onValidate(errors.length === 0, errors);
            }
        }
    }, [data, onValidate]);

    const handleMultiChange = (field: string, value: string, checked: boolean) => {
        const actuales = getValues(field);

        let nuevos;

        if (checked) {
            if (value === "otros") {
                nuevos = [...actuales, "otros:"];
            } else {
                nuevos = [...actuales, value];
            }
        } else {
            nuevos = actuales.filter(item =>
                value === "otros"
                    ? !item.startsWith("otros")
                    : item !== value
            );
        }

        onChange(field, nuevos.join(","));
    };
    const handleOtrosChange = (field: string, text: string) => {
        const actuales = getValues(field).filter(item => !item.startsWith("otros"));
        const nuevos = [...actuales, `otros:${text}`];

        onChange(field, nuevos.join(","));
    };

    const getValues = (field: string) => {
        return data[field as keyof typeof data]
            ? (data[field as keyof typeof data] as string).split(",")
            : [];
    };

    const incluyeOtros = (field: string) => {
        return getValues(field).some(item => item.startsWith("otros"));
    };

    const getOtrosTexto = (field: string) => {
        const item = getValues(field).find(i => i.startsWith("otros:"));
        return item ? item.split(":")[1] || "" : "";
    };

    const isChecked = (field: string, value: string) => {
        return getValues(field).some(item =>
            value === "otros"
                ? item.startsWith("otros")
                : item === value
        );
    };

    const opcionesTenencia = [
        { value: "propia", label: "Propia" },
        { value: "arrendada", label: "Arrendada" },
        { value: "prestada", label: "Prestada" },
        { value: "servicios", label: "Por servicios" },
        { value: "hipoteca", label: "Hipoteca" },
        { value: "otros", label: "Otros" },
    ];

    const opcionesMaterial = [
        { value: "adobe", label: "Adobe" },
        { value: "ladrillo", label: "Ladrillo" },
        { value: "bloque", label: "Bloque" },
        { value: "madera", label: "Madera" },
        { value: "bahareque", label: "Bahareque" },
        { value: "otros", label: "Otros" },
    ];

    const opcionesPiso = [
        { value: "baldosa", label: "Baldosa" },
        { value: "cemento", label: "Cemento" },
        { value: "madera", label: "Madera" },
        { value: "tierra", label: "Tierra" },
        { value: "otros", label: "Otros" },
    ];

    const opcionesTecho = [
        { value: "zinc", label: "Zinc" },
        { value: "teja", label: "Teja" },
        { value: "eternit", label: "Eternit" },
        { value: "loza", label: "Loza" },
        { value: "ardex", label: "Árdex" },
        { value: "otros", label: "Otros" },
    ];

    const opcionesAgua = [
        { value: "potable", label: "Potable" },
        { value: "entubada", label: "Entubada" },
        { value: "acequia", label: "Acequia" },
        { value: "fuera", label: "Fuera" },
    ];

    const opcionesSanitario = [
        { value: "sshh", label: "SS.HH." },
        { value: "letrina", label: "Letrina" },
        { value: "airelibre", label: "Aire libre" },
        { value: "pozo", label: "Pozo séptico" },
    ];

    return (
        <div className="space-y-6">

            <Label>7. Vivienda y Habitabilidad</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Tenencia */}
                <div>
                    <Label>Tipo de Tenencia</Label>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {opcionesTenencia.map((op) => (
                            <Switch
                                key={op.value}
                                label={op.label}
                                checked={isChecked("tipoTenencia", op.value)}
                                onChange={(checked: boolean) =>
                                    handleMultiChange("tipoTenencia", op.value, checked)
                                }
                            />
                        ))}
                    </div>
                    {incluyeOtros("tipoTenencia") && (
                        <div className="mt-3">
                            <Label>Especifique otro tipo de tenencia</Label>
                            <Input
                                value={getOtrosTexto("tipoTenencia")}
                                onChange={(e: any) =>
                                    handleOtrosChange("tipoTenencia", e.target.value)
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Material paredes */}
                <div>
                    <Label>Material de paredes</Label>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {opcionesMaterial.map((op) => (
                            <Switch
                                key={op.value}
                                label={op.label}
                                checked={isChecked("materialParedes", op.value)}
                                onChange={(checked: boolean) =>
                                    handleMultiChange("materialParedes", op.value, checked)
                                }
                            />
                        ))}
                    </div>

                    {/* INPUT OTROS */}
                    {incluyeOtros("materialParedes") && (
                        <div className="mt-3">
                            <Label>Especifique otros materiales de paredes</Label>
                            <Input
                                value={getOtrosTexto("materialParedes")}
                                onChange={(e: any) =>
                                    handleOtrosChange("materialParedes", e.target.value)
                                }
                                placeholder="Ej: caña, reciclado..."
                            />
                        </div>
                    )}
                </div>

                {/* Piso */}
                <div>
                    <Label>Material de Piso</Label>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {opcionesPiso.map((op) => (
                            <Switch
                                key={op.value}
                                label={op.label}
                                checked={isChecked("materialPiso", op.value)}
                                onChange={(checked: boolean) =>
                                    handleMultiChange("materialPiso", op.value, checked)
                                }
                            />
                        ))}
                    </div>

                    {incluyeOtros("materialPiso") && (
                        <div className="mt-3">
                            <Label>Especifique otros materiales del piso</Label>
                            <Input
                                value={getOtrosTexto("materialPiso")}
                                onChange={(e: any) =>
                                    handleOtrosChange("materialPiso", e.target.value)
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Techo */}
                <div>
                    <Label>Material del techo</Label>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {opcionesTecho.map((op) => (
                            <Switch
                                key={op.value}
                                label={op.label}
                                checked={isChecked("materialTecho", op.value)}
                                onChange={(checked: boolean) =>
                                    handleMultiChange("materialTecho", op.value, checked)
                                }
                            />
                        ))}
                    </div>
                    {incluyeOtros("materialTecho") && (
                        <div className="mt-3">
                            <Label>Especifique otros materiales del techo</Label>
                            <Input
                                value={getOtrosTexto("materialTecho")}
                                onChange={(e: any) =>
                                    handleOtrosChange("materialTecho", e.target.value)
                                }
                            />
                        </div>
                    )}
                </div>
                {/* Cantidades */}
                <div>
                    <Label>N° Cuartos</Label>
                    <Input
                        type="number"
                        value={data.numeroCuartos}
                        onChange={(e: any) => onChange("numeroCuartos", Number(e.target.value))}
                    />
                </div>

                <div>
                    <Label>N° Dormitorios</Label>
                    <Input
                        type="number"
                        value={data.numeroDormitorios}
                        onChange={(e: any) => onChange("numeroDormitorios", Number(e.target.value))}
                    />
                </div>

                <div>
                    <Label>N° Camas</Label>
                    <Input
                        type="number"
                        value={data.numeroCamas}
                        onChange={(e: any) => onChange("numeroCamas", Number(e.target.value))}
                    />
                </div>

                <div>
                    <Label>N° SS.HH</Label>
                    <Input
                        type="number"
                        value={data.numeroSanitarios}
                        onChange={(e: any) => onChange("numeroSanitarios", Number(e.target.value))}
                    />
                </div>

                {/* Agua */}
                <div>
                    <Label>Agua</Label>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {opcionesAgua.map((op) => (
                            <Switch
                                key={op.value}
                                label={op.label}
                                checked={isChecked("procedenciaAgua", op.value)}
                                onChange={(checked: boolean) =>
                                    handleMultiChange("procedenciaAgua", op.value, checked)
                                }
                            />
                        ))}
                    </div>
                </div>

                {/* Sanitario */}
                <div>
                    <Label>Tipo de sanitario</Label>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {opcionesSanitario.map((op) => (
                            <Switch
                                key={op.value}
                                label={op.label}
                                checked={isChecked("tipoSanitario", op.value)}
                                onChange={(checked: boolean) =>
                                    handleMultiChange("tipoSanitario", op.value, checked)
                                }
                            />
                        ))}
                    </div>
                </div>

                {/* Ducha */}
                <div>
                    <Label>¿Tiene ducha?</Label>
                    <div className="flex gap-4 mt-2.5">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input 
                                type="radio" 
                                name="tieneDucha"
                                checked={data.tieneDucha === true}
                                onChange={() => onChange("tieneDucha", true)}
                                className="text-brand-500 focus:ring-brand-500"
                            />
                            Sí
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input 
                                type="radio" 
                                name="tieneDucha"
                                checked={data.tieneDucha === false}
                                onChange={() => onChange("tieneDucha", false)}
                                className="text-brand-500 focus:ring-brand-500"
                            />
                            No
                        </label>
                    </div>
                </div>

                {/* Electricidad y Telecomunicaciones */}
                <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-800/60 pt-4 space-y-4">
                    <Label className="text-base font-bold text-gray-800 dark:text-white">Electricidad y Telecomunicaciones</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>¿Tiene Electricidad?</Label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="tieneElectricidad"
                                        checked={data.tieneElectricidad === true}
                                        onChange={() => onChange("tieneElectricidad", true)}
                                        className="text-brand-500 focus:ring-brand-500"
                                    />
                                    Sí
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="tieneElectricidad"
                                        checked={data.tieneElectricidad === false}
                                        onChange={() => onChange("tieneElectricidad", false)}
                                        className="text-brand-500 focus:ring-brand-500"
                                    />
                                    No
                                </label>
                            </div>
                        </div>

                        <div>
                            <Label>¿Tiene Internet?</Label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="tieneInternet"
                                        checked={data.tieneInternet === true}
                                        onChange={() => onChange("tieneInternet", true)}
                                        className="text-brand-500 focus:ring-brand-500"
                                    />
                                    Sí
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="tieneInternet"
                                        checked={data.tieneInternet === false}
                                        onChange={() => onChange("tieneInternet", false)}
                                        className="text-brand-500 focus:ring-brand-500"
                                    />
                                    No
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Número de focos/puntos de luz</Label>
                            <Input
                                type="number"
                                min="0"
                                value={data.numeroFocos !== undefined ? data.numeroFocos : 0}
                                onChange={(e: any) => onChange("numeroFocos", Number(e.target.value))}
                                placeholder="Ej: 5"
                            />
                        </div>

                        <div>
                            <Label>Especifique otros detalles</Label>
                            <Input
                                value={data.otrosDetallesElectricidad || ""}
                                onChange={(e: any) => onChange("otrosDetallesElectricidad", e.target.value)}
                                placeholder="Ej: ducha eléctrica, acondicionador de aire"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CondicionesViviendaForm;