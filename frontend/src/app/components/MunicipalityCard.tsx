import { Edit2, MapPin, FileText, CheckCircle, Eye } from 'lucide-react';
import { MunicipalityData } from './MunicipalityForm';

interface MunicipalityCardProps {
  municipality: MunicipalityData;
  onEdit: (municipality: MunicipalityData) => void;
  onDelete?: (id: string) => void;  // Optional since predefined municipalities can't be deleted
  onViewTitles: (municipalityId: string, municipalityName: string) => void;
}

export function MunicipalityCard({ municipality, onEdit, onDelete, onViewTitles }: MunicipalityCardProps) {
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
              <h3 className="font-medium text-emerald-700 truncate">{municipality.name}</h3>
            </div>
            <div className="text-xs text-gray-600">
              District {municipality.district}
            </div>
          </div>
          <div className="flex gap-1 ml-2 flex-shrink-0">
            <button
              onClick={() => onEdit(municipality)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title={municipality.isPredefined ? "Update" : "Edit"}
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onViewTitles(municipality.id, municipality.name)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="View Titles"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-emerald-50 p-2 rounded border border-gray-200">
            <div className="text-xs text-gray-600">Total Titles</div>
            <div className="text-sm font-medium text-gray-900">{municipality.tctCloaTotal + municipality.tctEpTotal}</div>
          </div>
          <div className="bg-emerald-50 p-2 rounded border border-gray-200">
            <div className="text-xs text-gray-600">Avg. Processing</div>
            <div className="text-sm font-medium text-gray-900">-- days</div>
          </div>
        </div>

        {/* Title counts */}
        <div className="space-y-3">
          {/* SPLIT Titles (formerly TCT-CLOA) */}
          <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs text-emerald-900 font-medium">SPLIT</span>
              </div>
              <span className="text-xs text-emerald-700 font-medium">{tctCloaPercentage.toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Released: {municipality.tctCloaProcessed}</span>
              <span>Total: {municipality.tctCloaTotal}</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-1.5">
              <div
                className="bg-emerald-700 h-1.5 rounded-full transition-all"
                style={{ width: `${tctCloaPercentage}%` }}
              />
            </div>
          </div>

          {/* Mother CLOA (formerly TCT-EP) */}
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-xs text-blue-900 font-medium">MOTHER</span>
              </div>
              <span className="text-xs text-blue-700 font-medium">{tctEpPercentage.toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Released: {municipality.tctEpProcessed}</span>
              <span>Total: {municipality.tctEpTotal}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${tctEpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status and Alerts */}
        <div className="mt-3 flex justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs text-gray-600">On Track</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-rose-600">0 alerts</span>
          </div>
        </div>
      </div>

      {/* Compact action button at the bottom */}
      <div className="mt-auto p-4 pt-0">
        <button
          onClick={() => onViewTitles(municipality.id, municipality.name)}
          className="w-full py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
}