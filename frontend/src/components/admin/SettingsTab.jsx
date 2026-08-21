import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const SettingsTab = () => {
  const [dropdowns, setDropdowns] = useState({
    currentEducation: [],
    preferredDepartment: [],
    internshipMode: [],
    duration: []
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected field to manage options
  const [selectedField, setSelectedField] = useState('preferredDepartment');

  // New option form
  const [newVal, setNewVal] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fieldsConfig = {
    currentEducation: {
      title: 'Current Education Levels',
      placeholderVal: 'e.g. Masters',
      placeholderLabel: 'e.g. Masters Degree',
      valDescription: 'Store value for the education level.'
    },
    preferredDepartment: {
      title: 'Preferred Departments',
      placeholderVal: 'e.g. MARKETING',
      placeholderLabel: 'e.g. Marketing',
      valDescription: 'Department code name (uppercase suggested, e.g. MARKETING).'
    },
    duration: {
      title: 'Internship Durations',
      placeholderVal: 'e.g. 16',
      placeholderLabel: 'e.g. 16 Weeks',
      valDescription: 'Numeric duration of the internship in weeks (must be an integer).'
    }
  };

  const fetchDropdowns = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/dropdowns');
      setDropdowns(res.data.data);
    } catch (err) {
      console.error('Fetch dropdowns failed:', err);
      setErrorMsg('Failed to load form dropdown settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const handleAddOption = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newVal.trim() || !newLabel.trim()) {
      setErrorMsg('Value and label are required.');
      return;
    }

    if (selectedField === 'duration') {
      const parsed = parseInt(newVal, 10);
      if (isNaN(parsed) || String(parsed) !== newVal.trim()) {
        setErrorMsg('For Internship Durations, the value must be a valid integer.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post('/dropdowns', {
        field: selectedField,
        value: newVal.trim(),
        label: newLabel.trim()
      });
      setSuccessMsg(`Option "${newLabel}" added successfully.`);
      setNewVal('');
      setNewLabel('');
      await fetchDropdowns();
    } catch (err) {
      console.error('Add option failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to add option.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOption = async (id, label) => {
    if (!window.confirm(`Are you sure you want to delete the option "${label}"?`)) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.delete(`/dropdowns/${id}`);
      setSuccessMsg(`Option "${label}" deleted successfully.`);
      await fetchDropdowns();
    } catch (err) {
      console.error('Delete option failed:', err);
      setErrorMsg('Failed to delete dropdown option.');
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="bg-white border border-green-500 rounded-xl p-4 text-green-600 text-sm font-bold shadow-sm animate-fade-in">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-white border border-red-500 rounded-xl p-4 text-red-600 text-sm font-bold shadow-sm flex items-center space-x-2 animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Dropdown Type Select List (Horizontal Tabs at Top) */}
      <div className="glass-panel p-6 border-slate-900 bg-slate-900/30 space-y-4 h-fit">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Select Dropdown Menu</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(fieldsConfig).map((fieldKey) => (
            <button
              key={fieldKey}
              onClick={() => {
                setSelectedField(fieldKey);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`tab-btn w-full text-left px-5 py-4 rounded-2xl font-bold transition-all duration-150 cursor-pointer flex flex-col border shadow-sm ${selectedField === fieldKey
                ? 'bg-white border-2 border-red-500 text-black'
                : 'bg-white border border-black/60 text-black'
                }`}
            >
              <span className="text-sm tracking-wide">{fieldsConfig[fieldKey].title}</span>
              <span className="text-[11px] bg-yellow-300 text-black px-3 py-1 rounded-full font-extrabold w-fit mt-2.5 border border-black/10 shadow-sm">
                {dropdowns[fieldKey]?.length || 0} options
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Current Options Directory */}
        <div className="glass-panel p-6 border-slate-900 bg-slate-900/30 lg:col-span-1">
          <h4 className="text-lg font-bold text-slate-100 mb-4">Current Options List</h4>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
              <span className="text-slate-400 text-xs font-semibold">Loading options...</span>
            </div>
          ) : dropdowns[selectedField]?.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-8">No options configured. The form select dropdown will be empty.</p>
          ) : (
            <div className="overflow-hidden border border-slate-850 rounded-xl divide-y divide-slate-850 bg-slate-950/20">
              {dropdowns[selectedField]?.map((opt) => (
                <div key={opt.id} className="flex justify-between items-center py-3 px-4 hover:bg-slate-900/10">
                  <div className="flex items-center space-x-6 min-w-0 pr-4">
                    <div className="min-w-0">
                      <span className="text-slate-200 text-sm font-semibold block">{opt.label}</span>
                      <span className="text-slate-400 text-xs flex items-center gap-2 mt-1.5 font-medium">
                        Value code:
                        <code className="bg-yellow-300 text-black px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] border border-black/10 shadow-sm">
                          {opt.value}
                        </code>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteOption(opt.id, opt.label)}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50/10 transition-all cursor-pointer"
                    title="Delete Option"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Add Option Form */}
        <div className="glass-panel p-6 border-slate-900 bg-slate-900/30 lg:col-span-2 h-fit">
          <h4 className="text-lg font-bold text-slate-100 mb-4">Add Option to {fieldsConfig[selectedField].title}</h4>
          <form onSubmit={handleAddOption} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1.5" htmlFor="optVal">
                  Option Value
                </label>
                <input
                  id="optVal"
                  type="text"
                  required
                  placeholder={fieldsConfig[selectedField].placeholderVal}
                  className="w-full bg-white text-slate-950 border border-slate-300 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-all"
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                />
                <p className="text-[11px] text-slate-200 mt-1.5 leading-relaxed min-h-[30px]">{fieldsConfig[selectedField].valDescription}</p>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1.5" htmlFor="optLabel">
                  Display Label
                </label>
                <input
                  id="optLabel"
                  type="text"
                  required
                  placeholder={fieldsConfig[selectedField].placeholderLabel}
                  className="w-full bg-white text-slate-950 border border-slate-300 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-all"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <p className="text-[11px] text-slate-200 mt-1.5 leading-relaxed min-h-[30px]">What users see in the dropdown.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-[40%] py-2.5 flex justify-center items-center gap-2 font-bold tracking-wider uppercase text-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Option...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Option
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
