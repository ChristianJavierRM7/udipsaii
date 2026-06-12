import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import DatePicker from "../../../components/form/date-picker";
import { useAuth } from "../../../context/AuthContext";
import { informesService, InformeDTO } from "../../../services/informes";
import JSZip from "jszip";

type TipoDescarga = "pdf" | "word";

export default function ListaInformes() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [informes, setInformes] = useState<InformeDTO[]>([]);
  const [informesFiltrados, setInformesFiltrados] = useState<InformeDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState<{ id: number; tipo: TipoDescarga } | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [fechaElabDesde, setFechaElabDesde] = useState("");
  const [fechaElabHasta, setFechaElabHasta] = useState("");
  const [fechaLectDesde, setFechaLectDesde] = useState("");
  const [fechaLectHasta, setFechaLectHasta] = useState("");
  const [ordenDir, setOrdenDir] = useState<"desc" | "asc">("desc");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [descargandoZip, setDescargandoZip] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const canCreate = hasPermission("PERM_INFORMES_CREAR");
  const canEdit = hasPermission("PERM_INFORMES_EDITAR");
  const canDelete = hasPermission("PERM_INFORMES_ELIMINAR");

  useEffect(() => {
    if (!pacienteId) return;
    informesService
      .listarPorPaciente(Number(pacienteId))
      .then((data) => {
        setInformes(data);
        setInformesFiltrados(data);
      })
      .catch(() => toast.error("Error al cargar los informes"))
      .finally(() => setCargando(false));
  }, [pacienteId]);

  // Aplicar filtros cada vez que cambia algo
  useEffect(() => {
    let resultado = [...informes];

    // Búsqueda por nombre o número de ficha
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase();
      resultado = resultado.filter(
        (i) =>
          i.paciente.nombresApellidos.toLowerCase().includes(b) ||
          (i.numeroFicha && i.numeroFicha.toLowerCase().includes(b))
      );
    }

    // Fecha elaboración desde
    if (fechaElabDesde) {
      resultado = resultado.filter(
        (i) => i.fechaElaboracionInforme && i.fechaElaboracionInforme >= fechaElabDesde
      );
    }

    // Fecha elaboración hasta
    if (fechaElabHasta) {
      resultado = resultado.filter(
        (i) => i.fechaElaboracionInforme && i.fechaElaboracionInforme <= fechaElabHasta
      );
    }

    // Fecha lectura desde
    if (fechaLectDesde) {
      resultado = resultado.filter(
        (i) => i.fechaLecturaInforme && i.fechaLecturaInforme >= fechaLectDesde
      );
    }

    // Fecha lectura hasta
    if (fechaLectHasta) {
      resultado = resultado.filter(
        (i) => i.fechaLecturaInforme && i.fechaLecturaInforme <= fechaLectHasta
      );
    }

    // Ordenar por fecha elaboración
    resultado.sort((a, b) => {
      const fa = a.fechaElaboracionInforme ?? "";
      const fb = b.fechaElaboracionInforme ?? "";
      return ordenDir === "desc"
        ? fb.toString().localeCompare(fa.toString())
        : fa.toString().localeCompare(fb.toString());
    });

    setInformesFiltrados(resultado);
  }, [busqueda, fechaElabDesde, fechaElabHasta, fechaLectDesde, fechaLectHasta, ordenDir, informes]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaElabDesde("");
    setFechaElabHasta("");
    setFechaLectDesde("");
    setFechaLectHasta("");
    setOrdenDir("desc");
  };

  const hayFiltrosActivos =
    busqueda || fechaElabDesde || fechaElabHasta || fechaLectDesde || fechaLectHasta;

  const handleDescargarPdf = async (informe: InformeDTO) => {
    setDescargando({ id: informe.id, tipo: "pdf" });
    try {
      await informesService.descargarPdf(informe.id, informe.paciente.nombresApellidos);
      toast.success("PDF descargado correctamente");
    } catch {
      toast.error("No se pudo generar el PDF");
    } finally {
      setDescargando(null);
    }
  };

  const informesEnRango = () => {
    return informes.filter((inf) => {
      const fecha = inf.fechaElaboracionInforme?.toString().slice(0, 10);
      if (!fecha) return false;
      if (fechaDesde && fecha < fechaDesde) return false;
      if (fechaHasta && fecha > fechaHasta) return false;
      return true;
    });
  };

  const handleDescargarZip = async () => {
    const seleccionados = informesEnRango();
    if (seleccionados.length === 0) return toast.warning("No hay informes en este rango");

    setDescargandoZip(true);
    try {
      const zip = new JSZip();
      for (const inf of seleccionados) {
        const blob = await informesService.obtenerPdfBlob(inf.id);
        const nombreArchivo = `Informe_${inf.numeroFicha || inf.id}_${inf.paciente.nombresApellidos}.pdf`;
        zip.file(nombreArchivo, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `Informes_${pacienteId}_${new Date().getTime()}.zip`;
      link.click();
    } catch {
      toast.error("Error al generar el archivo ZIP");
    } finally {
      setDescargandoZip(false);
    }
  };

  const handleDescargarWord = async (informe: InformeDTO) => {
    setDescargando({ id: informe.id, tipo: "word" });
    try {
      await informesService.descargarWord(informe.id, informe.paciente.nombresApellidos);
      toast.success("Word descargado correctamente");
    } catch {
      toast.error("No se pudo generar el Word");
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
      <PageMeta title="Informes Psicopedagógicos | Udipsai" description="Listado de informes" />
      <PageBreadcrumb
        pageTitle="Informes Psicopedagógicos"
        items={[
          { label: "Inicio", path: "/" },
          { label: "Fichas", path: "/fichas" },
          { label: "Informes Psicopedagógicos" },
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Informes psicopedagógicos
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4 bg-gray-50 dark:bg-white/5 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
              <DatePicker
                id="fecha-desde"
                placeholder="Desde"
                onChange={(_, dateStr) => setFechaDesde(dateStr)}
              />
              <DatePicker
                id="fecha-hasta"
                placeholder="Hasta"
                onChange={(_, dateStr) => setFechaHasta(dateStr)}
              />
              <button
                onClick={handleDescargarZip}
                disabled={descargandoZip}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {descargandoZip ? "Generando ZIP..." : "Descargar ZIP"}
              </button>
            </div>

            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                hayFiltrosActivos
                  ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-400"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filtros
              {hayFiltrosActivos && (
                <span className="ml-1 rounded-full bg-brand-500 px-1.5 py-0.5 text-xs text-white">
                  activo
                </span>
              )}
            </button>
            {canCreate && (
              <Button onClick={() => navigate(`/fichas/informes/nuevo/${pacienteId}`)}>
                + Nuevo informe
              </Button>
            )}
          </div>
        </div>

        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.03]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Búsqueda */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Buscar por paciente o Nº ficha
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej: Juan Pérez o ficha 12"
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Fecha elaboración desde */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Elaboración desde
                </label>
                <input
                  type="date"
                  value={fechaElabDesde}
                  onChange={(e) => setFechaElabDesde(e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Fecha elaboración hasta */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Elaboración hasta
                </label>
                <input
                  type="date"
                  value={fechaElabHasta}
                  onChange={(e) => setFechaElabHasta(e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Orden */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Ordenar por fecha elaboración
                </label>
                <select
                  value={ordenDir}
                  onChange={(e) => setOrdenDir(e.target.value as "asc" | "desc")}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="desc">Más reciente primero</option>
                  <option value="asc">Más antiguo primero</option>
                </select>
              </div>

              {/* Fecha lectura desde */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Lectura desde
                </label>
                <input
                  type="date"
                  value={fechaLectDesde}
                  onChange={(e) => setFechaLectDesde(e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Fecha lectura hasta */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Lectura hasta
                </label>
                <input
                  type="date"
                  value={fechaLectHasta}
                  onChange={(e) => setFechaLectHasta(e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Limpiar filtros */}
            {hayFiltrosActivos && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={limpiarFiltros}
                  className="text-xs text-gray-500 underline hover:text-red-500"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contador resultados */}
        {hayFiltrosActivos && !cargando && (
          <p className="mb-3 text-xs text-gray-400">
            {informesFiltrados.length} resultado{informesFiltrados.length !== 1 ? "s" : ""} encontrado{informesFiltrados.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Tabla */}
        {cargando ? (
          <p className="py-8 text-center text-gray-500">Cargando...</p>
        ) : informesFiltrados.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-lg font-medium">
              {hayFiltrosActivos ? "Sin resultados con esos filtros" : "Sin informes registrados"}
            </p>
            <p className="mt-1 text-sm">
              {hayFiltrosActivos
                ? "Intenta ajustar los filtros"
                : 'Haz clic en "Nuevo informe" para crear el primero'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">N° Ficha</th>
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Paciente</th>
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Fecha elaboración</th>
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Fecha lectura</th>
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {informesFiltrados.map((inf) => (
                  <tr key={inf.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="py-3 text-gray-700 dark:text-gray-300">{inf.numeroFicha || "—"}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{inf.paciente.nombresApellidos}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{inf.fechaElaboracionInforme?.toString() || "—"}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{inf.fechaLecturaInforme?.toString() || "—"}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleDescargarPdf(inf)}
                          disabled={descargando?.id === inf.id && descargando?.tipo === "pdf"}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          {descargando?.id === inf.id && descargando?.tipo === "pdf" ? "Generando..." : "PDF"}
                        </button>
                        <button
                          onClick={() => handleDescargarWord(inf)}
                          disabled={descargando?.id === inf.id && descargando?.tipo === "word"}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                        >
                          {descargando?.id === inf.id && descargando?.tipo === "word" ? "Generando..." : "Word"}
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => navigate(`/fichas/informes/editar/${inf.id}`)}
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                          >
                            ✏️
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleEliminar(inf.id)}
                            className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                          >
                            🗑️
                          </button>
                        )}
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