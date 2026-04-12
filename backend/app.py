from flask import Flask, request, jsonify
from flask_cors import CORS
from db_manager import db_manager
import ml_model
import os

app = Flask(__name__)
CORS(app)

# Ensure system is initialized
db_manager.init_db()
ml_model.init_model()

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        domain = data.get('domain', 'Software')
        description = data.get('description', '')
        title = data.get('title', 'Your Project')
        
        # 0. Validate Input Quality (Professional Guardrail)
        is_valid, error_msg = ml_model.validate_description(description)
        if not is_valid:
            return jsonify({"status": "error", "message": error_msg}), 400

        # 1. AI Complexity Analysis (Dynamic Intelligence)
        complexity = ml_model.analyze_complexity(description)
        
        # 2. Domain-Specific Parameter Mapping
        if domain == 'Hardware':
            team_size = int(data.get('manpower', 5))
            estimated_days = int(data.get('production_time', 30))
            budget = 10000 # Default for HW in this version
        elif domain == 'Business':
            team_size = int(data.get('resources', 5))
            estimated_days = 30 # Standard business cycle
            budget = int(data.get('budget', 10000))
        else: # Software
            team_size = int(data.get('team_size', 5))
            estimated_days = int(data.get('deadline', 30))
            budget = 10000 # Default
            
        # 3. Predict Risk using ML Model
        risk_score = ml_model.predict_risk(team_size, complexity, estimated_days, budget, 10)
        success_prob = 100 - risk_score
        
        # 4. Generate Reasoning and Details
        risk_reason = ml_model.get_risk_reasoning(team_size, complexity, estimated_days, budget, title)
        rec_count = team_size + 2 if risk_score > 50 else team_size + 1
        resource_details = ml_model.get_resource_breakdown(rec_count, domain)
        
        _title_str = title.strip() if title.strip() else "your project"
        
        return jsonify({
            "status": "success",
            "metrics": {
                "risk_score": round(risk_score, 1),
                "success_probability": round(success_prob, 1),
                "recommended_action": f"Add {rec_count} team members specific to '{_title_str}'",
                "risk_reason": risk_reason,
                "success_reason": f"High success probability for '{_title_str}' is driven by adequate resource allocation and manageable complexity." if success_prob > 60 else f"Success for '{_title_str}' is heavily constrained by current timeline and operational gaps.",
                "resource_details": resource_details
            },
            "scenarios": [
                { "name": "Current Timeline", "risk": round(risk_score, 1) },
                { "name": "Extend 5 Days", "risk": round(max(0, risk_score - 15), 1) },
                { "name": "Add 2 Devs", "risk": round(max(0, risk_score - 25), 1) }
            ],
            "best_decision": {
                "name": "Add 2 Devs" if risk_score > 50 else "Current Timeline",
                "risk": round(max(0, risk_score - 25), 1) if risk_score > 50 else round(risk_score, 1),
                "cost": f"${budget * 0.1:,.0f}"
            },
            "explanation": f"The ML model analyzed your {domain} parameters for '{_title_str}' and identified an intelligent complexity level of {complexity}. The resulting initial risk is {risk_score:.1f}%."
        })
    except Exception as e:
        print(f"Analysis Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    sprint_id = request.args.get('sprint_id')
    tasks = db_manager.get_tasks(sprint_id)
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    db_manager.create_task(data)
    return jsonify({"status": "success"}), 201

@app.route('/api/tasks/<string:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    status = data.get('status')
    db_manager.update_task_status(task_id, status)
    return jsonify({"status": "success"})

@app.route('/api/sprints', methods=['GET'])
def get_sprints():
    sprints = db_manager.get_sprints()
    return jsonify(sprints)

@app.route('/api/sprints', methods=['POST'])
def create_sprint():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"status": "error", "message": "Name is required"}), 400
        
    db_manager.create_sprint(name)
    return jsonify({"status": "success"}), 201

@app.route('/api/pm/stats', methods=['GET'])
def get_pm_stats():
    stats = db_manager.get_pm_stats()
    return jsonify(stats)

