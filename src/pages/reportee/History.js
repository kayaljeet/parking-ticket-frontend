"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import AnimatedList from '../../components/ui/AnimatedList';

const BASE = process.env.REACT_APP_SERVER_BASE_URL || '/parking-ticket/api';

export default function ReporteeHistory() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState(false);
  
  // Pagination, search and sort states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const fetchData = useCallback(() => {
    if (firstLoad) setLoading(true);
    const order = sortConfig.direction === 'ascending' ? 'asc' : 'desc';
    axios.get(`${BASE}/reportee/completed`, {
      params: {
        page,
        limit: 10,
        search: debouncedSearch,
        sortBy: sortConfig.key,
        sortOrder: order
      }
    })
    .then((res) => {
      setChallans(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setError(false);
    })
    .catch(() => setError(true))
    .finally(() => {
      setLoading(false);
      setFirstLoad(false);
    });
  }, [page, debouncedSearch, sortConfig, firstLoad]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setPage(1);
  };

  const listItems = React.useMemo(() => {
    return challans.map((c, i) => {
      const globalIndex = (page - 1) * 10 + i + 1;
      return (
        <div key={c._id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full text-left">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center bg-gray-150 text-gray-700 font-bold w-8 h-8 rounded-full text-sm shrink-0">
              {globalIndex}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-800 text-base">{c.registration_plate}</span>
                {c.token_id && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">Token: {c.token_id}</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1"><strong>Location:</strong> {c.layout}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mt-1 flex-wrap">
                <span>Time: {new Date(c.created_at).toLocaleString()}</span>
                <span>Complainee: {c.phone?.startsWith('whatsapp:') ? c.phone.slice(9) : c.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-left md:text-right text-xs md:text-sm">
              {c.challan_amount && <div className="text-blue-600 font-semibold mt-0.5">Amount: ₹{c.challan_amount}</div>}
              <div className="text-xs text-gray-400 mt-0.5">Reviewed: {c.last_reviewed_by || 'N/A'} ({c.last_modified ? new Date(c.last_modified).toLocaleDateString() : 'N/A'})</div>
            </div>
          </div>
        </div>
      );
    });
  }, [challans, page]);

  const SortIcon = ({ col }) => (
    <ChevronDown className={`inline ml-1 h-4 w-4 ${sortConfig.key === col && sortConfig.direction === 'ascending' ? 'rotate-180' : ''}`} />
  );

  if (loading) return (
    <div className="bg-white rounded-3xl flex-grow flex items-center justify-center p-4 md:p-6">
      <p className="text-xl font-semibold">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-3xl flex-grow flex items-center justify-center p-4 md:p-6">
      <p className="text-xl font-semibold text-red-500">Error loading data. Please try again later.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl flex-grow flex flex-col p-4 md:p-6 min-h-0 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 md:mb-6 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left">Challan History</h1>
        <div className="w-full md:w-72">
          <Input
            placeholder="Search name, phone, plate..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-2xl"
          />
        </div>
      </div>
      <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
        {/* Sorting Control Header */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 rounded-2xl border border-gray-100 flex-shrink-0 text-sm">
          <span className="text-gray-500 font-medium ml-2">Sort by:</span>
          {[
            ['registration_plate', 'Vehicle ID'],
            ['created_at', 'Time'],
            ['status', 'Status'],
            ['challan_amount', 'Amount'],
            ['layout', 'Location']
          ].map(([col, label]) => (
            <button
              key={col}
              onClick={() => requestSort(col)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                sortConfig.key === col
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {label}
              {sortConfig.key === col && (
                <SortIcon col={col} />
              )}
            </button>
          ))}
        </div>

        <div className="flex-grow min-h-0 overflow-hidden">
          <AnimatedList
            items={listItems}
            showGradients={true}
            enableArrowNavigation={true}
            displayScrollbar={true}
            className="h-full"
          />
        </div>

        {/* Pagination Footer */}
        <div className="flex justify-between items-center mt-4 p-2 bg-gray-50 rounded-2xl border border-gray-100 flex-shrink-0 text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-gray-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
