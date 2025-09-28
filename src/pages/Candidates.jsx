import React, { useState, useEffect, useRef, useMemo } from "react";
import { List } from "react-window";
import { Link } from "react-router-dom";
import { apiService } from "../services/api";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  });

  // Filtering logic
  const filterCandidates = React.useCallback(
    (data) => {
      if (!Array.isArray(data)) return [];
      return data.filter((candidate) => {
        if (!candidate || typeof candidate !== "object") return false;

        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const nameMatch = candidate.name?.toLowerCase().includes(searchLower);
          const emailMatch = candidate.email?.toLowerCase().includes(searchLower);
          if (!nameMatch && !emailMatch) return false;
        }

        // Stage filter
        if (stageFilter !== "all") {
          if ((candidate.stage || "").toLowerCase() !== stageFilter.toLowerCase()) return false;
        }

        return true;
      });
    },
    [searchTerm, stageFilter]
  );

  // Container width for react-window
  const listContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const el = listContainerRef.current;
    const updateWidth = () => {
      if (el?.clientWidth) setContainerWidth(el.clientWidth);
      else setContainerWidth(Math.min(window.innerWidth - 64, 1200));
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Load candidates
  const loadCandidates = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.getCandidates({ page: 1, pageSize: 50 });

      // API mock may return { data: [...], pagination: { total } } or { items, total }
      const items = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp?.items)
        ? resp.items
        : Array.isArray(resp)
        ? resp
        : [];

      const total = resp?.pagination?.total ?? resp?.total ?? items.length;

      console.log("✅ Normalized API response:", { itemsLength: items.length, total });

      const cleaned = items.map((c) => ({
        id: c.id ?? "",
        name: String(c.name ?? ""),
        email: String(c.email ?? ""),
        stage: String(c.stage ?? "applied"),
        experience: Number(c.experience ?? 0),
        appliedDate: String(c.appliedDate ?? new Date().toISOString()),
      }));

      setCandidates(cleaned);

      const filteredCount = filterCandidates(cleaned).length;
      setPagination({
        page: 1,
        pageSize: 50,
        total: filteredCount,
        totalPages: Math.max(1, Math.ceil(filteredCount / 50)),
      });
    } catch (err) {
      console.error("❌ Failed to load candidates:", err);
      setError(err.message || "Failed to load candidates");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [filterCandidates]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStageFilterChange = (e) => {
    setStageFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const filteredData = useMemo(
    () => filterCandidates(candidates),
    [candidates, filterCandidates]
  );

  // Strongly normalize filteredData for react-window and compute numeric width
  const safeData = useMemo(() => {
    if (!Array.isArray(filteredData)) return [];
    return filteredData
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: item.id ?? "",
        name: String(item.name ?? ""),
        email: String(item.email ?? ""),
        stage: String(item.stage ?? "applied"),
        experience: Number(item.experience ?? 0),
        appliedDate: String(item.appliedDate ?? new Date().toISOString()),
      }));
  }, [filteredData]);

  const numericWidth = Number(containerWidth) || 1200;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <span className="ml-4 text-gray-500">Loading candidates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <div>{error}</div>
        <button
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
          onClick={loadCandidates}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Candidates</h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Candidates
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Stage
              </label>
              <select
                value={stageFilter}
                onChange={handleStageFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Stages</option>
                <option value="applied">Applied</option>
                <option value="screen">Screening</option>
                <option value="tech">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Showing {pagination.total} candidates (Page {pagination.page} of {pagination.totalPages})
        </div>
      </div>

      <div
        ref={listContainerRef}
        className="bg-white rounded-lg shadow-sm border"
        style={{ height: "600px" }}
      >
        {safeData.length > 0 ? (
          <List
            rowCount={safeData.length}
            rowHeight={90}
            rowComponent={Row}
            rowProps={{ data: safeData }}
            style={{ height: 600, width: numericWidth }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="font-bold mb-2">No candidates found.</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Stage colors
const getStageColor = (stage) => {
  const colors = {
    applied: "bg-blue-100 text-blue-800",
    screen: "bg-yellow-100 text-yellow-800",
    tech: "bg-purple-100 text-purple-800",
    offer: "bg-green-100 text-green-800",
    hired: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };
  return colors[String(stage || "").toLowerCase()] || "bg-gray-100 text-gray-800";
};

// Row renderer
function Row({ index, style, data }) {
  const candidate = data[index];
  if (!candidate) return null;

  return (
    <div key={candidate.id} style={style} className="p-4 border-b border-gray-100">
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center mr-4">
          <span className="text-white font-medium">
            {(candidate.name || "")
              .split(" ")
              .map((n) => (n && n[0] ? n[0] : ""))
              .join("")}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            <Link to={`/candidates/${candidate.id}`} className="hover:text-indigo-600">
              {candidate.name}
            </Link>
          </h3>
          <p className="text-gray-600">{candidate.email}</p>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(
                candidate.stage
              )}`}
            >
              {(candidate.stage || "").charAt(0).toUpperCase() +
                (candidate.stage || "").slice(1)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Experience: {candidate.experience} years</p>
          <p className="text-sm text-gray-500">
            Applied: {new Date(candidate.appliedDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Candidates;
