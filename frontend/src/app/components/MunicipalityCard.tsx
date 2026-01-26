import { Edit2, MapPin, FileText, CheckCircle, Eye } from 'lucide-react';
import { MunicipalityData } from './MunicipalityForm';

interface MunicipalityCardProps {
  municipality: MunicipalityData;
  readOnly?: boolean;
  onEdit: (municipality: MunicipalityData) => void;
  onDelete?: (id: string) => void;  // Optional since predefined municipalities can't be deleted
  onViewTitles: (municipalityId: string, municipalityName: string) => void;
}

export function MunicipalityCard({ municipality, readOnly, onEdit, onDelete, onViewTitles }: MunicipalityCardProps) {
  const tctCloaPercentage = municipality.tctCloaTotal > 0
    ? (municipality.tctCloaProcessed / municipality.tctCloaTotal) * 100
    : 0;
  const tctEpPercentage = municipality.tctEpTotal > 0
    ? (municipality.tctEpProcessed / municipality.tctEpTotal) * 100
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="p-4">
        {/* Header with name and district */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <h3 className="font-bold text-emerald-800 truncate">{municipality.name}</h3>
            </div>
            <div className="text-xs text-gray-500">
              District {municipality.district}
            </div>
          </div>
          <div className="flex gap-1 ml-2 flex-shrink-0">
            {!readOnly && (
              <button
                onClick={() => onEdit(municipality)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title={municipality.isPredefined ? "Update" : "Edit"}
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-500">Total Titles</div>
            <div className="text-sm font-medium text-gray-900">{municipality.tctCloaTotal + municipality.tctEpTotal}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-500">Released</div>
            <div className="text-sm font-medium text-gray-900">{municipality.tctCloaProcessed + municipality.tctEpProcessed}</div>
          </div>
        </div>

        {/* Title counts - simplified */}
        <div className="space-y-2">
          {/* SPLIT Titles */}
          <div className="bg-emerald-50 p-2 rounded">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs text-emerald-900 font-medium">SPLIT</span>
              </div>
              <span className="text-xs text-emerald-700 font-medium">{tctCloaPercentage.toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{municipality.tctCloaProcessed}/{municipality.tctCloaTotal}</span>
            </div>
          </div>

          {/* Regular */}
          <div className="bg-blue-50 p-2 rounded">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-xs text-blue-900 font-medium">Regular</span>
              </div>
              <span className="text-xs text-blue-700 font-medium">{tctEpPercentage.toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{municipality.tctEpProcessed}/{municipality.tctEpTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action button at the bottom */}
      <div className="mt-auto p-4 pt-0">
        <button
          onClick={() => onViewTitles(municipality.id, municipality.name)}
          className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
}