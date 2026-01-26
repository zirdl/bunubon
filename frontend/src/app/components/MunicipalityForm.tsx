import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProgressTracker, ProgressCheckpoint } from './ProgressTracker';

export interface MunicipalityData {
  id: string;
  name: string;
  tctCloaTotal: number;
  tctCloaProcessed: number;
  tctEpTotal: number;
  tctEpProcessed: number;
  status: 'active' | 'inactive';
  checkpoints: ProgressCheckpoint[];
  notes: string;
  district: number; // 1 for District 1, 2 for District 2
  isPredefined: boolean; // Indicates if this is one of the predefined municipalities
}

interface MunicipalityFormProps {
  municipality?: MunicipalityData;
  onSubmit: (data: MunicipalityData) => void;
  onCancel: () => void;
}

export function MunicipalityForm({ municipality, onSubmit, onCancel }: MunicipalityFormProps) {
  const [formData, setFormData] = useState<MunicipalityData>(
    municipality || {
      id: '',
      name: '',
      tctCloaTotal: 0,
      tctCloaProcessed: 0,
      tctEpTotal: 0,
      tctEpProcessed: 0,
      status: 'active',
      checkpoints: [
        { id: '1', label: 'Initial Documentation Completed', completed: false },
        { id: '2', label: 'Final Processing & Release', completed: false },
      ],
      notes: '',
      district: 1,
      isPredefined: false,
    }
  );

  useEffect(() => {
    if (municipality) {
      setFormData(municipality);
    }
  }, [municipality]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCheckpointToggle = (checkpointId: string) => {
    setFormData(prev => ({
      ...prev,
      checkpoints: prev.checkpoints.map(cp =>
        cp.id === checkpointId ? { ...cp, completed: !cp.completed } : cp
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 overscroll-contain">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="sticky top-0 bg-emerald-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-white">{formData.name} - Record Details</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <h3 className="text-emerald-800 mb-2">Title Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">SPLIT Total:</span>
                  <span className="font-medium">{formData.tctCloaTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SPLIT Released:</span>
                  <span className="font-medium">{formData.tctCloaProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mother CCLOA Total:</span>
                  <span className="font-medium">{formData.tctEpTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mother CCLOA Released:</span>
                  <span className="font-medium">{formData.tctEpProcessed}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-200">
                  <span className="text-gray-600 font-medium">Total Titles:</span>
                  <span className="font-medium">{formData.tctCloaTotal + formData.tctEpTotal}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                District
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed">
                {formData.district}
              </div>
            </div>


            <div className="md:col-span-2 border-t pt-4">
              <h3 className="mb-4">Documentation Progress</h3>
              <ProgressTracker
                checkpoints={formData.checkpoints}
                onToggle={handleCheckpointToggle}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-lg hover:from-emerald-800 hover:to-emerald-900 transition-colors shadow-md"
            >
              {municipality ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}