@app.route('/api/sprint/monitor', methods=['GET'])
def monitor_sprint():
    sprint_id = request.args.get('sprint_id')
    if not sprint_id:
        return jsonify({"status": "error", "message": "sprint_id required"}), 400
        
    tasks = db_manager.get_tasks(sprint_id)
    if not tasks:
        return jsonify({"status": "stable", "message": "No tasks to monitor.", "risk": 0})
        
    total_tasks = len(tasks)
    done_tasks = len([t for t in tasks if t.get('status') == 'Done'])
    in_progress = len([t for t in tasks if t.get('status') == 'In Progress'])
    
    total_complexity = sum([int(t.get('complexity', 5)) for t in tasks])
    avg_comp = total_complexity / total_tasks if total_tasks > 0 else 0
    
    if done_tasks == total_tasks:
        return jsonify({"status": "complete", "message": "All tasks are complete!", "risk": 0})
        
    risk_score = 10.0
    detailed_risks = []
    
    unassigned_tasks = [t for t in tasks if t.get('status') in ['To Do', 'In Progress'] and (not t.get('assignee') or t.get('assignee') == 'Unassigned')]
    if unassigned_tasks:
        risk_score += (10.0 * len(unassigned_tasks))
        detailed_risks.append({
            "type": "Unassigned Tasks",
            "message": f"Found {len(unassigned_tasks)} pending tasks with no assignee.",
            "tasks": [t.get('title', 'Unknown') for t in unassigned_tasks]
        })

    stuck_tasks = [t for t in tasks if t.get('status') == 'In Progress' and int(t.get('complexity', 5)) >= 6]
    if stuck_tasks:
        risk_score += (15.0 * len(stuck_tasks))
        detailed_risks.append({
            "type": "Bottlenecked in Progress",
            "message": "High complexity tasks are stuck in execution.",
            "tasks": [t.get('title', 'Unknown') for t in stuck_tasks]
        })

    deadline_risks = [t for t in tasks if t.get('status') != 'Done' and int(t.get('deadline_days', 7)) <= 2 and int(t.get('complexity', 5)) >= 5]
    if deadline_risks:
        risk_score += 20.0
        detailed_risks.append({
            "type": "Imminent Deadline",
            "message": "Tasks nearing deadline with high remaining complexity.",
            "tasks": [t.get('title', 'Unknown') for t in deadline_risks]
        })

    recommendation = "Maintain current velocity."
    if risk_score >= 40:
        recommendation = "Immediate intervention required. Allocate devs to stuck tasks and assign unassigned items."
        return jsonify({"status": "warning", "message": "Critical workflow bottlenecks detected.", "recommendation": recommendation, "risk": min(risk_score, 100), "detailed_risks": detailed_risks})
    elif detailed_risks:
        recommendation = "Monitor identified workflows to prevent delay."
        return jsonify({"status": "warning", "message": "Minor workflow risks detected.", "recommendation": recommendation, "risk": min(risk_score, 100), "detailed_risks": detailed_risks})
        
    return jsonify({"status": "stable", "message": "Sprint is proceeding normally.", "recommendation": "Continue execution.", "risk": risk_score, "detailed_risks": []})

@app.route('/api/ml/train/realtime', methods=['POST'])
def train_realtime():
    data = request.json
    try:
        team_size = int(data.get('team_size', 5))
        project_complexity = int(data.get('project_complexity', 5))
        estimated_days = int(data.get('estimated_days', 30))
        actual_days = int(data.get('actual_days', 35))
        budget = int(data.get('budget', 10000))
        task_count = int(data.get('task_count', 10))
        
        csv_path = os.path.join(os.path.dirname(__file__), 'test_dataset.csv')
        
        # Append to CSV
        with open(csv_path, 'a') as f:
            f.write(f"\n{team_size},{project_complexity},{estimated_days},{actual_days},{budget},{task_count}")
            
        # Trigger Retrain
        res = ml_model.train_model(csv_path)
        
        # Reload cache in global space immediately
        ml_model._cached_model = ml_model.joblib.load(ml_model.MODEL_PATH)
        
        return jsonify({"status": "success", "message": "Model retrained with real-time data!", "details": res})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Mock Persistence for Profile and Settings ---
user_profile = {
    "name": "Admin User",
    "email": "admin@enterprise.com",
    "role": "Project Manager",
    "department": "Engineering Operations"
}

user_settings = {
    "theme": "light",
    "editor_mode": "visual",
    "notifications": True
}

@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    return jsonify(user_profile)

@app.route('/api/user/profile', methods=['POST'])
def update_profile():
    global user_profile
    data = request.json
    user_profile.update(data)
    return jsonify({"status": "success", "profile": user_profile})

@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify(user_settings)

@app.route('/api/settings', methods=['POST'])
def update_settings():
    global user_settings
    data = request.json
    user_settings.update(data)
    return jsonify({"status": "success", "settings": user_settings})

@app.route('/api/client/submit_brief', methods=['POST'])
def submit_brief():
    data = request.json
    if not data or not data.get('client_name') or not data.get('project_description'):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400
    
    brief_id = db_manager.create_client_brief(data)
    return jsonify({"status": "success", "brief_id": brief_id})

