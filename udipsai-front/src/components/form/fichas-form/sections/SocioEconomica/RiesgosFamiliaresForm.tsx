import React from "react";
import Input from "../../../input/InputField";
import Label from "../../../Label";
import Switch from "../../../switch/Switch";

interface RiesgosFamiliaresFormProps {
    data: {
        problemasSociales: string;
        migroExterior: boolean;
        lugarMigracion: string;
        tiempoMigracion: string;
        afectacionFamiliar: string;
    };
    onChange: (field: string, value: any) => void;
    onValidate?: (isValid: boolean, errors: string[]) => void;
}

const validateRiesgosFamiliares = (data: RiesgosFamiliaresFormProps["data"]): string[] => {
    const errors: string[] = [];
    if (!data.problemasSociales || data.problemasSociales.trim() === "") {
        errors.push("Debe seleccionar al menos un problema social");
    }
    if (data.migroExterior) {
        if (!data.lugarMigracion || data.lugarMigracion.trim() === "") {
            errors.push("Lugar de migración es requerido");
        }
        if (!data.tiempoMigracion || data.tiempoMigracion.trim() === "") {
            errors.push("Tiempo de migración es requerido");
        }
        if (!data.afectacionFamiliar || data.afectacionFamiliar.trim() === "") {
            errors.push("Afectación familiar es requerida");
        }
    }
    return errors;
};

const RiesgosFamiliaresForm: React.FC<RiesgosFamiliaresFormProps> = ({ data, onChange, onValidate }) => {
    const lastValidationRef = React.useRef("");

    React.useEffect(() => {
        if (onValidate) {
            const errors = validateRiesgosFamiliares(data);
            const serialized = JSON.stringify(errors);
            if (serialized !== lastValidationRef.current) {
                lastValidationRef.current = serialized;
                onValidate(errors.length === 0, errors);
            }
        }
    }, [data, onValidate]);

    const optionsProblemas = [
        { value: "violencia", label: "Violencia intrafamiliar" },
        { value: "alcoholismo", label: "Alcoholismo" },
        { value: "drogadiccion", label: "Drogadicción" },
        { value: "desempleo", label: "Desempleo" },
        { value: "delincuencia", label: "Delincuencia" },
        { value: "tabaquismo", label: "Tabaquismo" },
        { value: "discapacidad", label: "Discapacidad" },
        { value: "juegosAzar", label: "Juegos de azar" },
        { value: "otros", label: "Otros" },
    ];
    const otrosItem = data.problemasSociales
        ?.split(",")
        .find(item => item.startsWith("otros"));

    const incluyeOtros = !!otrosItem;
    const textoOtros = otrosItem ? otrosItem.split(":")[1] || "" : "";
    // Manejo de selección múltiple
    const handleToggleProblema = (value: string, checked: boolean) => {
        const actuales = data.problemasSociales
            ? data.problemasSociales.split(",")
            : [];

        let nuevos;

        if (checked) {
            if (value === "otros") {
                nuevos = [...actuales, "otros:"];
            } else {
                nuevos = [...actuales, value];
            }
        } else {
            nuevos = actuales.filter(item => {
                if (value === "otros") return !item.startsWith("otros");
                return item !== value;
            });
        }

        onChange("problemasSociales", nuevos.join(","));
    };
    const handleOtrosChange = (text: string) => {
        const actuales = data.problemasSociales
            ? data.problemasSociales.split(",")
            : [];

        const sinOtros = actuales.filter(item => !item.startsWith("otros"));

        const nuevos = [...sinOtros, `otros:${text}`];

        onChange("problemasSociales", nuevos.join(","));
    };

    return (
        <div className="space-y-6">

            {/* Problemas sociales */}
            <div>
                <Label>Problemas Sociales</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {optionsProblemas.map((op) => (
                        <Switch
                            key={op.value}
                            label={op.label}
                            checked={data.problemasSociales?.includes(op.value)}
                            onChange={(checked: boolean) =>
                                handleToggleProblema(op.value, checked)
                            }
                        />
                    ))}
                </div>
            </div>
            {/* Campo "Otros" */}
            {incluyeOtros && (
                <div className="mt-4">
                    <Label>Especifique otros problemas</Label>
                    <Input
                        value={textoOtros}
                        onChange={(e: any) =>
                            handleOtrosChange(e.target.value)
                        }
                        placeholder="Describa otros problemas"
                    />
                </div>
            )}

            {/* Migración */}
            <div>
                <Switch
                    label="¿Migró al exterior?"
                    checked={data.migroExterior}
                    onChange={(checked: boolean) =>
                        onChange("migroExterior", checked)
                    }
                />
            </div>

            {/* Campos condicionales */}
            {data.migroExterior && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                        <Label>Lugar de migración</Label>
                        <Input
                            value={data.lugarMigracion}
                            onChange={(e: any) =>
                                onChange("lugarMigracion", e.target.value)
                            }
                            placeholder="Ej: España"
                        />
                    </div>

                    <div>
                        <Label>Tiempo de migración</Label>
                        <Input
                            value={data.tiempoMigracion}
                            onChange={(e: any) =>
                                onChange("tiempoMigracion", e.target.value)
                            }
                            placeholder="Ej: 2 años"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label>Afectación familiar</Label>
                        <Input
                            value={data.afectacionFamiliar}
                            onChange={(e: any) =>
                                onChange("afectacionFamiliar", e.target.value)
                            }
                            placeholder="Describa la afectación"
                        />
                    </div>

                </div>
            )}

        </div>
    );
};

export default RiesgosFamiliaresForm;