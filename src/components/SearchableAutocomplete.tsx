import React, { useState, useEffect, useRef } from 'react';
import { searchService, type SearchResult } from '../services/search.service';

interface SearchableAutocompleteProps {
  type: 'CASE' | 'POSTMORTEM';
  value: number | undefined;
  onChange: (id: number | undefined) => void;
  placeholder?: string;
}

export const SearchableAutocomplete: React.FC<SearchableAutocompleteProps> = ({ type, onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect for debounced search
  useEffect(() => {
    if (!query || selectedLabel === query) {
      setResults([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        if (type === 'CASE') {
          setResults(await searchService.searchCases(query));
        } else {
          setResults(await searchService.searchPostmortems(query));
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, type, selectedLabel]);

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        placeholder={placeholder || `Search for a ${type.toLowerCase()}...`}
        value={selectedLabel || query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedLabel('');
          onChange(undefined);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {loading && <div className="absolute right-3 top-2.5 text-gray-400">
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>}
      
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {results.map((result) => (
            <li
              key={result.id}
              className="relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white text-gray-900"
              onClick={() => {
                setSelectedLabel(result.label);
                onChange(result.id);
                setIsOpen(false);
              }}
            >
              <span className="block truncate font-medium">{result.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
