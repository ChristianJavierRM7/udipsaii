import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { pacientesService } from "../../../services/pacientes";

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
      .listarActivos()
.then((response) => setPacientes(response.content || []))      .catch(() => toast.error("Error al cargar pacientes"))
      .finally(() => setCargando(false));
  }, []);

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nombresApellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      p.cedula.includes(filtro)
  );

  return (
    <>
      <PageMeta
        title="Informes Psicopedagógicos | Udipsai"
        description="Selecciona un paciente para ver sus informes"
      />
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
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {cargando ? (
          <p className="py-8 text-center text-gray-400">Cargando pacientes...</p>
        ) : pacientesFiltrados.length === 0 ? (
          <p className="py-8 text-center text-gray-400">
            No se encontraron pacientes
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left font-medium text-gray-500">Nombre</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Cédula</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                  >
                    <td className="py-3 text-gray-700 dark:text-gray-300">
                      {p.nombresApellidos}
                    </td>
                    <td className="py-3 text-gray-500">{p.cedula}</td>
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