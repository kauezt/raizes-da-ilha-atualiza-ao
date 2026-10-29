import React from 'react';
import { useApp } from '../context/AppContext';
import { Edit3 } from 'lucide-react';

interface SectionEditBadgeProps {
  tab: string;
  item?: any;
  label?: string;
  className?: string;
}

export const SectionEditBadge: React.FC<SectionEditBadgeProps> = ({
  tab,
  item,
  label = 'Editar esta seção',
  className = '',
}) => {
  const { editMode, openAdminTo } = useApp();

  if (!editMode) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openAdminTo(tab, item);
      }}
      className={`inline-flex items-center gap-1.5 bg-[#c9a56a] hover:bg-[#dcb97c] text-[#1a1208] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-[#1a1208]/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer z-30 uppercase tracking-wider ${className}`}
      title={`Editar tudo em ${label}`}
    >
      <Edit3 size={13} />
      <span>{label}</span>
    </button>
  );
};