@app.route('/api/client/briefs', methods=['GET'])
def get_briefs():
    briefs = db_manager.get_client_briefs()
    return jsonify({"status": "success", "briefs": briefs})

@app.route('/api/proposal/generate', methods=['POST'])
def generate_proposal():
    data = request.json
    brief_id = data.get('brief_id')
    desc = data.get('project_description', '').lower()
    
    # Basic rudimentary NLP mapping rule-set for AI task generation
    generated_tasks = [
        {"title": "Initial Requirement & Architecture Documentation", "complexity": 3, "deadline_days": 3}
    ]
    
    if "app" in desc or "mobile" in desc:
        generated_tasks.extend([
            {"title": "Mobile UX/UI Wireframing", "complexity": 4, "deadline_days": 5},
            {"title": "iOS/Android Native Shell Configuration", "complexity": 6, "deadline_days": 7},
            {"title": "Mobile App Store Deployment", "complexity": 5, "deadline_days": 2}
        ])
    if "web" in desc or "site" in desc or "platform" in desc:
        generated_tasks.extend([
            {"title": "Frontend React Structure", "complexity": 5, "deadline_days": 5},
            {"title": "Web Responsive Design Layouts", "complexity": 4, "deadline_days": 4}
        ])
    if "database" in desc or "data" in desc or "backend" in desc:
        generated_tasks.extend([
            {"title": "Database Schema Design", "complexity": 7, "deadline_days": 5},
            {"title": "Core API Routing Implementation", "complexity": 6, "deadline_days": 6}
        ])
        
    generated_tasks.append({"title": "Final QA & Production Sign-off", "complexity": 4, "deadline_days": 3})
    
    estimated_cost = len(generated_tasks) * 2000
    estimated_days = sum(t['deadline_days'] for t in generated_tasks)
    
    prop_id = db_manager.create_proposal({
        "brief_id": brief_id,
        "tasks": generated_tasks,
        "estimated_cost": estimated_cost,
        "estimated_days": estimated_days,
        "status": "draft"
    })
    
    return jsonify({"status": "success", "proposal_id": prop_id, "tasks": generated_tasks, "cost": estimated_cost, "days": estimated_days})

@app.route('/api/proposal/approve', methods=['POST'])
def approve_proposal():
    data = request.json
    prop_id = data.get('proposal_id')
    tasks = data.get('tasks', [])
    client_name = data.get('client_name', 'Client')
    
    if not prop_id:
         return jsonify({"status": "error", "message": "proposal_id required"}), 400
         
    # Update proposal status
    db_manager.update_proposal_status(prop_id, "approved")
    
    # Fetch all available developers for matching
    available_devs = db_manager.get_developers()
    
    # Auto-generate active sprint from proposal!
    sprint_id = db_manager.create_sprint(f"{client_name} - AI MVP Build")
    for t in tasks:
        title = t.get('title', '').lower()
        matched_assignee = "Unassigned"
        
        # Skill-based matching logic
        for dev in available_devs:
            skills = dev.get('skills', '').split(',')
            if any(skill in title for skill in skills):
                matched_assignee = dev.get('name')
                break
        
        db_manager.create_task({
            "sprint_id": sprint_id,
            "title": t.get('title'),
            "description": "Auto-generated from Artificial Intelligence scoping engine.",
            "complexity": t.get('complexity'),
            "deadline_days": t.get('deadline_days'),
            "status": "To Do",
            "assignee": matched_assignee
        })
        
    return jsonify({"status": "success", "message": "Proposal Confirmed. Resource Engine has matched Developers to tasks!", "sprint_id": sprint_id})

@app.route('/api/developers', methods=['GET'])
def get_developers():
    devs = db_manager.get_developers()
    return jsonify({"status": "success", "developers": devs})

@app.route('/api/github/commits', methods=['GET'])
def get_github_commits():
    repo = request.args.get('repo', 'facebook/react') # Default for demo
    url = f"https://api.github.com/repos/{repo}/commits?per_page=5"
    try:
        import requests
        response = requests.get(url, timeout=5)
        if response.ok:
            commits = response.json()
            formatted_commits = []
            for c in commits:
                formatted_commits.append({
                    "sha": c['sha'][:7],
                    "message": c['commit']['message'].split('\n')[0],
                    "author": c['commit']['author']['name'],
                    "date": c['commit']['author']['date']
                })
            return jsonify({"status": "success", "commits": formatted_commits})
        else:
            return jsonify({"status": "error", "message": "Failed to fetch from GitHub"}), 502
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)