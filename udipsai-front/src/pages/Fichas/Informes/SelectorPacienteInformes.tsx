import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { FilterDropdown } from "../../../components/common/FilterDropdown";
import DatePicker from "../../../components/form/date-picker";

import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

import { pacientesService } from "../../../services/pacientes";
import { informesService } from "../../../services/informes";
import JSZip from "jszip";

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

  const [nivelEducativo, setNivelEducativo] = useState("");
  const [edadMin, setEdadMin] = useState("");
  const [edadMax, setEdadMax] = useState("");
  const [anioFicha, setAnioFicha] = useState("");
  const [areaAtendida, setAreaAtendida] = useState("");
  const [fechaDesdeGlobal, setFechaDesdeGlobal] = useState("");
  const [fechaHastaGlobal, setFechaHastaGlobal] = useState("");
  const [descargandoZipGlobal, setDescargandoZipGlobal] = useState(false);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setCargando(true);

      const page = await pacientesService.listarActivos(0, 1000);

      setPacientes(page.content || []);
    } catch {
      toast.error("Error al cargar pacientes");
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setCargando(true);

      const response = await pacientesService.filtrar(
        {
          activo: true,
          edadMin: edadMin ? Number(edadMin) : undefined,
          edadMax: edadMax ? Number(edadMax) : undefined,
          nivelEducativo: nivelEducativo || undefined,
          anioFicha: anioFicha ? Number(anioFicha) : undefined,
          areaAtendida: areaAtendida || undefined,
        },
        0,
        1000
      );

      setPacientes(response.content || []);
    } catch (error: any) {
      console.error("Error al filtrar:", error);
      console.error("Status:", error?.response?.status);
      console.error("Data:", error?.response?.data);

      toast.error("Error al filtrar pacientes");
    } finally {
      setCargando(false);
    }
  };

  const limpiarFiltros = async () => {
    setEdadMin("");
    setEdadMax("");
    setNivelEducativo("");
    setAnioFicha("");
    setAreaAtendida("");
    await cargarPacientes();
  };

  const informesEnRangoGlobal = async () => {
    const todos = await informesService.listar();
    return todos.filter((inf) => {
      const fecha = inf.fechaElaboracionInforme?.toString().slice(0, 10);
      if (!fecha) return false;
      if (fechaDesdeGlobal && fecha < fechaDesdeGlobal) return false;
      if (fechaHastaGlobal && fecha > fechaHastaGlobal) return false;
      return true;
    });
  };

  const handleDescargarZipGlobal = async () => {
    setDescargandoZipGlobal(true);
    toast.info("Buscando informes...");

    try {
      const enRango = await informesEnRangoGlobal();

      if (enRango.length === 0) {
        toast.error("No hay informes en el rango de fechas seleccionado");
        return;
      }

      toast.info(`Generando ZIP con ${enRango.length} informe(s)...`);

      const zip = new JSZip();

      for (const inf of enRango) {
        try {
          const blob = await informesService.obtenerPdfBlob(inf.id);
          const nombreArchivo = `${inf.numeroFicha || inf.id}_${inf.paciente.nombresApellidos.replace(/\s+/g, "_")}.pdf`;
          zip.file(nombreArchivo, blob);
        } catch (err) {
          console.error(`Error al descargar PDF del informe ${inf.id}:`, err);
        }
      }

      const contenidoZip = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(contenidoZip);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `todos_informes_${fechaDesdeGlobal || "inicio"}_a_${fechaHastaGlobal || "hoy"}.zip`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("ZIP descargado correctamente");
    } catch (error) {
      console.error("Error al generar ZIP global:", error);
      toast.error("Error al generar el archivo ZIP");
    } finally {
      setDescargandoZipGlobal(false);
    }
  };

  const [conteoInformesGlobal, setConteoInformesGlobal] = useState(0);

  useEffect(() => {
    const cargarConteo = async () => {
      try {
        const enRango = await informesEnRangoGlobal();
        setConteoInformesGlobal(enRango.length);
      } catch {
        setConteoInformesGlobal(0);
      }
    };
    cargarConteo();
  }, [fechaDesdeGlobal, fechaHastaGlobal]);
  const filtrados = pacientes.filter(
    (p) =>
      p.nombresApellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      p.cedula.includes(filtro)
  );

  return (
    <>
      <PageMeta
        title="Informes Psicopedagógicos | Udipsai"
        description="Selecciona un paciente"
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
        <div className="mb-4 flex gap-2">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-gray-800">
            <DatePicker
              id="fecha-desde-global"
              placeholder="Desde" onChange={(_, d) => setFechaDesdeGlobal(d)} />
            <DatePicker
              id="fecha-hasta-global"
              placeholder="Hasta" onChange={(_, d) => setFechaHastaGlobal(d)} />
            <button
              onClick={handleDescargarZipGlobal}
              disabled={descargandoZipGlobal || conteoInformesGlobal === 0}
              className="px-3 py-2 bg-brand-500 text-white rounded-lg text-xs font-medium hover:bg-brand-600 disabled:opacity-50"
            >
              {descargandoZipGlobal ? "Generando..." : `Descargar (${conteoInformesGlobal})`}
            </button>
          </div>

          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="h-11 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />

          <FilterDropdown
            onApply={aplicarFiltros}
            onClear={limpiarFiltros}
          >
            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 text-xs">
                  Edad mínima
                </Label>

                <input
                  type="number"
                  value={edadMin}
                  onChange={(e) => setEdadMin(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 dark:border-gray-700 dark:bg-gray-900"
                />
              </div>

              <div>
                <Label className="mb-1.5 text-xs">
                  Edad máxima
                </Label>

                <input
                  type="number"
                  value={edadMax}
                  onChange={(e) => setEdadMax(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 dark:border-gray-700 dark:bg-gray-900"
                />
              </div>

              <div>
                <Label className="mb-1.5 text-xs">
                  Nivel educativo
                </Label>

                <Select
                  value={nivelEducativo}
                  onChange={(value) => setNivelEducativo(value)}
                  placeholder="Seleccione el nivel educativo"
                  options={[
                    {
                      value: "INICIAL",
                      label: "Inicial",
                    },
                    {
                      value: "PREPARATORIA",
                      label: "Preparatoria",
                    },
                    {
                      value: "BASICA_ELEMENTAL",
                      label: "Básica Elemental",
                    },
                    {
                      value: "BASICA_MEDIA",
                      label: "Básica Media",
                    },
                    {
                      value: "BASICA_SUPERIOR",
                      label: "Básica Superior",
                    },
                    {
                      value: "BACHILLERATO",
                      label: "Bachillerato",
                    },
                    {
                      value: "NO_ESCOLARIZADO",
                      label: "No Escolarizado",
                    },
                  ]}
                />
              </div>
              <div>
                <Label className="mb-1.5 text-xs">
                  Año de apertura de ficha
                </Label>

                <input
                  type="number"
                  value={anioFicha}
                  onChange={(e) => setAnioFicha(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 dark:border-gray-700 dark:bg-gray-900"
                />
              </div>
              <div>
                <Label className="mb-1.5 text-xs">
                  Área atendida
                </Label>

                <Select
                  value={areaAtendida}
                  onChange={(value) => setAreaAtendida(value)}
                  placeholder="Seleccione el área atendida"
                  options={[
                    {
                      value: "educativa",
                      label: "Educativa",
                    },
                    {
                      value: "clinica",
                      label: "Clínica",
                    },
                    {
                      value: "fonoaudiologia",
                      label: "Fonoaudiología",
                    },
                    {
                      value: "trabajo_social",
                      label: "Trabajo Social",
                    },
                    {
                      value: "clinica_historia",
                      label: "Historia Clínica",
                    },
                  ]}
                />
              </div>
            </div>
          </FilterDropdown>
        </div>

        {cargando ? (
          <p className="py-8 text-center text-gray-400">
            Cargando pacientes...
          </p>
        ) : filtrados.length === 0 ? (
          <p className="py-8 text-center text-gray-400">
            No se encontraron pacientes
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Nombre
                  </th>

                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Cédula
                  </th>

                  <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                  >
                    <td className="py-3 text-gray-800 dark:text-gray-200">
                      {p.nombresApellidos}
                    </td>

                    <td className="py-3 text-gray-500 dark:text-gray-400">
                      {p.cedula}
                    </td>

                    <td className="py-3">
                      <button
                        onClick={() =>
                          navigate(`/fichas/informes/${p.id}`)
                        }
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