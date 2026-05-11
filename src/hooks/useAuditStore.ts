"use client";

/**
 * Custom hook for persisting audit tool entries to localStorage.
 * This ensures users don't lose their form data on page refresh.
 *
 * ARCHITECTURE DECISION:
 * localStorage is used at MVP stage instead of a database to:
 * - Eliminate backend dependencies for Day 1
 * - Allow fully client-side operation
 * - Provide instant persistence without auth
 */

import { useState, useEffect, useCallback } from "react";
import { AuditToolEntry } from "@/types/audit";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "ai-spend-audit-tools";

// Fallback UUID generator if uuid package isn't available
function generateId(): string {
  try {
    return uuidv4();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export function useAuditStore() {
  const [tools, setTools] = useState<AuditToolEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuditToolEntry[];
        setTools(parsed);
      }
    } catch (error) {
      console.warn("Failed to load audit tools from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage whenever tools change
  useEffect(() => {
    if (!isLoaded) return; // Don't persist the initial empty state
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
    } catch (error) {
      console.warn("Failed to save audit tools to localStorage:", error);
    }
  }, [tools, isLoaded]);

  const addTool = useCallback((tool: Omit<AuditToolEntry, "id">) => {
    setTools((prev) => [...prev, { ...tool, id: generateId() }]);
  }, []);

  const updateTool = useCallback(
    (id: string, updates: Partial<Omit<AuditToolEntry, "id">>) => {
      setTools((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    },
    []
  );

  const removeTool = useCallback((id: string) => {
    setTools((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearTools = useCallback(() => {
    setTools([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silent fail
    }
  }, []);

  return {
    tools,
    isLoaded,
    addTool,
    updateTool,
    removeTool,
    clearTools,
  };
}
