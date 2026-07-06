// Talks to the FastAPI civic backend. Falls back to local demo data when the
// backend isn't reachable, so the UI is always usable while you wire up the API.

export const API_BASE = "https://janai-ycn3.onrender.com";

export type Category =
  | "Water"
  | "Roads"
  | "Sanitation"
  | "Education"
  | "Health"
  | "Electricity";

export type Submission = {
  id: string;
  mode: string;
  text: string;
  category: Category;
  summary: string;
  urgency_score: number;
  is_spam: boolean;
  landmarks: string;
  timestamp: string;
  coordinates: { lat: number; lng: number };
};

export type Hotspot = {
  category: Category;
  report_count: number;
  critical_incident_count: number;
  center_mass_coordinates: { lat: number; lng: number };
};

export type PriorityRow = {
  category: Category;
  compositeScore: number;
  metricsSource: {
    calculatedDemandWeight: number;
    censusDemographicDeficit: number;
    independentGapAudit: number;
    masterPlanConflictFlag: boolean;
  };
  actionRecommendation: string;
};

const DEMO_SUBMISSIONS: Submission[] = [
  {
    id: "SUB-001",
    mode: "Voice",
    text: "Water pipeline leakage and low pressure in Ward 4 near public school.",
    category: "Water",
    summary: "Water pipeline leak causing low pressure near a school in Ward 4.",
    urgency_score: 8,
    is_spam: false,
    landmarks: "Ward 4, near public school",
    timestamp: "2026-07-05T01:00:00Z",
    coordinates: { lat: 25.1221, lng: 75.6212 },
  },
  {
    id: "SUB-002",
    mode: "WhatsApp",
    text: "No streetlights functional on Main Market road. Safety concern for women.",
    category: "Electricity",
    summary: "Non-functional streetlights on Main Market road raising safety risks.",
    urgency_score: 9,
    is_spam: false,
    landmarks: "Main Market road",
    timestamp: "2026-07-05T01:15:00Z",
    coordinates: { lat: 25.1545, lng: 75.6032 },
  },
];

async function safeFetch<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...(init?.headers || {}) },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export async function submitComplaint(params: {
  text: string;
  mode: "Voice" | "Text" | "Photo" | "WhatsApp";
  image?: File | Blob | null;
}): Promise<{ status: string; message?: string; reason?: string; data?: Submission }> {
  const form = new FormData();
  form.append("text_prompt", params.text);
  form.append("mode", params.mode);
  if (params.image) form.append("image", params.image, "photo.jpg");

  try {
    const res = await fetch(`${API_BASE}/api/submissions`, { method: "POST", body: form });
    return await res.json();
  } catch {
    // Demo fallback: fabricate a plausible response so the flow still works offline.
    const categories: Category[] = ["Water", "Roads", "Sanitation", "Education", "Health", "Electricity"];
    const guess = categories.find((c) => params.text.toLowerCase().includes(c.toLowerCase())) || "Sanitation";
    const demo: Submission = {
      id: `SUB-${Math.floor(Math.random() * 900 + 100)}`,
      mode: params.mode,
      text: params.text,
      category: guess,
      summary: params.text.slice(0, 120),
      urgency_score: 6,
      is_spam: false,
      landmarks: "Unspecified region",
      timestamp: new Date().toISOString(),
      coordinates: { lat: 24.58 + Math.random() * 0.1, lng: 73.68 + Math.random() * 0.1 },
    };
    DEMO_SUBMISSIONS.unshift(demo);
    return { status: "success", message: "Saved locally (demo mode — backend not connected)", data: demo };
  }
}

export async function getSubmissions(): Promise<Submission[]> {
  return safeFetch<Submission[]>("/api/submissions", undefined, DEMO_SUBMISSIONS);
}

export async function getHotspots(): Promise<{ map_hotspots: Hotspot[] }> {
  return safeFetch<{ map_hotspots: Hotspot[] }>(
    "/api/hotspots",
    undefined,
    { map_hotspots: computeDemoHotspots() }
  );
}

export async function prioritize(weights: {
  citizenDemand: number;
  demographicDeficit: number;
  infrastructureGap: number;
}): Promise<{ applied_weights: Record<string, number>; ranked_priority_matrix: PriorityRow[] }> {
  return safeFetch(
    "/api/prioritize",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(weights),
    },
    computeDemoPriority(weights)
  );
}

const REGIONAL_METRICS: Record<Category, { demographicDeficitScore: number; infrastructureGapScore: number; masterPlanConflict: boolean }> = {
  Water: { demographicDeficitScore: 85, infrastructureGapScore: 90, masterPlanConflict: false },
  Roads: { demographicDeficitScore: 40, infrastructureGapScore: 85, masterPlanConflict: true },
  Sanitation: { demographicDeficitScore: 70, infrastructureGapScore: 60, masterPlanConflict: false },
  Education: { demographicDeficitScore: 50, infrastructureGapScore: 45, masterPlanConflict: false },
  Health: { demographicDeficitScore: 95, infrastructureGapScore: 80, masterPlanConflict: false },
  Electricity: { demographicDeficitScore: 65, infrastructureGapScore: 75, masterPlanConflict: false },
};

function computeDemoHotspots(): Hotspot[] {
  const groups: Record<string, Submission[]> = {};
  for (const s of DEMO_SUBMISSIONS) {
    groups[s.category] = groups[s.category] || [];
    groups[s.category].push(s);
  }
  return Object.entries(groups).map(([category, subs]) => ({
    category: category as Category,
    report_count: subs.length,
    critical_incident_count: subs.filter((s) => s.urgency_score >= 8).length,
    center_mass_coordinates: {
      lat: Number((subs.reduce((a, s) => a + s.coordinates.lat, 0) / subs.length).toFixed(4)),
      lng: Number((subs.reduce((a, s) => a + s.coordinates.lng, 0) / subs.length).toFixed(4)),
    },
  }));
}

function computeDemoPriority(weights: { citizenDemand: number; demographicDeficit: number; infrastructureGap: number }) {
  const volumeMap: Record<string, number> = {};
  for (const s of DEMO_SUBMISSIONS) {
    const scalar = s.urgency_score >= 8 ? 2.5 : s.urgency_score >= 5 ? 1.5 : 1.0;
    volumeMap[s.category] = (volumeMap[s.category] || 0) + scalar;
  }
  const maxVolume = Math.max(1, ...Object.values(volumeMap));

  const rows: PriorityRow[] = (Object.keys(REGIONAL_METRICS) as Category[]).map((category) => {
    const infra = REGIONAL_METRICS[category];
    const normalizedDemand = ((volumeMap[category] || 0) / maxVolume) * 100;
    const composite = Math.round(
      normalizedDemand * (weights.citizenDemand / 100) +
        infra.demographicDeficitScore * (weights.demographicDeficit / 100) +
        infra.infrastructureGapScore * (weights.infrastructureGap / 100)
    );
    return {
      category,
      compositeScore: composite,
      metricsSource: {
        calculatedDemandWeight: Math.round(normalizedDemand),
        censusDemographicDeficit: infra.demographicDeficitScore,
        independentGapAudit: infra.infrastructureGapScore,
        masterPlanConflictFlag: infra.masterPlanConflict,
      },
      actionRecommendation: infra.masterPlanConflict
        ? "HOLD TASK ORDER: Work project conflicts with current local Master Development Plan files."
        : "EXECUTE PROPOSAL RUNWAY: Clear priority tracking footprint open.",
    };
  });

  return {
    applied_weights: weights,
    ranked_priority_matrix: rows.sort((a, b) => b.compositeScore - a.compositeScore),
  };
}
