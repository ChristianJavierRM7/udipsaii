import { useEffect, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

import { useLocation } from "react-router";
import { useTheme } from "../../context/ThemeContext";

export default function LegacyTestsWrapper() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();
  const { theme } = useTheme();
  const isHistorial = location.pathname.includes("historial");

  useEffect(() => {
    const handleIframeLoad = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        console.log("Legacy Iframe cargado correctamente.");
        // Sincronizar tema inicial
        iframeRef.current.contentWindow.postMessage({ type: 'SYNC_THEME', theme }, '*');
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad);
    }
    return () => {
      if (iframe) {
        iframe.removeEventListener("load", handleIframeLoad);
      }
    };
  }, []);

  // Enviar el tema actualizado cuando cambie en React
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'SYNC_THEME', theme }, '*');
    }
  }, [theme]);

  return (
    <>
      <PageMeta
        title="Evaluación Psicométrica (Legacy) | UDIPSAI"
        description="Sistema heredado para evaluaciones WISC y WPPSI"
      />
      <PageBreadcrumb pageTitle="Evaluación WISC-WPPSI" />
      
      <div className="w-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm" style={{ height: "calc(100vh - 180px)" }}>
        <iframe
          key={location.pathname}
          ref={iframeRef}
          src={isHistorial ? "/legacy/index.html#historial" : "/legacy/index.html"}
          title="Legacy Tests Dashboard"
          className="w-full h-full border-none"
        />
      </div>
    </>
  );
}
