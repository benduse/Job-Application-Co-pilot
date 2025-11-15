import { v4 as uuidv4 } from 'uuid';
import { SavedResume } from '../types';
import { templateResumeContent } from '../data/defaultData';

const STORAGE_KEY = 'savedResumes_db_mock';
const API_BASE = '/api';

// --- LOCAL MOCK HELPERS (used as fallback when server is unavailable) ---
const seedInitialData = () => {
    const templateResume: SavedResume = {
        _id: uuidv4(),
        name: 'General Resume Template',
        content: templateResumeContent,
        jobDescription: '',
        savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([templateResume]));
};

const readLocalResumes = (): SavedResume[] => {
    const resumesJson = localStorage.getItem(STORAGE_KEY);
    if (!resumesJson) {
        seedInitialData();
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SavedResume[];
    }
    return JSON.parse(resumesJson) as SavedResume[];
};

const writeLocalResumes = (resumes: SavedResume[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
};

// --- API functions (primary) ---
async function tryFetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const resp = await fetch(input, init);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    return (await resp.json()) as T;
}

export const getResumes = async (): Promise<SavedResume[]> => {
    try {
        return await tryFetchJson<SavedResume[]>(`${API_BASE}/resumes`);
    } catch (err) {
        console.warn('getResumes: server call failed, falling back to localStorage', err);
        const resumes = readLocalResumes();
        // sort by savedAt desc
        return resumes.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    }
};

export const saveResume = async (resumeData: Omit<SavedResume, '_id' | 'savedAt'>): Promise<SavedResume> => {
    try {
        const created = await tryFetchJson<SavedResume>(`${API_BASE}/resumes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resumeData),
        });
        return created;
    } catch (err) {
        console.warn('saveResume: server call failed, using localStorage fallback', err);
        const existing = readLocalResumes();
        const newResume: SavedResume = { ...resumeData, _id: uuidv4(), savedAt: new Date().toISOString() } as SavedResume;
        const updated = [newResume, ...existing];
        writeLocalResumes(updated);
        return newResume;
    }
};

export const deleteResume = async (id: string): Promise<{ success: boolean }> => {
    try {
        await fetch(`${API_BASE}/resumes/${encodeURIComponent(id)}`, { method: 'DELETE' });
        return { success: true };
    } catch (err) {
        console.warn('deleteResume: server call failed, using localStorage fallback', err);
        const existing = readLocalResumes();
        const updated = existing.filter(r => r._id !== id);
        if (updated.length === existing.length) {
            throw new Error(`Resume with ID ${id} not found`);
        }
        writeLocalResumes(updated);
        return { success: true };
    }
};

export const updateResume = async (id: string, patch: Partial<Omit<SavedResume, '_id' | 'savedAt'>>): Promise<SavedResume> => {
    try {
        const updated = await tryFetchJson<SavedResume>(`${API_BASE}/resumes/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
        });
        return updated;
    } catch (err) {
        console.warn('updateResume: server call failed, using localStorage fallback', err);
        const existing = readLocalResumes();
        const idx = existing.findIndex(r => r._id === id);
        if (idx === -1) throw new Error(`Resume with ID ${id} not found`);
        const updated = { ...existing[idx], ...patch } as SavedResume;
        existing[idx] = updated;
        writeLocalResumes(existing);
        return updated;
    }
};

// Exported for compatibility with other modules that may still import these names
export default {
    getResumes,
    saveResume,
    deleteResume,
    updateResume,
};