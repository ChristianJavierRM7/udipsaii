interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

const ViviendaHabitabilidadForm = ({ data, onChange }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Ejemplo de uso */}
      <input
        value={data.materialParedes || ""}
        onChange={(e) => onChange("materialParedes", e.target.value)}
        className="border p-2"
        placeholder="Material de paredes"
      />
    </div>
  );
};

export default ViviendaHabitabilidadForm;