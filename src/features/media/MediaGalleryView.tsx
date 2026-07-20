import React, { useEffect, useState } from 'react';
import { mediaService, type MediaAsset } from '../../services/media.service';
import { MediaUploadModal } from './MediaUploadModal';

import { Download, FileText, X } from 'lucide-react';

interface MediaGalleryViewProps {
  linkType: 'CASE' | 'POSTMORTEM';
  linkId: number;
}

export const MediaGalleryView: React.FC<MediaGalleryViewProps> = ({ linkType, linkId }) => {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = linkType === 'CASE' 
        ? await mediaService.getMediaForCase(linkId) 
        : await mediaService.getMediaForPostMortem(linkId);
      setMedia(data);
    } catch (error) {
      console.error('Failed to fetch media', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (linkId) {
      fetchMedia();
    }
  }, [linkId, linkType]);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Digital Evidence & Media</h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Upload Media
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading media...</div>
      ) : media.length === 0 ? (
        <div className="text-gray-500 italic bg-gray-50 p-4 rounded-md">No digital evidence uploaded yet.</div>
      ) : (
        <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {media.map((asset) => (
            <li key={asset.mediaId} className="relative group">
              <div className="block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                {asset.type?.startsWith('image/') || asset.type === 'JPEG' || asset.type === 'PNG' ? (
                  <>
                    <img 
                      src={`http://localhost:8080/uploads/${asset.filePath}`} 
                      alt={asset.fileName || "Evidence"} 
                      className="object-cover w-full h-full cursor-pointer transition-transform group-hover:scale-105" 
                      onClick={() => setSelectedImage(`http://localhost:8080/uploads/${asset.filePath}`)}
                    />
                    <a 
                      href={`http://localhost:8080/uploads/${asset.filePath}`} 
                      download={asset.fileName || asset.filePath}
                      className="absolute top-2 right-2 p-1.5 bg-white bg-opacity-75 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-100 hover:text-blue-600"
                      title="Download Image"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => window.open(`http://localhost:8080/uploads/${asset.filePath}`, '_blank')}>
                    <FileText className="w-12 h-12 text-red-500 mb-2" />
                    <span className="text-xs font-medium text-gray-500 text-center px-2 truncate w-full">{asset.type}</span>
                    <a 
                      href={`http://localhost:8080/uploads/${asset.filePath}`} 
                      download={asset.fileName || asset.filePath}
                      className="absolute top-2 right-2 p-1.5 bg-white bg-opacity-75 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-100 hover:text-blue-600"
                      title="Download File"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
              <p className="mt-2 block text-sm font-medium text-gray-900 truncate" title={asset.fileName || asset.filePath}>
                {asset.fileName || asset.filePath}
              </p>
              {asset.description && (
                <p className="block text-xs font-normal text-gray-600 truncate mt-0.5" title={asset.description}>
                  {asset.description}
                </p>
              )}
              {asset.captureDate && (
                <p className="block text-xs font-normal text-gray-500 truncate mt-0.5" title={asset.captureDate}>
                  Captured: {asset.captureDate}
                </p>
              )}
              <p className="block text-xs font-medium text-gray-500 truncate mt-1">
                ID: {asset.mediaId} • {asset.type?.split('/')[1]?.toUpperCase() || asset.type}
              </p>
            </li>
          ))}
        </ul>
      )}

      <MediaUploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
        onUploadSuccess={fetchMedia} 
        linkType={linkType} 
        linkId={linkId} 
      />

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 sm:p-8" onClick={() => setSelectedImage(null)}>
          <button 
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={selectedImage} 
            alt="Enlarged evidence" 
            className="max-w-full max-h-full object-contain rounded shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
