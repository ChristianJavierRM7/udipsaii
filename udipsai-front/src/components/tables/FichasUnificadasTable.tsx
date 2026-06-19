import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import {
  Pencil,
  Trash,
  FileText,
  Activity,
  Brain,
  Ear,
  Eye,
  Home,
  ClipboardList,
  Users,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableLoading,
  TableEmpty,
} from "../ui/table";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { DeleteModal } from "../ui/modal/DeleteModal";
import { TableActionHeader } from "../common/TableActionHeader";

import { HistoriaClinicaViewModal } from "../modals/HistoriaClinicaViewModal";
import { PsicologiaEducativaViewModal } from "../modals/PsicologiaEducativaViewModal";
import { PsicologiaClinicaViewModal } from "../modals/PsicologiaClinicaViewModal";

import { FonoaudiologiaViewModal } from "../modals/FonoaudiologiaViewModal";
import { SocioEconomicoViewModal } from "../modals/SocioEconomicoViewModal";
import { SeguimientoSocialViewModal } from "../modals/SeguimientoSocialViewModal";
import { InformeSocialViewModal } from "../modals/InformeSocialViewModal";
import { InformeSocialDeleteModal } from "../modals/InformeSocialDeleteModal";
import { SocioEconomicoDeleteModal } from "../modals/SocioEconomicoDeleteModal";

import { useAuth } from "../../context/AuthContext";
import { fichasService } from "../../services/fichas";
import { pacientesService } from "../../services";

interface FichaListDTO {
  id: number;
  paciente?: {
    id: number;
    nombresApellidos: string;
    cedula: string;
    email: string;
  };
  pacienteId?: number;
  pacienteNombre?: string;
  pacienteCedula?: string;
  activo: boolean;
}

type TabKey =
  | "historia_clinica"
  | "psicologia_educativa"
  | "psicologia_clinica"
  | "fonoaudiologia"
  | "socioeconomico"
  | "seguimiento_social"
  | "informe_social";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  fetch: () => Promise<FichaListDTO[]>;
  delete: (id: number) => Promise<void>;
  editPath: string;
  createPath: string;
  permEdit: string;
  permCreate: string;
  permDelete: string;
  permRead: string;
  title: string;
}

