import { useState, useCallback } from "react";

interface SectionState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

interface UseSectionVisibilityReturn {
  sections: Record<string, boolean>;
  getSectionState: (key: string) => SectionState;
  openSection: (key: string) => void;
  closeSection: (key: string) => void;
  toggleSection: (key: string) => void;
  openAllSections: () => void;
  closeAllSections: () => void;
  getOpenSectionsCount: () => number;
}

export const useSectionVisibility = (
  initialSections: Record<string, boolean> = {}
): UseSectionVisibilityReturn => {
  const initialState: Record<string, boolean> = {};
  Object.keys(initialSections).forEach((key) => {
    initialState[key] = initialSections[key] || false;
  });

  const [sections, setSections] = useState<Record<string, boolean>>(initialState);

  const getSectionState = useCallback(
    (key: string): SectionState => ({
      isOpen: sections[key] || false,
      setIsOpen: (open: boolean) => {
        setSections((prev) => ({ ...prev, [key]: open }));
      },
      toggle: () => {
        setSections((prev) => ({ ...prev, [key]: !prev[key] }));
      },
    }),
    [sections]
  );

  const openSection = useCallback((key: string) => {
    setSections((prev) => ({ ...prev, [key]: true }));
  }, []);

  const closeSection = useCallback((key: string) => {
    setSections((prev) => ({ ...prev, [key]: false }));
  }, []);

  const toggleSection = useCallback((key: string) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const openAllSections = useCallback(() => {
    const allOpen: Record<string, boolean> = {};
    Object.keys(sections).forEach((key) => {
      allOpen[key] = true;
    });
    setSections(allOpen);
  }, [sections]);

  const closeAllSections = useCallback(() => {
    const allClosed: Record<string, boolean> = {};
    Object.keys(sections).forEach((key) => {
      allClosed[key] = false;
    });
    setSections(allClosed);
  }, [sections]);

  const getOpenSectionsCount = useCallback(() => {
    return Object.values(sections).filter(Boolean).length;
  }, [sections]);

  return {
    sections,
    getSectionState,
    openSection,
    closeSection,
    toggleSection,
    openAllSections,
    closeAllSections,
    getOpenSectionsCount,
  };
};

export const useSingleSectionToggle = (
  initialOpen: string | null = null
): [string | null, (section: string | null) => void] => {
  const [openSection, setOpenSection] = useState<string | null>(initialOpen);

  const toggle = useCallback((section: string | null) => {
    setOpenSection((prev) => (prev === section ? null : section));
  }, []);

  return [openSection, toggle];
};