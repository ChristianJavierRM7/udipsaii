import React from "react";
import Input from "../../../input/InputField";

interface InformacionPacienteFormProps {
    data: {
        id: number;
        nombresApellidos: string;
        fechaNacimiento: string;
        lugarNacimiento: string;
        edad: number;
        cedula: string;
        numeroTelefono?: string;
        numeroCelular?: string;
        domicilio?: string;
        portadorCarnet?: boolean;
        tipoDiscapacidad?: string;
        porcentajeDiscapacidad?: number;
    };
    pacienteInstruccion?: string;
    pacienteOcupacion?: string;
    pacienteEmail?: string;
    responsable?: string;
    familiares?: {
        nombresApellidos: string;
        relacion: string;
    }[];
    onChangePaciente: (field: string, value: any) => void;
    onChange: (field: string, value: any) => void;
}

const InformacionPacienteForm: React.FC<InformacionPacienteFormProps> = ({
    data,
    pacienteInstruccion = "",
    pacienteOcupacion = "",
    pacienteEmail = "",
    responsable = "",
    familiares = [],
    onChangePaciente,
}) => {
    return (
        <div className="space-y-4">
            {/* Fila 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre Completo
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100 font-medium">
                        {data.nombresApellidos || "—"}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cédula
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100 font-medium">
                        {data.cedula || "—"}
                    </p>
                </div>
            </div>

            {/* Fila 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha de Nacimiento
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                        {data.fechaNacimiento || "—"}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Edad
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                        {data.edad || "—"} años
                    </p>
                </div>
            </div>

            {/* Fila 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lugar de Nacimiento
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                        {data.lugarNacimiento || "—"}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        E-mail
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                        {pacienteEmail || "—"}
                    </p>
                </div>
            </div>

            {/* Fila 4: Instrucción & Ocupación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Instrucción
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                        {pacienteInstruccion || "—"}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ocupación
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                        {pacienteOcupacion || "—"}
                    </p>
                </div>
            </div>

            {/* Fila 5: Teléfonos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Número de Teléfono
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                        {data.numeroTelefono || "—"}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Número de Celular
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                        {data.numeroCelular || "—"}
                    </p>
                </div>
            </div>

            {/* Domicilio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Domicilio
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                    {data.domicilio || "—"}
                </p>
            </div>

            {/* Discapacidad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Presenta Discapacidad
                    </label>
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                        {data.portadorCarnet ? "Sí" : "No"}
                    </p>
                </div>
                {data.portadorCarnet && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tipo de Discapacidad
                            </label>
                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                                {data.tipoDiscapacidad || "—"}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Porcentaje de Discapacidad
                            </label>
                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                                {data.porcentajeDiscapacidad !== undefined ? `${data.porcentajeDiscapacidad}%` : "—"}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default InformacionPacienteForm;