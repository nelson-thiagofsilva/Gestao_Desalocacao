import { useState, useEffect, useCallback, useRef } from 'react';
import { db, getState, setState, type UploadRecord } from '../utils/db';
import type { RawDataRow } from '../utils/dataParser';

export interface DBState {
  loading: boolean;
  rawData: RawDataRow[];
  metas: Record<string, number>;
  selectedAreas: string[];
  soldProposals: Set<string>;
  activeUploadId: number | null;
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

  // Impede que os useEffects de persistência escrevam no banco
  // antes de os valores reais terem sido carregados do banco.
  const initialized = useRef(false);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function boot() {
      try {
        // 1. Coleta TODOS os valores do banco antes de setar qualquer estado.
        //    Assim o React 18 agrupa todos os setStates num único render.
        const allUploads = await db.uploads.orderBy('uploadedAt').reverse().toArray();

        const savedId = await getState<number | null>('activeUploadId', null);
        let bootRows: RawDataRow[] = [];
        let bootActiveId: number | null = null;
        if (savedId !== null) {
          const record = await db.uploads.get(savedId);
          if (record) {
            bootRows    = record.rows;
            bootActiveId = record.id!;
          }
        }

        const savedMetas = await getState<Record<string, number>>('metas', {});
        const savedAreas = await getState<string[]>('selectedAreas', []);
        const savedSold  = await getState<string[]>('soldProposals', []);

        // 2. Seta tudo de uma vez — o React 18 agrupa em um único render.
        setUploads(allUploads.map(({ rows: _, ...rest }) => rest));
        setRawData(bootRows);
        setActiveUploadId(bootActiveId);
        setMetasState(savedMetas);
        setSelectedAreasState(savedAreas);
        setSoldProposalsState(new Set(savedSold));
      } finally {
        // 3. Só depois marca como inicializado, liberando a persistência reativa.
        initialized.current = true;
        setLoading(false);
      }
    }
    boot();
  }, []);

  // ── Persistência reativa (só após a carga inicial) ─────────────────────────
  useEffect(() => {
    if (!initialized.current) return;
    setState('metas', metas);
  }, [metas]);

  useEffect(() => {
    if (!initialized.current) return;
    setState('selectedAreas', selectedAreas);
  }, [selectedAreas]);

  useEffect(() => {
    if (!initialized.current) return;
    setState('soldProposals', [...soldProposals]);
  }, [soldProposals]);

  // ── Atualiza lista de uploads ──────────────────────────────────────────────
  const refreshUploads = useCallback(async () => {
    const all = await db.uploads.orderBy('uploadedAt').reverse().toArray();
    setUploads(all.map(({ rows: _, ...rest }) => rest));
  }, []);

  // ── Salva novo upload ──────────────────────────────────────────────────────
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

  // ── Carrega upload existente ───────────────────────────────────────────────
  const loadUpload = useCallback(async (uploadId: number) => {
    const record = await db.uploads.get(uploadId);
    if (!record) return;
    setRawData(record.rows);
    setActiveUploadId(uploadId);
    await setState('activeUploadId', uploadId);
  }, []);

  // ── Remove upload ─────────────────────────────────────────────────────────
  const deleteUpload = useCallback(async (uploadId: number) => {
    await db.uploads.delete(uploadId);
    if (activeUploadId === uploadId) {
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

  // ── Setters públicos ───────────────────────────────────────────────────────
  const setMetas        = useCallback((v: Record<string, number>) => setMetasState(v), []);
  const setSelectedAreas = useCallback((v: string[]) => setSelectedAreasState(v), []);
  const setSoldProposals = useCallback((v: Set<string>) => setSoldProposalsState(v), []);

  return {
    loading, rawData, metas, selectedAreas, soldProposals, activeUploadId, uploads,
    saveUpload, loadUpload, deleteUpload, setMetas, setSelectedAreas, setSoldProposals,
    refreshUploads,
  };
}
