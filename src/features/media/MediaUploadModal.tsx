import React, { useState } from 'react';
import { mediaService, type Photograph } from '../../services/media.service';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  linkType: 'CASE' | 'POSTMORTEM';
  linkId: number;
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({ isOpen, onClose, onUploadSuccess, linkType, linkId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isPhoto, setIsPhoto] = useState(true);
  const [formData, setFormData] = useState<Partial<Photograph>>({
    captureDate: new Date().toISOString().split('T')[0]
  });
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload');

    setUploading(true);
    try {
      const dataToSubmit: Partial<Photograph> = {
        ...formData,
        ...(linkType === 'CASE' ? { mlefId: linkId } : { pmSerialNo: linkId })
      };

      if (isPhoto) {
        await mediaService.uploadPhotograph(file, dataToSubmit);
      } else {
        await mediaService.uploadMedia(file, dataToSubmit);
      }
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Panel */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 overflow-hidden z-10">
        <form onSubmit={handleUpload}>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Upload Digital Evidence</h3>
              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">File</label>
                  <input 
                    type="file" 
                    required 
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="isPhoto"
                    type="checkbox"
                    checked={isPhoto}
                    onChange={(e) => setIsPhoto(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPhoto" className="ml-2 block text-sm text-gray-900">
                    This is a Photograph
                  </label>
                </div>

                {isPhoto && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Capture Date</label>
                      <input type="date" value={formData.captureDate || ''} onChange={e => setFormData({...formData, captureDate: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input type="text" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                  </>
                )}

              </div>
            </div>
            
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button disabled={uploading} type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm">
                Cancel
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};
