import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  icon,
  isOpen,
  onToggle,
}) => {
  return (
    <div
      onClick={onToggle}
      className={`cursor-pointer group relative overflow-hidden p-6 rounded-3xl border-2 transition-all duration-500 ${
        isOpen
          ? "border-brand-100 bg-brand-50/20 dark:border-gray-600 dark:bg-gray-800 scale-[1.02]"
          : "border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-600"
      }`}
    >
      <div className="flex items-center gap-5">
        <div
          className={`p-4 rounded-2xl transition-all duration-500 ${
            isOpen
              ? "bg-brand-400 text-white rotate-12 dark:bg-gray-500 dark:text-gray-200"
              : "bg-brand-50 text-brand-500 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;