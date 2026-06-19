import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import FormularioInformeSocial from "../../../components/form/fichas-form/FormularioInformeSocial";

export default function NuevaInformeSocial() {
  return (
    <>
      <PageMeta
        title="Nuevo Informe Social | Udipsai"
        description="Crear un nuevo informe social"
      />
      <PageBreadcrumb
        pageTitle="Nuevo Informe Social"
        items={[
          { label: "Inicio", path: "/" },
          { label: "Fichas", path: "/fichas?tab=informe_social" },
          { label: "Nuevo Informe Social" },
        ]}
      />
      <FormularioInformeSocial />
    </>
  );
}
