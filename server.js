import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { z } from "zod";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

// Zod schemas for request validation
const resumeCreateSchema = z.object({
	name: z.string().min(1),
	content: z.string().min(1),
	jobDescription: z.string().optional().default(""),
});
const resumeUpdateSchema = z.object({
	name: z.string().min(1).optional(),
	content: z.string().min(1).optional(),
	jobDescription: z.string().optional(),
	metadata: z.record(z.any()).optional(),
});
const analyzeRequestSchema = z.object({
	resumeId: z.string().optional(),
	resume: z.string().min(1).optional(),
	jobDescription: z.string().min(1),
});

// Connect to MongoDB if MONGODB_URI provided
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
	mongoose
		.connect(MONGODB_URI)
		.then(() => {
			console.log("Connected to MongoDB");
		})
		.catch((err) => {
			console.error("Failed to connect to MongoDB:", err);
		});
} else {
	console.warn(
		"MONGODB_URI not set. Resume persistence endpoints will return 500 if used."
	);
}

// Define Resume schema/model if mongoose is available
let Resume = null;
let JobAnalysis = null;
if (mongoose && mongoose.model) {
	try {
		const resumeSchema = new mongoose.Schema({
			name: { type: String, required: true },
			content: { type: String, required: true },
			jobDescription: { type: String, default: "" },
			savedAt: { type: Date, default: () => new Date() },
			metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
		});
		Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

		const analysisSchema = new mongoose.Schema({
			resumeId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Resume",
				default: null,
			},
			jobDescription: { type: String, default: "" },
			result: { type: mongoose.Schema.Types.Mixed },
			rawResponse: { type: mongoose.Schema.Types.Mixed },
			createdAt: { type: Date, default: () => new Date() },
		});
		JobAnalysis =
			mongoose.models.JobAnalysis ||
			mongoose.model("JobAnalysis", analysisSchema);
	} catch (e) {
		console.error("Error creating Resume/JobAnalysis model:", e);
	}
}

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!API_KEY) {
	console.error("GEMINI_API_KEY (or API_KEY) environment variable not set.");
	process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Resume CRUD endpoints (use MongoDB)
app.get('/api/resumes', async (req, res) => {
  if (!Resume) return res.status(500).json({ error: 'Resume model not initialized or MONGODB_URI missing' });
  try {
    const docs = await Resume.find().sort({ savedAt: -1 }).lean();
    res.json(docs.map(d => ({ ...d, _id: d._id.toString(), savedAt: d.savedAt })));
  } catch (err) {
    console.error('Error fetching resumes:', err);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

app.get('/api/resumes/:id', async (req, res) => {
  if (!Resume) return res.status(500).json({ error: 'Resume model not initialized or MONGODB_URI missing' });
  try {
    const doc = await Resume.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ...doc, _id: doc._id.toString(), savedAt: doc.savedAt });
  } catch (err) {
    console.error('Error fetching resume:', err);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

app.post('/api/resumes', async (req, res) => {
  if (!Resume) return res.status(500).json({ error: 'Resume model not initialized or MONGODB_URI missing' });
  try {
    const parsed = resumeCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.format() });
    const { name, content, jobDescription } = parsed.data;
    const created = await Resume.create({ name, content, jobDescription });
    res.status(201).json({ ...created.toObject(), _id: created._id.toString(), savedAt: created.savedAt });
  } catch (err) {
    console.error('Error creating resume:', err);
    res.status(400).json({ error: 'Failed to create resume' });
  }
});

app.put('/api/resumes/:id', async (req, res) => {
  if (!Resume) return res.status(500).json({ error: 'Resume model not initialized or MONGODB_URI missing' });
  try {
    const parsed = resumeUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.format() });
    const update = parsed.data;
    const updated = await Resume.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ ...updated, _id: updated._id.toString(), savedAt: updated.savedAt });
  } catch (err) {
    console.error('Error updating resume:', err);
    res.status(400).json({ error: 'Failed to update resume' });
  }
});

app.delete('/api/resumes/:id', async (req, res) => {
  if (!Resume) return res.status(500).json({ error: 'Resume model not initialized or MONGODB_URI missing' });
  try {
    const deleted = await Resume.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting resume:', err);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Schemas mirrored from client to validate structured responses
const responseSchema = {
	type: Type.OBJECT,
	properties: {
		matchScore: { type: Type.INTEGER },
		summary: { type: Type.STRING },
		strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
		gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
		matchedKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT } },
		missingKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT } },
		improvementSuggestions: { type: Type.ARRAY, items: { type: Type.OBJECT } },
		coverLetterDraft: { type: Type.STRING },
	},
	required: [
		"matchScore",
		"summary",
		"strengths",
		"gaps",
		"matchedKeywords",
		"missingKeywords",
		"improvementSuggestions",
		"coverLetterDraft",
	],
};

const distanceSchema = {
	type: Type.OBJECT,
	properties: {
		distance: { type: Type.NUMBER },
		unit: { type: Type.STRING },
		originAddress: { type: Type.STRING },
		destinationAddress: { type: Type.STRING },
	},
	required: ["distance", "unit", "originAddress", "destinationAddress"],
};

