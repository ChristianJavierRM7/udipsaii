import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { pacientesService } from "../../../services/pacientes";

// listarActivos devuelve PageResponse<T> → usamos .content para el array
// Pedimos size=1000 para traer todos los pacientes activos sin paginar

interface PacienteResumen {
  id: number;
  nombresApellidos: string;
  cedula: string;
}

export default function SelectorPacienteInformes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<PacienteResumen[]>([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    pacientesService
      .listarActivos(0, 1000)
      .then((page) => setPacientes(page.content || []))
      .catch(() => toast.error("Error al cargar pacientes"))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = pacientes.filter(
    (p) =>
      p.nombresApellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      p.cedula.includes(filtro)
  );

  return (
    <>
      <PageMeta title="Informes Psicopedagógicos | Udipsai" description="Selecciona un paciente" />
      <PageBreadcrumb
        pageTitle="Informes Psicopedagógicos"
        items={[
          { label: "Inicio", path: "/" },
          { label: "Fichas", path: "/fichas" },
          { label: "Informes Psicopedagógicos" },
        ]}
      />

      <ComponentCard title="Selecciona un paciente">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>

        {cargando ? (
          <p className="py-8 text-center text-gray-400">Cargando pacientes...</p>
        ) : filtrados.length === 0 ? (
          <p className="py-8 text-center text-gray-400">No se encontraron pacientes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Cédula</th>
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="py-3 text-gray-800 dark:text-gray-200">{p.nombresApellidos}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{p.cedula}</td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/fichas/informes/${p.id}`)}
                        className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400"
                      >
                        Ver informes →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>
    </>
  );
}