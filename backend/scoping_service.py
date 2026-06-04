import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

def scope_project_brief(client_name, project_description, budget=10000, timeline_weeks=4):
    """
    Scopes a project brief using Google Gemini API.
    If GEMINI_API_KEY is not set, falls back to a highly realistic heuristic pipeline.
    """
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            
            prompt = f"""
            You are a Senior Project Manager and Technical Architect.
            Analyze the following project brief from client "{client_name}":
            Description: "{project_description}"
            Target Budget: ${budget}
            Target Timeline: {timeline_weeks} weeks

            Deconstruct this project into a production-grade enterprise sprint scoping.
            Provide a strictly valid JSON response (no markdown formatting, no code fences, just raw JSON) containing exactly these keys:
            {{
                "user_stories": [
                    {{"title": "User Story 1 Title", "description": "As a... I want to... So that..."}},
                    ...
                ],
                "tasks": [
                    {{"title": "Specific Engineering Task Name", "complexity": 1-10 (integer), "deadline_days": 1-14 (integer)}}
                ],
                "complexity_analysis": "Detailed architectural explanation of the technical complexity and challenges.",
                "estimated_cost": integer_cost_calculation,
                "estimated_days": total_days_sum,
                "technology_recommendations": ["Tech 1", "Tech 2", "Tech 3"]
            }}
            Ensure your response is valid JSON that can be parsed by `json.loads`.
            """

            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
            
            response = requests.post(url, json=payload, timeout=12)
            
            if response.ok:
                resp_json = response.json()
                text = resp_json['candidates'][0]['content']['parts'][0]['text']
                # Clean up any potential markdown wraps
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0]
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0]
                
                parsed_data = json.loads(text.strip())
                return {
                    "status": "success",
                    "source": "Gemini AI Engine",
                    **parsed_data
                }
            else:
                print(f"Gemini API returned error: {response.text}")
        except Exception as e:
            print(f"Failed to scope project via Gemini: {e}")

    # Highly robust heuristic fallback pipeline
    print("🚀 Using NEXA AI Heuristic Scoping Engine (Fallback)")
    return get_heuristic_scoping(client_name, project_description, budget, timeline_weeks)


def get_heuristic_scoping(client_name, desc, budget, timeline_weeks):
    desc_lower = desc.lower()
    
    # Identify domains/keywords
    has_web = any(w in desc_lower for w in ['web', 'react', 'frontend', 'dashboard', 'website'])
    has_mobile = any(w in desc_lower for w in ['mobile', 'app', 'ios', 'android', 'phone', 'react native', 'flutter'])
    has_db = any(w in desc_lower for w in ['database', 'db', 'sql', 'postgres', 'mongodb', 'auth', 'login'])
    has_ai = any(w in desc_lower for w in ['ai', 'ml', 'machine learning', 'llm', 'chatgpt', 'openai', 'model'])
    
    user_stories = []
    tasks = []
    techs = []
    
    # Setup setup tasks
    tasks.append({"title": "Strategic Architecture & Infrastructure Setup", "complexity": 4, "deadline_days": 3})
    
    if has_web or (not has_mobile and not has_db and not has_ai):
        user_stories.append({
            "title": "Interactive Client Portal Access",
            "description": f"As a customer of {client_name}, I want a highly interactive, responsive web portal so that I can manage my account parameters."
        })
        tasks.extend([
            {"title": "Core React UI Layout and Theme Setup", "complexity": 4, "deadline_days": 4},
            {"title": "Responsive Dashboard Panels & Metrics Visualizations", "complexity": 5, "deadline_days": 5},
            {"title": "SEO & Performance Analytics Pipeline Setup", "complexity": 3, "deadline_days": 2}
        ])
        techs.extend(["React 19", "Tailwind CSS v4", "Vite", "Recharts"])

    if has_mobile:
        user_stories.append({
            "title": "On-the-go Mobile Control",
            "description": f"As a core user of {client_name}, I want a cross-platform mobile application so that I can receive push notification alerts anywhere."
        })
        tasks.extend([
            {"title": "Cross-Platform Mobile Interface Setup (React Native/Flutter)", "complexity": 7, "deadline_days": 6},
            {"title": "Local SQLite Secure Storage Integration", "complexity": 6, "deadline_days": 4},
            {"title": "Biometric Authentication & Native Push Channels", "complexity": 6, "deadline_days": 3}
        ])
        techs.extend(["React Native", "Expo", "Fastlane", "Firebase Push Notifications"])

    if has_db:
        user_stories.append({
            "title": "Secure Enterprise Data Integrity",
            "description": f"As an Administrator for {client_name}, I want secure data storage and role-based permissions to ensure compliance."
        })
        tasks.extend([
            {"title": "PostgreSQL Schema Migrations & Index Tuning", "complexity": 7, "deadline_days": 5},
            {"title": "JWT/OAuth2 Session Manager Setup", "complexity": 6, "deadline_days": 3},
            {"title": "Redis Query Cache Layer Integration", "complexity": 5, "deadline_days": 3}
        ])
        techs.extend(["PostgreSQL", "Prisma ORM", "Redis Cache", "OAuth 2.0"])

    if has_ai:
        user_stories.append({
            "title": "Cognitive Workflow Automation",
            "description": f"As a Project Manager at {client_name}, I want automated AI decision recommendations to minimize delivery bottleneck risks."
        })
        tasks.extend([
            {"title": "Google Gemini API Connection Setup & Scoping Prompt Engineering", "complexity": 8, "deadline_days": 5},
            {"title": "Vector Database (Pinecone/Milvus) Document Chunking Pipeline", "complexity": 7, "deadline_days": 4},
            {"title": "Random Forest Project Analytics Model Retraining Pipeline", "complexity": 8, "deadline_days": 4}
        ])
        techs.extend(["Google Gemini API", "Scikit-Learn", "Pinecone DB", "LangChain"])

    # Generic final tasks
    tasks.append({"title": "Comprehensive Unit Testing & Security Hardening", "complexity": 5, "deadline_days": 3})
    tasks.append({"title": "Final Production Deployment (Vercel/Docker)", "complexity": 4, "deadline_days": 2})
    
    if not techs:
        techs = ["NodeJS", "Express", "React", "MongoDB"]
        
    estimated_cost = len(tasks) * 2200
    estimated_days = sum(t['deadline_days'] for t in tasks)
    
    comp_analysis = f"Architectural evaluation for '{client_name}' suggests a modular deployment strategy. "
    if len(tasks) > 6:
        comp_analysis += "Due to the multi-layered requirement (AI/Mobile/Database), strict decoupled service microservices are advised."
    else:
        comp_analysis += "A standard monolithic architecture is highly optimized to deliver the MVP fast."
        
    return {
        "status": "success",
        "source": "NEXA AI Heuristic Engine",
        "user_stories": user_stories if user_stories else [{"title": "MVP Launch", "description": f"As a business owner of {client_name}, I want a fast MVP so I can gather user data."}],
        "tasks": tasks,
        "complexity_analysis": comp_analysis,
        "estimated_cost": estimated_cost,
        "estimated_days": estimated_days,
        "technology_recommendations": list(set(techs))
    }
