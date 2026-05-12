"use client";

/**
 * Custom hook for persisting audit tool entries to localStorage.
 * Day 2: Extended to support teamSize field.
 */

import { useState, useEffect, useCallback } from "react";
import { AuditToolEntry } from "@/types/audit";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "ai-spend-audit-tools-v2";

function generateId(): string {
  try { return uuidv4(); }
  catch { return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; }
}

export function useAuditStore() {
  const [tools, setTools] = useState<AuditToolEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let initialTools: AuditToolEntry[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuditToolEntry[];
        // Migrate old entries that lack teamSize
        initialTools = parsed.map((t) => ({
          ...t,
          teamSize: (t as AuditToolEntry & { teamSize?: number }).teamSize ?? t.seats,
          // Migrate old UseCase enum to new simplified values
          useCase: migrateUseCase((t as AuditToolEntry & { useCase: string }).useCase),
        }));
      }
    } catch (error) {
      console.warn("Failed to load audit tools from localStorage:", error);
    }
    
    const timer = setTimeout(() => {
      setTools(initialTools);
      setIsLoaded(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
    } catch (error) {
      console.warn("Failed to save audit tools to localStorage:", error);
    }
  }, [tools, isLoaded]);

  const addTool = useCallback((tool: Omit<AuditToolEntry, "id">) => {
    setTools((prev) => [...prev, { ...tool, id: generateId() }]);
  }, []);

  const updateTool = useCallback((id: string, updates: Partial<Omit<AuditToolEntry, "id">>) => {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const removeTool = useCallback((id: string) => {
    setTools((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearTools = useCallback(() => {
    setTools([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* silent */ }
  }, []);

  return { tools, isLoaded, addTool, updateTool, removeTool, clearTools };
}

/**
 * Migrate old UseCase values to the new simplified enum.
 * Handles both Day 1 ("Coding", "Writing"…) and Day 2 ("coding", "writing"…) formats.
 */
function migrateUseCase(uc: string): AuditToolEntry["useCase"] {
  const map: Record<string, AuditToolEntry["useCase"]> = {
    "Coding": "coding",
    "coding": "coding",
    "Writing": "writing",
    "writing": "writing",
    "Research": "research",
    "research": "research",
    "Customer Support": "data",
    "Data Analysis": "data",
    "data": "data",
    "General Productivity": "mixed",
    "Other": "mixed",
    "mixed": "mixed",
  };
  return map[uc] ?? "mixed";
}
