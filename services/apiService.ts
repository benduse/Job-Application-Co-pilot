import { v4 as uuidv4 } from 'uuid';
import { SavedResume } from '../types';
import { templateResumeContent } from '../data/defaultData';

const STORAGE_KEY = 'savedResumes_db_mock';

// --- MOCK API FUNCTIONS ---
// These functions simulate calls to a backend API that interacts with MongoDB.
// They use localStorage as a mock database and introduce an artificial delay.

/**
 * Creates the initial template resume if no data exists.
 */
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


/**
 * Fetches all saved resumes from the mock database.
 * Simulates: GET /api/resumes
 */
export const getResumes = async (): Promise<SavedResume[]> => {
    console.log("API CALL: Fetching resumes...");
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                let resumesJson = localStorage.getItem(STORAGE_KEY);

                // If no data exists, seed it with the template
                if (!resumesJson) {
                    console.log("API CALL: No data found. Seeding with template...");
                    seedInitialData();
                    resumesJson = localStorage.getItem(STORAGE_KEY);
                }

                if (!resumesJson) {
                    resolve([]);
                    return;
                }
                const resumes = JSON.parse(resumesJson) as SavedResume[];
                // Sort by date, newest first (as a backend would)
                const sortedResumes = resumes.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
                console.log("API CALL: Resumes fetched successfully.");
                resolve(sortedResumes);
            } catch (error) {
                console.error("Mock DB Error (getResumes):", error);
                // In a real app, this would be a proper error object from the server
                throw new Error("Failed to fetch resumes from the database.");
            }
        }, 500); // 500ms delay to simulate network latency
    });
};

/**
 * Saves a new resume to the mock database.
 * Simulates: POST /api/resumes
 */
export const saveResume = async (resumeData: Omit<SavedResume, '_id' | 'savedAt'>): Promise<SavedResume> => {
    console.log("API CALL: Saving resume...");
    return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
            try {
                const existingResumes = await getResumes(); // Fetch current state
                const newResume: SavedResume = {
                    ...resumeData,
                    _id: uuidv4(), // The backend/DB would generate this ID
                    savedAt: new Date().toISOString(),
                };
                const updatedResumes = [newResume, ...existingResumes];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResumes));
                console.log("API CALL: Resume saved successfully.", newResume);
                resolve(newResume);
            } catch (error) {
                console.error("Mock DB Error (saveResume):", error);
                reject(new Error("Failed to save the resume to the database."));
            }
        }, 800); // 800ms delay
    });
};

/**
 * Deletes a resume from the mock database by its ID.
 * Simulates: DELETE /api/resumes/:id
 */
export const deleteResume = async (id: string): Promise<{ success: boolean }> => {
    console.log(`API CALL: Deleting resume with id: ${id}...`);
    return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
            try {
                const resumes = await getResumes();
                const updatedResumes = resumes.filter(resume => resume._id !== id);
                if (resumes.length === updatedResumes.length) {
                   // This means the ID was not found.
                   throw new Error(`Resume with ID ${id} not found.`);
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResumes));
                console.log("API CALL: Resume deleted successfully.");
                resolve({ success: true });
            } catch (error) {
                console.error("Mock DB Error (deleteResume):", error);
                reject(new Error("Failed to delete the resume from the database."));
            }
        }, 600); // 600ms delay
    });
};