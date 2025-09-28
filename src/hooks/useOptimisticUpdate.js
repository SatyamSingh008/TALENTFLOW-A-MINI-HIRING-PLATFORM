import { useState, useCallback } from 'react';

/**
 * Custom hook for handling optimistic updates with rollback capability
 * @param {Function} updateFn - Function to update the state optimistically
 * @param {Function} apiCall - Function that makes the actual API call
 * @param {Function} rollbackFn - Function to rollback the state on failure
 * @returns {Object} - { execute, isPending, error }
 */
export const useOptimisticUpdate = (updateFn, apiCall, rollbackFn) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setIsPending(true);
    setError(null);

    try {
      // Apply optimistic update
      const optimisticResult = updateFn(...args);
      
      // Make API call
      const result = await apiCall(...args);
      
      // Return the result
      return result;
    } catch (err) {
      // Rollback on failure
      if (rollbackFn) {
        rollbackFn(...args);
      }
      
      setError(err.message);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [updateFn, apiCall, rollbackFn]);

  return { execute, isPending, error };
};

/**
 * Hook for handling drag and drop with optimistic updates
 * @param {Array} items - Array of items to reorder
 * @param {Function} onReorder - Function to handle reordering
 * @param {Function} apiCall - API call to persist the reorder
 * @returns {Object} - { handleDragEnd, isReordering }
 */
export const useDragAndDrop = (items, onReorder, apiCall) => {
  const [isReordering, setIsReordering] = useState(false);
  const [originalOrder, setOriginalOrder] = useState([]);

  const handleDragEnd = useCallback(async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.index === destination.index) return;

    // Store original order for rollback
    setOriginalOrder([...items]);
    
    // Create new order
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, reorderedItem);

    // Apply optimistic update
    onReorder(newItems);
    setIsReordering(true);

    try {
      // Make API call
      await apiCall(newItems);
    } catch (error) {
      // Rollback on failure
      onReorder(originalOrder);
      console.error('Failed to reorder items:', error);
    } finally {
      setIsReordering(false);
    }
  }, [items, onReorder, apiCall, originalOrder]);

  return { handleDragEnd, isReordering };
};

/**
 * Hook for handling form submissions with optimistic updates
 * @param {Function} submitFn - Function to handle form submission
 * @param {Function} apiCall - API call to persist the data
 * @param {Function} onSuccess - Callback on successful submission
 * @param {Function} onError - Callback on error
 * @returns {Object} - { handleSubmit, isSubmitting, error }
 */
export const useFormSubmission = (submitFn, apiCall, onSuccess, onError) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Apply optimistic update
      const optimisticResult = submitFn(formData);
      
      // Make API call
      const result = await apiCall(formData);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      
      // Call error callback
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFn, apiCall, onSuccess, onError]);

  return { handleSubmit, isSubmitting, error };
};

/**
 * Hook for handling search with debouncing
 * @param {Function} searchFn - Function to perform search
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Object} - { search, isSearching, results }
 */
export const useDebouncedSearch = (searchFn, delay = 300) => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);

  const search = useCallback((query) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Set new timeout
    const newTimeoutId = setTimeout(async () => {
      try {
        const searchResults = await searchFn(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, delay);

    setTimeoutId(newTimeoutId);
  }, [searchFn, delay, timeoutId]);

  return { search, isSearching, results };
};

/**
 * Hook for handling pagination with optimistic updates
 * @param {Array} items - Array of items to paginate
 * @param {number} itemsPerPage - Number of items per page
 * @param {Function} onPageChange - Function to handle page changes
 * @returns {Object} - { currentPage, totalPages, paginatedItems, goToPage, nextPage, prevPage }
 */
export const usePagination = (items, itemsPerPage, onPageChange) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback((page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
    
    if (onPageChange) {
      onPageChange(newPage);
    }
  }, [totalPages, onPageChange]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage
  };
};
