import os
import json
import random
from datetime import datetime
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

app = FastAPI(title="Civic GenAI Multilingual Prioritization Platform")

# ---- 1. INITIALIZE GEMINI CLIENT ----
# Expects GEMINI_API_KEY environment variable to be set
client = genai.Client()

# ---- 2. DEFINE THE STRUCTURED OUTCOMES SCHEMA ----
class ComplaintAnalysis(BaseModel):
    category: str = Field(description="The sector: Water, Roads, Sanitation, Education, Health, or Electricity.")
    summary: str = Field(description="A concise 1-sentence English summary of the issue.")
    urgency_score: int = Field(description="Priority rating from 1 (Low) to 10 (Critical) based on safety hazard or community impact.")
    is_spam_or_fake: bool = Field(description="True if the input is a joke, duplicate template, advertisement, or unrelated.")
    estimated_gps_landmarks: str = Field(description="Any street names, areas, or landmarks mentioned in text or visible in the image.")

# ---- 3. DATABASE SEED DATA IN-MEMORY LAYERS ----
active_submissions: List[Dict] = [
    { 
        "id": "SUB-001", 
        "mode": "Voice", 
        "text": "Water pipeline leakage and low pressure in Ward 4 near public school.", 
        "category": "Water", 
        "summary": "Water pipeline leak causing low pressure near a school in Ward 4.",
        "urgency_score": 8, 
        "is_spam": False,
        "landmarks": "Ward 4, near public school",
        "timestamp": "2026-07-05T01:00:00Z", 
        "coordinates": { "lat": 25.1221, "lng": 75.6212 } 
    },
    { 
        "id": "SUB-002", 
        "mode": "WhatsApp", 
        "text": "No streetlights functional on Main Market road. Safety concern for women.", 
        "category": "Electricity", 
        "summary": "Non-functional streetlights on Main Market road raising safety risks.",
        "urgency_score": 9, 
        "is_spam": False,
        "landmarks": "Main Market road",
        "timestamp": "2026-07-05T01:15:00Z", 
        "coordinates": { "lat": 25.1545, "lng": 75.6032 } 
    }
]

# Regional analytical baselines aligned with Gemini's category outputs
regional_metrics_dataset: Dict[str, Dict] = {
    "Water": { "demographicDeficitScore": 85, "infrastructureGapScore": 90, "masterPlanConflict": False },
    "Roads": { "demographicDeficitScore": 40, "infrastructureGapScore": 85, "masterPlanConflict": True },
    "Sanitation": { "demographicDeficitScore": 70, "infrastructureGapScore": 60, "masterPlanConflict": False },
    "Education": { "demographicDeficitScore": 50, "infrastructureGapScore": 45, "masterPlanConflict": False },
    "Health": { "demographicDeficitScore": 95, "infrastructureGapScore": 80, "masterPlanConflict": False },
    "Electricity": { "demographicDeficitScore": 65, "infrastructureGapScore": 75, "masterPlanConflict": False }
}

# Input verification validation schema for analytical weighting assignments
class WeightConfiguration(BaseModel):
    citizenDemand: int
    demographicDeficit: int
    infrastructureGap: int

# ---- 4. LIVE API ENDPOINTS ----

@app.post("/api/submissions")
async def submit_civic_issue(
    text_prompt: str = Form(..., description="The comment message text written or dictated by the citizen"),
    mode: str = Form(..., description="Ingestion gateway: Voice, Text, Photo, or WhatsApp"),
    image: Optional[UploadFile] = File(None, description="Optional image file attachment upload raw stream")
):
    """
    Ingest citizen submissions across Text/Voice/WhatsApp/Photos.
    Passes data to Gemini 1.5 Flash to automatically translate, evaluate fields, and classify categories.
    """
    try:
        contents = [
            "You are an AI assistant for a Member of Parliament's grievance portal. "
            "Analyze the user's submission. Translate any regional language (e.g. Hindi, Tamil, Hinglish) to English for the summary block data.",
            text_prompt
        ]
        
        if image:
            image_bytes = await image.read()
            contents.append(
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=image.content_type or "image/jpeg"
                )
            )
            
        # Execute Live GenAI Structured Query
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ComplaintAnalysis,
                temperature=0.2,
            ),
        )
        
        # Safely parse structural response back to python dictionary format
        analysis_data = json.loads(response.text)
        
        # Filter and log spam submissions instantly to isolate the MP dashboard view
        if analysis_data.get("is_spam_or_fake", False):
            return {"status": "rejected", "reason": "Submission flagged as spam/unrelated by GenAI validation layer.", "raw_analysis": analysis_data}

        # Build dynamic geocoding mock anchored to city bounds based on extraction notes
        new_entry = {
            "id": f"SUB-{random.randint(100, 999)}",
            "mode": mode,
            "text": text_prompt,
            "category": analysis_data.get("category", "Sanitation"),
            "summary": analysis_data.get("summary", ""),
            "urgency_score": int(analysis_data.get("urgency_score", 5)),
            "is_spam": False,
            "landmarks": analysis_data.get("estimated_gps_landmarks", "Unspecified region"),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            # Seeds standard bounding geometry configurations around regional center limits
            "coordinates": {
                "lat": round(24.58 + random.random() * 0.1, 4),
                "lng": round(73.68 + random.random() * 0.1, 4)
            }
        }
        
        active_submissions.append(new_entry)
        return {"status": "success", "message": "Submission ingested & processed by Gemini successfully", "data": new_entry}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal GenAI pipeline break error execution failure: {str(e)}")

