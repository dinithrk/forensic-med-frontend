import React, { useEffect, useState } from 'react';
import { evidenceService, type ForensicSample } from '../../services/evidence.service';
import { Link } from 'react-router-dom';
import { Loader2, Inbox } from 'lucide-react';

export const EvidenceList: React.FC = () => {
  const [samples, setSamples] = useState<ForensicSample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const data = await evidenceService.getAllSamples();
        setSamples(data);
      } catch (error) {
        console.error('Failed to fetch samples:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSamples();
  }, []);

  return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Evidence & Chain of Custody</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all physical forensic samples registered in the system.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/evidence/new"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Log New Evidence
            </Link>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Sample ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Production No
                  </th>    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Linked To</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500 mb-2" />
                          <p>Loading samples...</p>
                        </td>
                      </tr>
                    ) : samples.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                          <Inbox className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                          <p className="font-medium text-gray-900">No evidence found</p>
                          <p className="mt-1">Get started by logging a new forensic sample.</p>
                        </td>
                      </tr>
                    ) : samples.map((sample) => (
                      <tr key={sample.sampleId}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {sample.sampleId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.specimenType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.collectionDate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.productionNumber || 'None'}
                    </td>    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {sample.caseId ? `Case #${sample.caseId}` : (sample.pmSerialNo ? `PM #${sample.pmSerialNo}` : 'None')}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link to={`/evidence/${sample.sampleId}`} className="text-blue-600 hover:text-blue-900 mr-4">
                            View Chain of Custody
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
