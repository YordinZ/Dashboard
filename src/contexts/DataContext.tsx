import React, { createContext, useContext, useState, ReactNode } from "react";
import type { ProcessedData } from "@/lib/csv-processor";

interface DataContextType {
  data: ProcessedData | null;
  setData: (data: ProcessedData | null) => void;
  fileName: string;
  setFileName: (name: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [fileName, setFileName] = useState("");

  return (
    <DataContext.Provider value={{ data, setData, fileName, setFileName }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
