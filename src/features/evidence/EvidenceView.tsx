import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { evidenceService, type ForensicSample, type ChainOfCustody } from '../../services/evidence.service';

export const EvidenceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sample, setSample] = useState<ForensicSample | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState<Partial<ChainOfCustody>>({
    deliveryDate: new Date().toISOString().split('T')[0],
    jmoSignatureStatus: false,
    acceptedDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (id) {
      fetchSample();
    }
  }, [id]);

  const fetchSample = async () => {
    try {
      const data = await evidenceService.getSampleById(Number(id));
      setSample(data);
    } catch (error) {
      console.error('Failed to fetch sample', error);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await evidenceService.logCustodyTransfer(Number(id), transferData as ChainOfCustody);
      setShowTransferModal(false);
      fetchSample();
    } catch (error) {
      console.error('Transfer failed', error);
      alert('Failed to log transfer');
    }
  };

  if (!sample) return <div className="p-8">Loading...</div>;

  return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Sample #{sample.sampleId} - {sample.specimenType}
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link to="/evidence" className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Back to List
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Chain of Custody Timeline</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Immutable record of custody transfers.</p>
            </div>
            <button
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Log Transfer
            </button>
          </div>
          <div className="border-t border-gray-200 p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {sample.chainOfCustody && sample.chainOfCustody.length > 0 ? sample.chainOfCustody.map((chain, eventIdx) => (
                  <li key={chain.custodyId || eventIdx}>
                    <div className="relative pb-8">
                      {eventIdx !== sample.chainOfCustody!.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Delivered by <span className="font-medium text-gray-900">{chain.deliveredByName}</span> to <span className="font-medium text-gray-900">{chain.acceptedByName}</span>
                            </p>
                            {chain.deliveredByOccupation && <p className="mt-1 text-sm text-gray-600">Occupation: {chain.deliveredByOccupation}</p>}
                            <p className="mt-1 text-xs text-gray-500">JMO Signature: {chain.jmoSignatureStatus ? 'Signed' : 'Pending'}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={chain.deliveryDate}>{new Date(chain.deliveryDate).toLocaleDateString()}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )) : <p className="text-gray-500 italic">No transfers logged yet.</p>}
              </ul>
            </div>
          </div>
        </div>

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowTransferModal(false)}></div>
            
            {/* Modal Body */}
            <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl w-full max-w-lg sm:p-6 max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleTransfer}>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Log Custody Transfer</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivered By (Name)</label>
                        <input type="text" required value={transferData.deliveredByName || ''} onChange={e => setTransferData({...transferData, deliveredByName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivered By (NIC)</label>
                        <input type="text" value={transferData.deliveredByNic || ''} onChange={e => setTransferData({...transferData, deliveredByNic: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivered By (Occupation)</label>
                        <input type="text" value={transferData.deliveredByOccupation || ''} onChange={e => setTransferData({...transferData, deliveredByOccupation: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                        <input type="date" required value={transferData.deliveryDate || ''} onChange={e => setTransferData({...transferData, deliveryDate: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Time</label>
                        <input type="time" value={transferData.deliveryTime || ''} onChange={e => setTransferData({...transferData, deliveryTime: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Accepted By (Name)</label>
                        <input type="text" required value={transferData.acceptedByName || ''} onChange={e => setTransferData({...transferData, acceptedByName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Accepted Date</label>
                        <input type="date" required value={transferData.acceptedDate || ''} onChange={e => setTransferData({...transferData, acceptedDate: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div className="flex items-center mt-4">
                        <input type="checkbox" id="jmoSignatureStatus" checked={transferData.jmoSignatureStatus || false} onChange={e => setTransferData({...transferData, jmoSignatureStatus: e.target.checked})} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label htmlFor="jmoSignatureStatus" className="ml-2 block text-sm text-gray-900">JMO Signature Status</label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm">
                      Log Transfer
                    </button>
                    <button type="button" onClick={() => setShowTransferModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};
