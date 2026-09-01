import React from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { CustomField } from '../../types';

interface CustomFieldEditorProps {
  customFields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  title?: string;
}

export const CustomFieldEditor: React.FC<CustomFieldEditorProps> = ({
  customFields = [],
  onChange,
  title = "Custom Fields & Dynamic Metadata"
}) => {
  const handleAddField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: '',
      value: '',
      type: 'text'
    };
    onChange([...customFields, newField]);
  };

  const handleUpdateField = (index: number, key: keyof CustomField, val: string) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const handleRemoveField = (index: number) => {
    const updated = customFields.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {title}
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddField}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Field</span>
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        You are not limited by preset fields. Add any custom key-value pairs (e.g., Client, Architecture Pattern, Budget, Demo Video, Note).
      </p>

      {customFields.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-400">
          No custom fields added yet. Click &quot;Add Custom Field&quot; to define custom properties.
        </div>
      ) : (
        <div className="space-y-2.5">
          {customFields.map((field, idx) => (
            <div key={field.id || idx} className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Field Name (e.g., Client, Live Video)"
                value={field.label}
                onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                className="w-full sm:w-1/3 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                placeholder="Value (e.g., Solution Innovation District, https://...)"
                value={field.value}
                onChange={(e) => handleUpdateField(idx, 'value', e.target.value)}
                className="w-full sm:flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveField(idx)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Remove field"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
