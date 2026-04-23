import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { informesService, InformeDTO } from "../../../services/informes";

export default function ListaInformes() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();

  const [informes, setInformes] = useState<InformeDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState<number | null>(null);

  useEffect(() => {
    if (!pacienteId) return;
    informesService
      .listarPorPaciente(Number(pacienteId))
      .then(setInformes)
      .catch(() => toast.error("Error al cargar los informes"))
      .finally(() => setCargando(false));
  }, [pacienteId]);

  const handleDescargar = async (informe: InformeDTO) => {
    setDescargando(informe.id);
    try {
      await informesService.descargarPdf(
        informe.id,
        informe.paciente.nombresApellidos
      );
      toast.success("PDF descargado correctamente");
    } catch {
      toast.error("No se pudo generar el PDF");
    } finally {
      setDescargando(null);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este informe?")) return;
    try {
      await informesService.eliminar(id);
      setInformes((prev) => prev.filter((i) => i.id !== id));
      toast.success("Informe eliminado");
    } catch {
      toast.error("Error al eliminar el informe");
    }
  };

  return (
    <>
      <PageMeta
        title="Informes Psicopedagógicos | Udipsai"
        description="Listado de informes psicopedagógicos"
      />
      <PageBreadcrumb
        pageTitle="Informes Psicopedagógicos"
        items={[
          { label: "Inicio", path: "/" },
          { label: "Fichas", path: "/fichas" },
          { label: "Informes Psicopedagógicos" },
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Encabezado */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Informes psicopedagógicos
          </h2>
          <Button
            onClick={() =>
              navigate(`/fichas/informes/nuevo/${pacienteId}`)
            }
          >
            + Nuevo informe
          </Button>
        </div>

        {/* Tabla */}
        {cargando ? (
          <p className="text-center text-gray-500 py-8">Cargando...</p>
        ) : informes.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-lg font-medium">Sin informes registrados</p>
            <p className="mt-1 text-sm">
              Haz clic en "Nuevo informe" para crear el primero
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    N° Ficha
                  </th>
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Paciente
                  </th>
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Fecha elaboración
                  </th>
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Fecha lectura
                  </th>
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {informes.map((inf) => (
                  <tr
                    key={inf.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="py-3 text-gray-700 dark:text-gray-300">
                      {inf.numeroFicha || "—"}
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">
                      {inf.paciente.nombresApellidos}
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">
                      {inf.fechaElaboracionInforme || "—"}
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">
                      {inf.fechaLecturaInforme || "—"}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {/* Descargar PDF */}
                        <button
                          onClick={() => handleDescargar(inf)}
                          disabled={descargando === inf.id}
                          title="Descargar PDF"
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          {descargando === inf.id
                            ? "Generando..."
                            : "Descargar PDF"}
                        </button>
                        {/* Editar */}
                        <button
                          onClick={() =>
                            navigate(`/fichas/informes/editar/${inf.id}`)
                          }
                          title="Editar"
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                        >
                          ✏️
                        </button>
                        {/* Eliminar */}
                        <button
                          onClick={() => handleEliminar(inf.id)}
                          title="Eliminar"
                          className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}