const jobListingsSchema = {
	type: Type.OBJECT,
	properties: {
		jobs: {
			type: Type.ARRAY,
			items: { type: Type.OBJECT },
		},
	},
	required: ["jobs"],
};

// POST /api/analyze
app.post("/api/analyze", async (req, res) => {
	// validate request
	const parsedReq = analyzeRequestSchema.safeParse(req.body || {});
	if (!parsedReq.success)
		return res
			.status(400)
			.json({ error: "Invalid request", details: parsedReq.error.format() });
	const { resumeId, resume, jobDescription } = parsedReq.data;
	if (!resume && !resumeId)
		return res
			.status(400)
			.json({ error: "Either resumeId or resume text must be provided" });

	let resumeText = resume || null;
	if (resumeId && !resumeText && Resume) {
		try {
			const doc = await Resume.findById(resumeId).lean();
			if (!doc) return res.status(404).json({ error: "Resume not found" });
			resumeText = doc.content;
		} catch (e) {
			console.error("Error loading resume by id:", e);
			return res.status(500).json({ error: "Failed to load resume" });
		}
	}

	const prompt = `
You are an expert career coach and professional resume writer. Your task is to analyze a candidate's resume against a job description and provide a detailed, actionable analysis in JSON.

Candidate Resume:\n---\n${resumeText}\n---\n\nJob Description:\n---\n${jobDescription}\n---\n
Respond ONLY with valid JSON matching the schema.`;

	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: prompt,
			config: {
				responseMimeType: "application/json",
				responseSchema,
				temperature: 0.5,
			},
		});

		const text = response.text?.trim();
		if (!text)
			return res.status(502).json({ error: "Empty response from model" });

		let parsed = null;
		try {
			parsed = JSON.parse(text);
		} catch (e) {
			parsed = { raw: text };
		}

		// persist analysis if JobAnalysis model exists
		if (JobAnalysis) {
			try {
				const created = await JobAnalysis.create({
					resumeId: resumeId || null,
					jobDescription,
					result: parsed,
					rawResponse: parsed,
				});
				return res.json({ id: created._id.toString(), ...created.toObject() });
			} catch (e) {
				console.error("Failed to persist analysis:", e);
				// continue and return parsed result
			}
		}

		return res.json(parsed);
	} catch (error) {
		console.error("Analyze error:", error);
		return res.status(500).json({ error: "Failed to analyze job fit" });
	}
});

// POST /api/fetch-description
app.post("/api/fetch-description", async (req, res) => {
	const { url } = req.body;
	if (!url) return res.status(400).json({ error: "Missing url" });

	const prompt = `You are an expert web scraping assistant. Extract the job description text from the provided URL and return ONLY the raw text. URL: ${url}`;
	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: prompt,
			config: { tools: [{ googleSearch: {} }] },
		});
		const text = response.text?.trim();
		return res.json({ text: text || "" });
	} catch (err) {
		console.error("Fetch description error", err);
		return res.status(500).json({ error: "Failed to fetch job description" });
	}
});

// POST /api/distance
app.post("/api/distance", async (req, res) => {
	const { origin, destination } = req.body;
	if (!origin || !destination)
		return res.status(400).json({ error: "Missing origin or destination" });

	const prompt = `You are a mapping assistant. Calculate the driving distance (miles) between Origin: ${origin} and Destination: ${destination}. Return JSON.`;
	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: prompt,
			config: {
				tools: [{ googleMaps: {} }],
				responseMimeType: "application/json",
				responseSchema: distanceSchema,
			},
		});
		const text = response.text?.trim();
		const parsed = JSON.parse(text || "{}");
		return res.json(parsed);
	} catch (err) {
		console.error("Distance error", err);
		return res.status(500).json({ error: "Failed to calculate distance" });
	}
});

// POST /api/reverse-geocode
app.post("/api/reverse-geocode", async (req, res) => {
	const { lat, lon } = req.body;
	if (typeof lat !== "number" || typeof lon !== "number")
		return res.status(400).json({ error: "Missing lat/lon" });

	const prompt = `What is the full street address for coordinates latitude ${lat}, longitude ${lon}? Return only the address.`;
	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: prompt,
			config: {
				tools: [{ googleMaps: {} }],
				toolConfig: {
					retrievalConfig: { latLng: { latitude: lat, longitude: lon } },
				},
			},
		});
		const text = response.text?.trim() || "";
		return res.json({ address: text });
	} catch (err) {
		console.error("Reverse geocode error", err);
		return res.status(500).json({ error: "Failed to determine address" });
	}
});

// GET /api/hiring-cafe -> proxy
app.get("/api/hiring-cafe", async (req, res) => {
	try {
		const r = await fetch("https://hiring.cafe/api/v1/jobs");
		const data = await r.json();
		return res.json(data);
	} catch (err) {
		console.error("Hiring.cafe proxy error", err);
		return res.status(500).json({ error: "Failed to fetch hiring.cafe jobs" });
	}
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API proxy listening on port ${port}`));
