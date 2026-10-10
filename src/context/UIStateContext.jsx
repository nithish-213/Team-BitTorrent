import React, { createContext, useContext, useState, useCallback } from "react";
import catalogData from "../data/catalog.json";

const UIStateContext = createContext();

export function UIStateProvider({ children }) {
  const [activePageId, setActivePageId] = useState("dashboard");
  const [filtersByPage, setFiltersByPage] = useState({});
  const [sortByPage, setSortByPage] = useState({});
  const [recentlyAgentChanged, setRecentlyAgentChanged] = useState({});

  // Session trace tracking for KPIInspector
  const [latestTrace, setLatestTrace] = useState(null);
  const [sessionTraces, setSessionTraces] = useState([]);

  // Helper to trigger temporary agent highlight for 2 seconds
  const markAgentChanged = useCallback((pageId, filterKeys = [], sortChanged = false) => {
    setRecentlyAgentChanged(prev => {
      const pagePrev = prev[pageId] || { filters: {}, sort: false };
      const newFilters = { ...pagePrev.filters };
      filterKeys.forEach(k => {
        newFilters[k] = true;
      });
      return {
        ...prev,
        [pageId]: {
          filters: newFilters,
          sort: sortChanged || pagePrev.sort
        }
      };
    });

    setTimeout(() => {
      setRecentlyAgentChanged(prev => {
        const pagePrev = prev[pageId];
        if (!pagePrev) return prev;
        const newFilters = { ...pagePrev.filters };
        filterKeys.forEach(k => {
          delete newFilters[k];
        });
        return {
          ...prev,
          [pageId]: {
            filters: newFilters,
            sort: sortChanged ? false : pagePrev.sort
          }
        };
      });
    }, 2000);
  }, []);

  const setPageFilter = useCallback((pageId, filterKey, value, isAgent = false) => {
    setFiltersByPage(prev => ({
      ...prev,
      [pageId]: {
        ...(prev[pageId] || {}),
        [filterKey]: value
      }
    }));
    if (isAgent) {
      markAgentChanged(pageId, [filterKey], false);
    }
  }, [markAgentChanged]);

  const setPageFilters = useCallback((pageId, filtersObj, isAgent = false) => {
    setFiltersByPage(prev => ({
      ...prev,
      [pageId]: {
        ...(prev[pageId] || {}),
        ...filtersObj
      }
    }));
    if (isAgent && filtersObj) {
      markAgentChanged(pageId, Object.keys(filtersObj), false);
    }
  }, [markAgentChanged]);

  const setPageSort = useCallback((pageId, sortValue, isAgent = false) => {
    setSortByPage(prev => ({
      ...prev,
      [pageId]: sortValue
    }));
    if (isAgent) {
      markAgentChanged(pageId, [], true);
    }
  }, [markAgentChanged]);

  const addTraceRecord = useCallback((traceObj) => {
    if (!traceObj) return;
    setLatestTrace(traceObj);
    setSessionTraces(prev => [...prev, traceObj]);
  }, []);

  return (
    <UIStateContext.Provider
      value={{
        activePageId,
        setActivePageId,
        filtersByPage,
        setPageFilter,
        setPageFilters,
        sortByPage,
        setPageSort,
        recentlyAgentChanged,
        latestTrace,
        sessionTraces,
        addTraceRecord,
        catalogPages: catalogData.pages,
        catalogNavigation: catalogData.navigation
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState() {
  const ctx = useContext(UIStateContext);
  if (!ctx) {
    throw new Error("useUIState must be used within a UIStateProvider");
  }
  return ctx;
}