export default function FichasUnificadasTable() {
  const navigate = useNavigate();
  const { hasPermission, userRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs: TabConfig[] = [
    {
      key: "historia_clinica",
      label: "Historia Clínica",
      icon: FileText,
      fetch: fichasService.listarHistoriaClinica,
      delete: fichasService.eliminarHistoriaClinica,
      editPath: "/fichas/historia-clinica/editar",
      createPath: "/fichas/historia-clinica/nuevo",
      permEdit: "PERM_HISTORIA_CLINICA_EDITAR",
      permCreate: "PERM_HISTORIA_CLINICA_CREAR",
      permDelete: "PERM_HISTORIA_CLINICA_ELIMINAR",
      permRead: "PERM_HISTORIA_CLINICA",
      title: "Historia Clínica",
    },
    {
      key: "psicologia_educativa",
      label: "Psicología Educativa",
      icon: Activity,
      fetch: fichasService.listarPsicologiaEducativa,
      delete: fichasService.eliminarPsicologiaEducativa,
      editPath: "/fichas/psicologia-educativa/editar",
      createPath: "/fichas/psicologia-educativa/nuevo",
      permEdit: "PERM_PSICOLOGIA_EDUCATIVA_EDITAR",
      permCreate: "PERM_PSICOLOGIA_EDUCATIVA_CREAR",
      permDelete: "PERM_PSICOLOGIA_EDUCATIVA_ELIMINAR",
      permRead: "PERM_PSICOLOGIA_EDUCATIVA",
      title: "Psicología Educativa",
    },
    {
      key: "psicologia_clinica",
      label: "Psicología Clínica",
      icon: Brain,
      fetch: fichasService.listarPsicologiaClinica,
      delete: fichasService.eliminarPsicologiaClinica,
      editPath: "/fichas/psicologia-clinica/editar",
      createPath: "/fichas/psicologia-clinica/nuevo",
      permEdit: "PERM_PSICOLOGIA_CLINICA_EDITAR",
      permCreate: "PERM_PSICOLOGIA_CLINICA_CREAR",
      permDelete: "PERM_PSICOLOGIA_CLINICA_ELIMINAR",
      permRead: "PERM_PSICOLOGIA_CLINICA",
      title: "Psicología Clínica",
    },
    {
      key: "fonoaudiologia",
      label: "Fonoaudiología",
      icon: Ear,
      fetch: fichasService.listarFonoaudiologia,
      delete: fichasService.eliminarFonoaudiologia,
      editPath: "/fichas/fonoaudiologia/editar",
      createPath: "/fichas/fonoaudiologia/nuevo",
      permEdit: "PERM_FONOAUDIOLOGIA_EDITAR",
      permCreate: "PERM_FONOAUDIOLOGIA_CREAR",
      permDelete: "PERM_FONOAUDIOLOGIA_ELIMINAR",
      permRead: "PERM_FONOAUDIOLOGIA",
      title: "Fonoaudiología",
    },
    {
      key: "socioeconomico",
      label: "Socioeconómico",
      icon: Home,
      fetch: fichasService.listarSocioEconomico,
      delete: fichasService.eliminarSocioEconomico,
      editPath: "/fichas/socioeconomico/editar",
      createPath: "/fichas/socioeconomico/nuevo",
      permEdit: "PERM_SOCIOECONOMICA_EDITAR",
      permCreate: "PERM_SOCIOECONOMICA_CREAR",
      permDelete: "PERM_SOCIOECONOMICA_ELIMINAR",
      permRead: "PERM_SOCIOECONOMICA",
      title: "Socioeconómico",
    },
    {
      key: "seguimiento_social",
      label: "Seguimiento Social",
      icon: ClipboardList,
      fetch: fichasService.listarSeguimientoSocial,
      delete: fichasService.eliminarSeguimientoSocial,
      editPath: "/fichas/seguimiento-social/editar",
      createPath: "/fichas/seguimiento-social/nuevo",
      permEdit: "PERM_SEGUIMIENTO_SOCIAL_EDITAR",
      permCreate: "PERM_SEGUIMIENTO_SOCIAL_CREAR",
      permDelete: "PERM_SEGUIMIENTO_SOCIAL_ELIMINAR",
      permRead: "PERM_SEGUIMIENTO_SOCIAL",
      title: "Seguimiento Social",
    },
    {
      key: "informe_social",
      label: "Informe Social",
      icon: FileText,
      fetch: fichasService.listarInformeSocial,
      delete: fichasService.eliminarInformeSocial,
      editPath: "/fichas/informe-social/editar",
      createPath: "/fichas/informe-social/nuevo",
      permEdit: "PERM_INFORME_SOCIAL_EDITAR",
      permCreate: "PERM_INFORME_SOCIAL_CREAR",
      permDelete: "PERM_INFORME_SOCIAL_ELIMINAR",
      permRead: "PERM_INFORME_SOCIAL",
      title: "Informe Social",
    }
  ];

  const getNormalizedTab = (tabStr: string | null): TabKey => {
    if (!tabStr) return "historia_clinica";
    if (tabStr === "socioeconomica") return "socioeconomico";
    return tabStr as TabKey;
  };

  const isSocialTab = (key: TabKey) =>
    key === "socioeconomico" ||
    key === "seguimiento_social" ||
    key === "informe_social";

  const initialTab = getNormalizedTab(searchParams.get("tab"));
  const [activeTabKey, setActiveTabKey] = useState<TabKey>(initialTab);
  const [fichas, setFichas] = useState<FichaListDTO[]>([]);
  const [assignedPatientIds, setAssignedPatientIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fichaToDelete, setFichaToDelete] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedPacienteId, setSelectedPacienteId] = useState<number | null>(null);
  const [viewHistoriaModalOpen, setViewHistoriaModalOpen] = useState(false);
  const [viewEduModalOpen, setViewEduModalOpen] = useState(false);
  const [viewClinicaModalOpen, setViewClinicaModalOpen] = useState(false);
  const [viewFonoModalOpen, setViewFonoModalOpen] = useState(false);
  const [viewSocioModalOpen, setViewSocioModalOpen] = useState(false);
  const [viewSeguimientoModalOpen, setViewSeguimientoModalOpen] = useState(false);
  const [viewInformeModalOpen, setViewInformeModalOpen] = useState(false);
  const [deleteInformeModalOpen, setDeleteInformeModalOpen] = useState(false);
  const [deleteSocioModalOpen, setDeleteSocioModalOpen] = useState(false);
  const [selectedPacienteNombre, setSelectedPacienteNombre] = useState("");
  const activeTab = tabs.find((t) => t.key === activeTabKey) || tabs[0];


  const isGroupedTab = activeTabKey === "seguimiento_social" || activeTabKey === "informe_social" || activeTabKey === "socioeconomico";

  const handleTabChange = (key: TabKey) => {
    setActiveTabKey(key);
    setSearchParams({ tab: key });
  };

  useEffect(() => {
    const tabFromUrl = getNormalizedTab(searchParams.get("tab"));
    if (tabFromUrl !== activeTabKey) {
      setActiveTabKey(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    loadFichas();
    setSearchTerm("");
  }, [activeTabKey, userRole]);

  const loadFichas = async () => {
    try {
      setLoading(true);
      const data = await activeTab.fetch();
      
      let filteredData = data || [];
      if (userRole === "ROLE_PASANTE") {
        let ids = assignedPatientIds;
        if (ids.size === 0) {
          try {
            const res = await pacientesService.filtrar({}, 0, 1000);
            ids = new Set<number>((res?.content || []).map((p: any) => p.id));
            setAssignedPatientIds(ids);
          } catch (e) {
            console.error("Error fetching assigned patients inside loadFichas:", e);
          }
        }
        filteredData = filteredData.filter((ficha) => {
          const pId = ficha.paciente?.id || ficha.pacienteId;
          return pId && ids.has(pId);
        });
      }
      
      setFichas(filteredData);
    } catch (error) {
      console.error(`Error loading fichas for ${activeTab.label}:`, error);
      toast.error(`Error al cargar las fichas de ${activeTab.label}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (id: number) => {
    navigate(`${activeTab.editPath}/${id}`);
  };

  const handleDeleteClick = (id: number, pId?: number, pNombre?: string) => {
    if (activeTabKey === "informe_social" && pId) {
      setSelectedPacienteId(pId);
      setSelectedPacienteNombre(pNombre || "Paciente");
      setDeleteInformeModalOpen(true);
      return;
    }
    if (activeTabKey === "socioeconomico" && pId) {
      setSelectedPacienteId(pId);
      setSelectedPacienteNombre(pNombre || "Paciente");
      setDeleteSocioModalOpen(true);
      return;
    }
    setFichaToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (fichaToDelete) {
      try {
        await activeTab.delete(fichaToDelete);
        toast.success("Ficha eliminada correctamente");
        loadFichas();
      } catch (error) {
        console.error("Error deleting ficha:", error);
        toast.error("Error al eliminar la ficha");
      } finally {
        setShowDeleteModal(false);
        setFichaToDelete(null);
      }
    }
  };

  const getEstadoBadge = (activo: boolean) => {
    return activo ? "success" : "error";
  };

  const handleViewClick = (pacienteId: number | undefined) => {
    if (!pacienteId) return;
    setSelectedPacienteId(pacienteId);
    // Este Switch sigue abriendo el modal correcto según la pestaña
    switch (activeTabKey) {
      case "historia_clinica":
        setViewHistoriaModalOpen(true);
        break;
      case "psicologia_educativa":
        setViewEduModalOpen(true);
        break;
      case "psicologia_clinica":
        setViewClinicaModalOpen(true);
        break;
      case "fonoaudiologia":
        setViewFonoModalOpen(true);
        break;
      case "socioeconomico":
        setViewSocioModalOpen(true);
        break;
      case "seguimiento_social":
        setViewSeguimientoModalOpen(true);
        break;
      case "informe_social":
        setViewInformeModalOpen(true);
        break;
    }
  };

  // Filtro de búsqueda común para todas las pestañas
  const filteredFichas = fichas.filter((ficha) => {
    const searchLower = searchTerm.toLowerCase();
    const nombreCompleto = (ficha.paciente?.nombresApellidos || ficha.pacienteNombre || "").toLowerCase();
    const cedula = (ficha.paciente?.cedula || ficha.pacienteCedula || "").toLowerCase();
    return nombreCompleto.includes(searchLower) || cedula.includes(searchLower);
  });


  const groupedFichas = isGroupedTab ? Object.values(
    filteredFichas.reduce((acc, ficha) => {
      const pId = ficha.paciente?.id || ficha.pacienteId;
      if (!pId) return acc;

      if (!acc[pId]) {
        acc[pId] = {
          pacienteId: pId,
          pacienteNombre: ficha.paciente?.nombresApellidos || ficha.pacienteNombre || "Sin Nombre",
          pacienteCedula: ficha.paciente?.cedula || ficha.pacienteCedula || "S/N",
          fichasCount: 0,
          latestFicha: ficha
        };
      } else {
        if (ficha.id > acc[pId].latestFicha.id) {
          acc[pId].latestFicha = ficha;
        }
      }
      acc[pId].fichasCount += 1;
      return acc;
    }, {} as Record<number, { pacienteId: number, pacienteNombre: string, pacienteCedula: string, fichasCount: number, latestFicha: FichaListDTO }>)
  ) : [];

  const handleExport = async () => {
    try {
      toast.info("Generando reporte Excel...");
      switch (activeTabKey) {
        case "fonoaudiologia":
          await fichasService.exportarExcelFonoaudiologia();
          break;
        case "historia_clinica":
          await fichasService.exportarExcelHistoriaClinica();
          break;
        case "psicologia_educativa":
          await fichasService.exportarExcelPsicologiaEducativa();
          break;
        case "psicologia_clinica":
          await fichasService.exportarExcelPsicologiaClinica();
          break;
        case "socioeconomico":
          await fichasService.exportarExcelSocioEconomico();
          break;
        case "seguimiento_social":
          await fichasService.exportarExcelSeguimientoSocial();
          break;
        case "informe_social":
          await fichasService.exportartExcelInformeSocial();
          break;
        default:
          toast.warn("Exportación no disponible para esta pestaña");
          return;
      }
      toast.success("Excel descargado correctamente");
    } catch (error) {
      toast.error("Error al exportar el Excel");
    }
  };

  return (
    <div className="space-y-6">
      <TableActionHeader
        title={activeTab.title}
        onSearchClick={setSearchTerm}
        onNew={() => navigate(activeTab.createPath)}
        onExport={hasPermission(activeTab.permRead) ? handleExport : undefined}
        createPermission={activeTab.permCreate} // Colocar el permiso de creación específico para cada pestaña socioeconómico
        newButtonText="Agregar"
      />

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Pestañas Principales */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          {[
            { key: "historia_clinica", label: "Historia Clínica", icon: FileText },
            { key: "psicologia_educativa", label: "Psicología Educativa", icon: Activity },
            { key: "psicologia_clinica", label: "Psicología Clínica", icon: Brain },
            { key: "fonoaudiologia", label: "Fonoaudiología", icon: Ear },
            { key: "trabajo_social", label: "Trabajo Social", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === "trabajo_social" 
              ? isSocialTab(activeTabKey)
              : activeTabKey === tab.key;
            
            const handleClick = () => {
              if (tab.key === "trabajo_social") {
                handleTabChange("socioeconomico");
              } else {
                handleTabChange(tab.key as TabKey);
              }
            };

            return (
              <button
                key={tab.key}
                onClick={handleClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-200 text-sm font-medium ${isActive
                  ? "bg-brand-50 text-brand-600 border-b-2 border-brand-500 dark:bg-white/5 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                  }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub-pestañas de Trabajo Social */}
        {isSocialTab(activeTabKey) && (
          <div className="mb-6 flex flex-wrap gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl w-fit">
            {[
              { key: "socioeconomico", label: "Socioeconómico", icon: Home },
              { key: "seguimiento_social", label: "Seguimiento Social", icon: ClipboardList },
              { key: "informe_social", label: "Informe Social", icon: FileText },
            ].map((subTab) => {
              const SubIcon = subTab.icon;
              const isSubActive = activeTabKey === subTab.key;
              return (
                <button
                  key={subTab.key}
                  onClick={() => handleTabChange(subTab.key as TabKey)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs font-semibold ${isSubActive
                    ? "bg-white text-brand-600 shadow-sm dark:bg-gray-800 dark:text-brand-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    }`}
                >
                  <SubIcon size={14} />
                  {subTab.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader>Nombres del Paciente</TableCell>
                <TableCell isHeader>Cédula</TableCell>

                {isGroupedTab && <TableCell isHeader>Fichas Creadas</TableCell>}
                <TableCell isHeader>Estado</TableCell>
                <TableCell isHeader>Acciones</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="relative min-h-[400px]">
              {loading ? (
                <TableLoading colSpan={isGroupedTab ? 5 : 4} message={`Cargando ${activeTab.label}...`} />
              ) : isGroupedTab ? (
                // --- RENDERIZADO EXCLUSIVO PARA SEGUIMIENTO SOCIAL (AGRUPADO) ---
                groupedFichas.length > 0 ? (
                  groupedFichas.map((group) => (
                    <TableRow key={group.pacienteId}>
                      <TableCell>{group.pacienteNombre}</TableCell>
                      <TableCell>{group.pacienteCedula}</TableCell>
                      <TableCell>
                        <Badge size="sm" color="info">
                          {group.fichasCount} {group.fichasCount === 1 ? (activeTabKey === 'informe_social' ? 'Informe' : 'Ficha') : (activeTabKey === 'informe_social' ? 'Informes' : 'Fichas')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge size="sm" color={getEstadoBadge(group.latestFicha.activo)}>
                          {group.latestFicha.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {hasPermission(activeTab.permRead) && (
                            // El botón ver abre el modal correspondiente
                            <Button size="sm" variant="info" onClick={() => handleViewClick(group.pacienteId)} title="Ver Historial">
                              <Eye size={14} />
                            </Button>
                          )}
                          {hasPermission(activeTab.permEdit) && (
                            <Button size="sm" variant="warning" onClick={() => handleEditClick(group.latestFicha.id)} title="Editar Ficha Reciente">
                              <Pencil size={14} />
                            </Button>
                          )}
                          {hasPermission(activeTab.permDelete) && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteClick(group.latestFicha.id, group.pacienteId, group.pacienteNombre)}
                              title="Eliminar Ficha"
                            >
                              <Trash size={14} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableEmpty colSpan={5} message={`No se encontraron registros de ${activeTab.label}`} />
                )
              ) : (

                filteredFichas.length > 0 ? (
                  filteredFichas.map((ficha) => {
                    const nombre = ficha.paciente?.nombresApellidos || ficha.pacienteNombre || "Sin Nombre";
                    const cedula = ficha.paciente?.cedula || ficha.pacienteCedula || "S/N";
                    const pId = ficha.paciente?.id || ficha.pacienteId;

                    return (
                      <TableRow key={ficha.id}>
                        <TableCell>{nombre}</TableCell>
                        <TableCell>{cedula}</TableCell>
                        <TableCell>
                          <Badge size="sm" color={getEstadoBadge(ficha.activo)}>
                            {ficha.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            {hasPermission(activeTab.permRead) && (

                              <Button size="sm" variant="info" onClick={() => handleViewClick(pId)} title="Ver">
                                <Eye size={14} />
                              </Button>
                            )}
                            {hasPermission(activeTab.permEdit) && (
                              <Button size="sm" variant="warning" onClick={() => handleEditClick(ficha.id)} title="Editar">
                                <Pencil size={14} />
                              </Button>
                            )}
                            {hasPermission(activeTab.permDelete) && (
                              <Button size="sm" variant="danger" onClick={() => handleDeleteClick(ficha.id)} title="Eliminar">
                                <Trash size={14} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableEmpty colSpan={4} message={`No se encontraron registros de ${activeTab.label}`} />
                )
              )}
            </TableBody>
          </Table>
        </div>

        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Confirmar Eliminación"
          description={`¿Está seguro que desea eliminar la ficha de ${activeTab.label}? Esta acción no se puede deshacer.`}
        />


        {selectedPacienteId && (
          <>
            <HistoriaClinicaViewModal
              isOpen={viewHistoriaModalOpen}
              onClose={() => setViewHistoriaModalOpen(false)}
              pacienteId={selectedPacienteId}
            />
            <PsicologiaEducativaViewModal
              isOpen={viewEduModalOpen}
              onClose={() => setViewEduModalOpen(false)}
              pacienteId={selectedPacienteId}
            />
            <PsicologiaClinicaViewModal
              isOpen={viewClinicaModalOpen}
              onClose={() => setViewClinicaModalOpen(false)}
              pacienteId={selectedPacienteId}
            />
            <FonoaudiologiaViewModal
              isOpen={viewFonoModalOpen}
              onClose={() => setViewFonoModalOpen(false)}
              pacienteId={selectedPacienteId}
            />
            <SocioEconomicoViewModal
              isOpen={viewSocioModalOpen}
              onClose={() => setViewSocioModalOpen(false)}
              pacienteId={selectedPacienteId}
            />
            <SeguimientoSocialViewModal
              isOpen={viewSeguimientoModalOpen}
              onClose={() => setViewSeguimientoModalOpen(false)}
              pacienteId={selectedPacienteId}
              modo={"ver"}
            />
            <InformeSocialViewModal
              isOpen={viewInformeModalOpen}
              onClose={() => setViewInformeModalOpen(false)}
              pacienteId={selectedPacienteId}
            />
            {selectedPacienteId && (
              <InformeSocialDeleteModal
                isOpen={deleteInformeModalOpen}
                onClose={() => setDeleteInformeModalOpen(false)}
                pacienteId={selectedPacienteId}
                pacienteNombre={selectedPacienteNombre}
                onDeleted={loadFichas}
              />
            )}
            {selectedPacienteId && (
              <SocioEconomicoDeleteModal
                isOpen={deleteSocioModalOpen}
                onClose={() => setDeleteSocioModalOpen(false)}
                pacienteId={selectedPacienteId}
                pacienteNombre={selectedPacienteNombre}
                onDeleted={loadFichas}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}