@app.get("/api/hotspots")
def get_map_hotspots():
    """
    Groups dynamic geo-coordinates into categorical centers-of-mass,
    weighting them by incoming complaint volumes and urgency values.
    """
    groups: Dict[str, List[Dict]] = {}
    for sub in active_submissions:
        groups.setdefault(sub["category"], []).append(sub)

    hotspots = []
    for cat, subs in groups.items():
        total = len(subs)
        critical_count = sum(1 for s in subs if s["urgency_score"] >= 8)
        avg_lat = sum(s["coordinates"]["lat"] for s in subs) / total
        avg_lng = sum(s["coordinates"]["lng"] for s in subs) / total

        hotspots.append({
            "category": cat,
            "report_count": total,
            "critical_incident_count": critical_count,
            "center_mass_coordinates": { "lat": round(avg_lat, 4), "lng": round(avg_lng, 4) }
        })
    return {"map_hotspots": hotspots}

@app.post("/api/prioritize")
def prioritize_challenges(weights: WeightConfiguration):
    """
    Combines live customer submission trends with static census tracking layers,
    normalizing matrix arrays into a single priority list for the Member of Parliament.
    """
    w_demand = weights.citizenDemand
    w_demographic = weights.demographicDeficit
    w_gap = weights.infrastructureGap

    if w_demand + w_demographic + w_gap != 100:
        raise HTTPException(status_code=400, detail="Matrix weights metrics allocation configuration must sum up to exactly 100.")

    # Calculate live public category metrics weights dynamically based on parsed volumes and severity
    category_volume_map: Dict[str, float] = {}
    for current in active_submissions:
        # Multiplier: Scale tracking indices based directly on Gemini's parsed urgency score bounds
        severity_scalar = 2.5 if current["urgency_score"] >= 8 else 1.5 if current["urgency_score"] >= 5 else 1.0
        category_volume_map[current["category"]] = category_volume_map.get(current["category"], 0.0) + severity_scalar

    max_volume = max(category_volume_map.values()) if category_volume_map else 1.0

    evaluation_matrix = []
    for category, infra_data in regional_metrics_dataset.items():
        unnormalized_volume = category_volume_map.get(category, 0.0)
        normalized_demand_score = (unnormalized_volume / max_volume) * 100

        global_score = round(
            (normalized_demand_score * (w_demand / 100)) +
            (infra_data["demographicDeficitScore"] * (w_demographic / 100)) +
            (infra_data["infrastructureGapScore"] * (w_gap / 100))
        )

        evaluation_matrix.append({
            "category": category,
            "compositeScore": global_score,
            "metricsSource": {
                "calculatedDemandWeight": round(normalized_demand_score),
                "censusDemographicDeficit": infra_data["demographicDeficitScore"],
                "independentGapAudit": infra_data["infrastructureGapScore"],
                "masterPlanConflictFlag": infra_data["masterPlanConflict"]
            },
            "actionRecommendation": "HOLD TASK ORDER: Work project conflicts with current local Master Development Plan files." if infra_data["masterPlanConflict"] else "EXECUTE PROPOSAL RUNWAY: Clear priority tracking footprint open."
        })

    return {
        "applied_weights": {"demand": w_demand, "demographic": w_demographic, "gap": w_gap},
        "ranked_priority_matrix": sorted(evaluation_matrix, key=lambda x: x["compositeScore"], reverse=True)
    }
