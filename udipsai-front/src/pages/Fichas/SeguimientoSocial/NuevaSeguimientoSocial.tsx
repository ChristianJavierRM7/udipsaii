import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import FormularioSeguimientoSocial from '../../../components/form/fichas-form/FormularioSeguimientoSocial';
import PageBreadCrumb from '../../../components/common/PageBreadCrumb';
import PatientSelector from '../../../components/common/PatientSelector';
import { pacientesService } from '../../../services/pacientes';

const NuevaSeguimientoSocial: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pacienteIdParam = searchParams.get("pacienteId");
  
  // Estado para almacenar el paciente seleccionado
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    if (pacienteIdParam) {
      pacientesService.obtenerPorId(pacienteIdParam)
        .then(data => {
          if (data) {
            setSelectedPatient(data);
          }
        })
        .catch(err => {
          console.error("Error al obtener paciente preseleccionado:", err);
        });
    }
  }, [pacienteIdParam]);
  return (
    <div className="max-w-6xl mx-auto">
      <PageBreadCrumb pageTitle="Nueva Ficha de Seguimiento Social" />
      
      <div className="mt-8 relative">
        {!selectedPatient ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PatientSelector 
              onSelect={(patient) => setSelectedPatient(patient)} 
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tarjeta de Paciente Seleccionado */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-2xl shadow-inner">
                  {selectedPatient.nombresApellidos?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-brand-600 dark:text-brand-400 mb-1">
                    Paciente Seleccionado
                  </p>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                    {selectedPatient.nombresApellidos}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    CI: <span className="font-medium">{selectedPatient.cedula}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
              >
                Cambiar Paciente
              </button>
            </div>

            {/* Formulario */}
            <div className="relative">
              <div className="absolute -left-3 top-8 bottom-8 w-0.5 bg-gradient-to-b from-brand-200 to-transparent dark:from-brand-800/50 hidden md:block"></div>
              <FormularioSeguimientoSocial 
                pacienteId={selectedPatient.id} 
                onSuccess={() => navigate('/fichas?tab=seguimiento_social')} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NuevaSeguimientoSocial;