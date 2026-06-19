import React from "react";
import Label from "../../../Label";
import Input from "../../../input/InputField";
import Switch from "../../../switch/Switch";
import { toast } from "react-toastify";

interface VulnerabilidadesFormProps {
    data: {
        movilidadHumana: boolean;
        enfermedadCatastrofica: boolean;
        embarazoAdolescente: boolean;
        abusoSexual: boolean;
        agresionFisica: boolean;
        agresionPsicologica: boolean;
        lugarAgresion: string;
    };
    onChange: (field: string, value: any) => void;
    onValidate?: (isValid: boolean, errors: string[]) => void;
}

const validateVulnerabilidades = (data: VulnerabilidadesFormProps["data"]): string[] => {
    const errors: string[] = [];
    return errors;
};

const VulnerabilidadesForm: React.FC<VulnerabilidadesFormProps> = ({ data, onChange, onValidate }) => {
    const lastValidationRef = React.useRef("");

    React.useEffect(() => {
        if (onValidate) {
            const errors = validateVulnerabilidades(data);
            const serialized = JSON.stringify(errors);
            if (serialized !== lastValidationRef.current) {
                lastValidationRef.current = serialized;
                onValidate(errors.length === 0, errors);
            }
        }
    }, [data, onValidate]);

    const optionsVulnerabilidades = [
        { value: "movilidadHumana", label: "Movilidad humana" },
        { value: "enfermedadCatastrofica", label: "Enfermedad catastrófica" },
        { value: "embarazoAdolescente", label: "Embarazo adolescente" },
        { value: "abusoSexual", label: "Abuso sexual" },
    ];
    const handleAgresionChange = (tipo: string, checked: boolean) => {
        const actuales = data.lugarAgresion
            ? data.lugarAgresion.split(",")
            : [];

        let nuevos;

        if (checked) {
            nuevos = [...actuales, `${tipo}:`];
        } else {
            nuevos = actuales.filter(item => !item.startsWith(tipo));
        }

        onChange("lugarAgresion", nuevos.join(","));
    };
    const getLugar = (tipo: string) => {
        const item = data.lugarAgresion
            ?.split(",")
            .find(i => i.startsWith(tipo));

        return item ? item.split(":")[1] || "" : "";
    };

    const tieneFisica = data.lugarAgresion?.includes("fisica:");
    const tienePsicologica = data.lugarAgresion?.includes("psicologica:");
    const mostrarLugarAgresion =
        data.abusoSexual || data.agresionFisica || data.agresionPsicologica;

    return (
        <div className="space-y-6">

            {/* Vulnerabilidades */}
            <div>
                <Label>Vulnerabilidades</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {optionsVulnerabilidades.map((option) => (
                        <Switch
                            key={option.value}
                            label={option.label}
                            checked={data[option.value as keyof typeof data] as boolean}
                            onChange={(checked: boolean) =>
                                onChange(option.value, checked)
                            }
                        />
                    ))}
                    <Switch
                        label="Agresión física"
                        checked={tieneFisica}
                        onChange={(checked) => handleAgresionChange("fisica", checked)}
                    />

                    <Switch
                        label="Agresión psicológica"
                        checked={tienePsicologica}
                        onChange={(checked) => handleAgresionChange("psicologica", checked)}
                    />
                </div>
            </div>

            {/* Lugar de agresión */}
            {tieneFisica && (
                <Input
                    value={getLugar("fisica")}
                    onChange={(e: any) => {
                        const actuales = data.lugarAgresion?.split(",") || [];
                        const sinFisica = actuales.filter(i => !i.startsWith("fisica"));
                        const nuevos = [...sinFisica, `fisica:${e.target.value}`];
                        onChange("lugarAgresion", nuevos.join(","));
                    }}
                    placeholder="Lugar de agresión física"
                />
            )}

            {tienePsicologica && (
                <Input
                    value={getLugar("psicologica")}
                    onChange={(e: any) => {
                        const actuales = data.lugarAgresion?.split(",") || [];
                        const sinPsi = actuales.filter(i => !i.startsWith("psicologica"));
                        const nuevos = [...sinPsi, `psicologica:${e.target.value}`];
                        onChange("lugarAgresion", nuevos.join(","));
                    }}
                    placeholder="Lugar de agresión psicológica"
                />
            )}
        </div>
    );
};

export default VulnerabilidadesForm;