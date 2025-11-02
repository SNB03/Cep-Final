// src/components/Dashboards/IssueCard.jsx
import React, { useState } from 'react';
import Button from '../Common/Button';
import { PotholeIcon, BinIcon } from '../Common/ThemeIcons';
import IssueDetailModal from './IssueDetailModal';
import VerificationUploadModal from './VerificationUploadModal';

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return 'bg-red-500';
    case 'In Progress': return 'bg-yellow-500';
    case 'Awaiting Verification': return 'bg-blue-500';
    case 'Closed': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const IssueCard = ({ issue, isDayTheme, onStatusUpdate }) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const cardBgClass = isDayTheme ? 'bg-white shadow-lg' : 'bg-gray-700 shadow-xl';
  const textClass = isDayTheme ? 'text-gray-800' : 'text-gray-200';
  const locationClass = isDayTheme ? 'text-gray-600' : 'text-gray-400';

  // Calculate priority
  const daysInCurrentStatus = Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const isHighPriority = issue.status === 'Pending' && daysInCurrentStatus > 7;

  // Type-specific colors for text and icons
  const typeColor = issue.issueType === 'pothole' ? 'text-purple-400' : 'text-orange-400';
  // Ensure property name for image is consistent with backend response (issue.issueImageUrl)
  const TypeIcon = issue.issueType === 'pothole' ? PotholeIcon : BinIcon; 

  return (
    <>
      <div className={`p-4 rounded-lg transition-all duration-300 hover:shadow-2xl ${cardBgClass} ${isHighPriority ? 'border-2 border-red-500' : 'border border-transparent'}`}>
        
        {/* Row 1: Status Badge, ID, and Priority Tag */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${getStatusColor(issue.status)} text-white`}>
              {issue.status}
            </span>
            {isHighPriority && (
                <span className="text-xs font-bold text-red-500 mt-1">
                    ! PRIORITY
                </span>
            )}
          </div>
          <span className={`text-sm font-semibold ${textClass}`}>ID: {issue.ticketId}</span>
        </div>
        
        {/* Row 2: Title and Type */}
        <h3 className={`text-lg font-extrabold mb-2 ${isDayTheme ? 'text-gray-900' : 'text-white'}`}>
            {issue.title || `${issue.issueType.charAt(0).toUpperCase() + issue.issueType.slice(1)} Issue`}
        </h3>

        {/* Row 3: Image, Type Icon, and Location */}
        <div className="flex items-center gap-3 mb-2 pb-2 border-b border-dashed border-gray-600">
          {issue.issueImageUrl && ( // Use the correct property name from the API
            <img src={issue.issueImageUrl} alt={issue.title} className="w-16 h-12 rounded object-cover flex-shrink-0 shadow" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-semibold flex items-center ${typeColor}`}>
              <TypeIcon className="w-4 h-4 mr-1" />
              {issue.issueType.charAt(0).toUpperCase() + issue.issueType.slice(1)}
            </p>
            <p className={`text-xs ${locationClass} truncate mt-1`}>
              {/* Placeholder for zone or assignment */}
              {issue.zone ? `Zone: ${issue.zone}` : (issue.assignedTo ? `Assigned to: ${issue.assignedTo}` : 'Awaiting Assignment')}
            </p>
          </div>
        </div>
        
        {/* Row 4: Time and Actions */}
        <div className="flex justify-between items-center pt-2">
            <p className={`text-xs font-medium ${locationClass}`}>
              <span className={`font-bold ${isHighPriority ? 'text-red-500' : typeColor}`}>
                {daysInCurrentStatus} days
              </span> in status
            </p>

            <div className="flex space-x-2">
                {issue.status === 'Pending' && (
                    <Button
                      onClick={() => onStatusUpdate(issue.ticketId, 'In Progress')}
                      className="bg-teal-500 hover:bg-teal-600 text-white py-1 px-3 text-sm"
                    >
                      Assign
                    </Button>
                )}

                {issue.status === 'In Progress' && (
                    // Opens the new upload modal
                    <Button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 text-sm"
                    >
                      Verify Ready
                    </Button>
                )}

                {issue.status === 'Awaiting Verification' && (
                    <p className="text-sm italic text-blue-500 py-1">Waiting for Citizen</p>
                )}

                <Button
                    onClick={() => setIsDetailModalOpen(true)}
                    className={`bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 text-sm`}
                >
                    Details
                </Button>
            </div>
        </div>
      </div>

      {/* 1. Detail Modal */}
      <IssueDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        issue={issue}
        isDayTheme={isDayTheme}
        onStatusUpdate={onStatusUpdate}
      />

      {/* 2. Verification Upload Modal (NEW) */}
      <VerificationUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        issue={issue}
        isDayTheme={isDayTheme}
        onStatusUpdate={onStatusUpdate}
      />
    </>
  );
};

export default IssueCard;