import { useState, useEffect, useCallback } from 'react';
import { db, getState, setState, type UploadRecord } from '../utils/db';
import type { RawDataRow } from '../utils/dataParser';

export interface DBState {
  /** true enquanto carrega dados iniciais do banco */
  loading: boolean;
  /** Dados brutos do upload ativo */
  rawData: RawDataRow[];
  /** Metas por área */
  metas: Record<string, number>;
  /** Áreas selecionadas */
  selectedAreas: string[];
  /** Propostas marcadas como vendidas */
  soldProposals: Set<string>;
  /** ID do upload atualmente ativo */
  activeUploadId: number | null;
  /** Todos os uploads salvos (sem os rows, só cabeçalho) */
  uploads: Omit<UploadRecord, 'rows'>[];
}

export interface DBActions {
  saveUpload: (fileName: string, rows: RawDataRow[]) => Promise<number>;
  loadUpload: (uploadId: number) => Promise<void>;
  deleteUpload: (uploadId: number) => Promise<void>;
  setMetas: (metas: Record<string, number>) => void;
  setSelectedAreas: (areas: string[]) => void;
  setSoldProposals: (proposals: Set<string>) => void;
  refreshUploads: () => Promise<void>;
}

export function useAppDB(): DBState & DBActions {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<RawDataRow[]>([]);
  const [metas, setMetasState] = useState<Record<string, number>>({});
  const [selectedAreas, setSelectedAreasState] = useState<string[]>([]);
  const [soldProposals, setSoldProposalsState] = useState<Set<string>>(new Set());
  const [activeUploadId, setActiveUploadId] = useState<number | null>(null);
  const [uploads, setUploads] = useState<Omit<UploadRecord, 'rows'>[]>([]);

  // ── Carrega estado inicial do banco ────────────────────────────────────────
  useEffect(() => {
    async function boot() {
      try {
        // Carrega cabeçalhos de uploads
        const allUploads = await db.uploads.orderBy('uploadedAt').reverse().toArray();
        setUploads(allUploads.map(({ rows: _, ...rest }) => rest));

        // Carrega upload ativo
        const savedId = await getState<number | null>('activeUploadId', null);
        if (savedId !== null) {
          const record = await db.uploads.get(savedId);
          if (record) {
            setRawData(record.rows);
            setActiveUploadId(savedId);
          }
        }

        // Carrega demais estados
        const savedMetas = await getState<Record<string, number>>('metas', {});
        const savedAreas = await getState<string[]>('selectedAreas', []);
        const savedSold  = await getState<string[]>('soldProposals', []);
        setMetasState(savedMetas);
        setSelectedAreasState(savedAreas);
        setSoldProposalsState(new Set(savedSold));
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, []);

  // ── Persistência reativa ────────────────────────────────────────────────────
  useEffect(() => { setState('metas', metas); },         [metas]);
  useEffect(() => { setState('selectedAreas', selectedAreas); }, [selectedAreas]);
  useEffect(() => { setState('soldProposals', [...soldProposals]); }, [soldProposals]);

  // ── Atualiza lista de uploads ───────────────────────────────────────────────
  const refreshUploads = useCallback(async () => {
    const all = await db.uploads.orderBy('uploadedAt').reverse().toArray();
    setUploads(all.map(({ rows: _, ...rest }) => rest));
  }, []);

  // ── Salva novo upload ───────────────────────────────────────────────────────
  const saveUpload = useCallback(async (fileName: string, rows: RawDataRow[]): Promise<number> => {
    const id = await db.uploads.add({
      fileName,
      uploadedAt: new Date(),
      rowCount: rows.length,
      rows,
    });
    await setState('activeUploadId', id);
    setActiveUploadId(id);
    setRawData(rows);
    await refreshUploads();
    return id;
  }, [refreshUploads]);

  // ── Carrega upload existente ────────────────────────────────────────────────
  const loadUpload = useCallback(async (uploadId: number) => {
    const record = await db.uploads.get(uploadId);
    if (!record) return;
    setRawData(record.rows);
    setActiveUploadId(uploadId);
    await setState('activeUploadId', uploadId);
  }, []);

  // ── Remove upload ──────────────────────────────────────────────────────────
  const deleteUpload = useCallback(async (uploadId: number) => {
    await db.uploads.delete(uploadId);
    if (activeUploadId === uploadId) {
      // Tenta carregar o mais recente restante
      const latest = await db.uploads.orderBy('uploadedAt').reverse().first();
      if (latest) {
        setRawData(latest.rows);
        setActiveUploadId(latest.id!);
        await setState('activeUploadId', latest.id!);
      } else {
        setRawData([]);
        setActiveUploadId(null);
        await setState('activeUploadId', null);
      }
    }
    await refreshUploads();
  }, [activeUploadId, refreshUploads]);

  // ── Setters com persistência ────────────────────────────────────────────────
  const setMetas = useCallback((v: Record<string, number>) => setMetasState(v), []);
  const setSelectedAreas = useCallback((v: string[]) => setSelectedAreasState(v), []);
  const setSoldProposals = useCallback((v: Set<string>) => setSoldProposalsState(v), []);

  return {
    loading, rawData, metas, selectedAreas, soldProposals, activeUploadId, uploads,
    saveUpload, loadUpload, deleteUpload, setMetas, setSelectedAreas, setSoldProposals,
    refreshUploads,
  };
}
