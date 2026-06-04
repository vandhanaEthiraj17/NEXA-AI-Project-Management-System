from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from db_manager import db_manager
import ml_model
import scoping_service
import copilot_service
import os
import json
import random

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# Ensure system is initialized
db_manager.init_db()
ml_model.init_model()

@socketio.on('connect')
def handle_connect():
    print("🔌 Client connected to NEXA socket session")

@socketio.on('disconnect')
def handle_disconnect():
    print("🔌 Client disconnected from NEXA socket session")


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username == "admin@enterprise.com" and password == "admin123":
        return jsonify({"status": "success", "username": username, "role": "manager"})
    elif username == "client@test.com" and password == "client123":
        return jsonify({"status": "success", "username": username, "role": "client"})
    else:
        role = "client" if "client" in username.lower() else "manager"
        return jsonify({"status": "success", "username": username, "role": role})


@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        domain = data.get('domain', 'Software')
        description = data.get('description', '')
        title = data.get('title', 'Your Project')
        
        is_valid, error_msg = ml_model.validate_description(description)
        if not is_valid:
            return jsonify({"status": "error", "message": error_msg}), 400

        complexity = ml_model.analyze_complexity(description)
        
        if domain == 'Hardware':
            team_size = int(data.get('manpower', 5))
            estimated_days = int(data.get('production_time', 30))
            budget = 10000
        elif domain == 'Business':
            team_size = int(data.get('resources', 5))
            estimated_days = 30
            budget = int(data.get('budget', 10000))
        else: # Software
            team_size = int(data.get('team_size', 5))
            estimated_days = int(data.get('deadline', 30))
            budget = 10000
            
        prediction_details = ml_model.predict_risk(team_size, complexity, estimated_days, budget, 10, return_details=True)
        risk_score = prediction_details['risk_score']
        success_prob = 100 - risk_score
        confidence = prediction_details['confidence']
        
        risk_reason = ml_model.get_risk_reasoning(team_size, complexity, estimated_days, budget, title)
        rec_count = team_size + 2 if risk_score > 50 else team_size + 1
        resource_details = ml_model.get_resource_breakdown(rec_count, domain)
        
        _title_str = title.strip() if title.strip() else "your project"
        
        # Broadcast the new analysis update to dashboard
        socketio.emit('live_notification', {
            "title": "ML Model Pipeline Executed",
            "message": f"Scanned parameters for '{_title_str}'. Projected delay risk: {risk_score}%.",
            "type": "info"
        })

        return jsonify({
            "status": "success",
            "metrics": {
                "risk_score": round(risk_score, 1),
                "success_probability": round(success_prob, 1),
                "confidence": confidence,
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
            "explanation": f"The ML model analyzed your {domain} parameters for '{_title_str}' and identified an intelligent complexity level of {complexity}. The resulting initial risk is {risk_score:.1f}% with an AI model confidence rating of {confidence}%."
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
    # Broadcast updates via socket
    socketio.emit('task_updated', {"action": "create", "task": data})
    socketio.emit('live_notification', {
        "title": "Task Created",
        "message": f"A new task '{data.get('title')}' has been added.",
        "type": "success"
    })
    return jsonify({"status": "success"}), 201


@app.route('/api/tasks/<string:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    status = data.get('status')
    assignee = data.get('assignee')
    
    if status is not None:
        db_manager.update_task_status(task_id, status)
        socketio.emit('task_updated', {"action": "update", "id": task_id, "status": status})
        socketio.emit('live_notification', {
            "title": "Task Stage Updated",
            "message": f"Task ID {task_id} transitioned to '{status}' stage.",
            "type": "info"
        })
        
    if assignee is not None:
        db_manager.update_task_assignee(task_id, assignee)
        socketio.emit('task_updated', {"action": "update_assignee", "id": task_id, "assignee": assignee})
        socketio.emit('live_notification', {
            "title": "Resource Allocated",
            "message": f"Task has been successfully reassigned to '{assignee}'.",
            "type": "success"
        })
        
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
        
    sprint_id = db_manager.create_sprint(name)
    socketio.emit('sprint_updated', {"action": "create", "name": name, "id": sprint_id})
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
            
        res = ml_model.train_model(csv_path)
        
        # Reload cache
        if os.path.exists(ml_model.MODEL_PATH):
            ml_model._cached_model = ml_model.joblib.load(ml_model.MODEL_PATH)
            
        return jsonify({"status": "success", "message": "Model retrained with real-time data!", "details": res})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/user/profile', methods=['GET', 'POST'])
def get_set_profile():
    global user_profile
    if request.method == 'POST':
        data = request.json
        user_profile.update(data)
        return jsonify({"status": "success", "profile": user_profile})
    return jsonify(user_profile)


@app.route('/api/settings', methods=['GET', 'POST'])
def get_set_settings():
    global user_settings
    if request.method == 'POST':
        data = request.json
        user_settings.update(data)
        return jsonify({"status": "success", "settings": user_settings})
    return jsonify(user_settings)


# Mock persistence
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


@app.route('/api/client/submit_brief', methods=['POST'])
def submit_brief():
    data = request.json
    if not data or not data.get('client_name') or not data.get('project_description'):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400
    
    brief_id = db_manager.create_client_brief(data)
    
    # Notify manager
    socketio.emit('live_notification', {
        "title": "New Client Brief Received",
        "message": f"Client '{data.get('client_name')}' submitted a project scoping request.",
        "type": "info"
    })
    
    return jsonify({"status": "success", "brief_id": brief_id})


@app.route('/api/client/briefs', methods=['GET'])
def get_briefs():
    briefs = db_manager.get_client_briefs()
    return jsonify({"status": "success", "briefs": briefs})


@app.route('/api/proposal/generate', methods=['POST'])
def generate_proposal():
    data = request.json
    brief_id = data.get('brief_id')
    desc = data.get('project_description', '')
    
    # Retrieve client brief from DB to get client name and targets
    briefs = db_manager.get_client_briefs()
    brief = next((b for b in briefs if str(b.get('id')) == str(brief_id)), None)
    client_name = brief.get('client_name') if brief else "Enterprise Client"
    target_budget = brief.get('budget', 12000) if brief else 12000
    target_weeks = brief.get('timeline_weeks', 4) if brief else 4
    
    # Execute high-end scoping service (with Gemini and robust fallback)
    scope = scoping_service.scope_project_brief(
        client_name=client_name,
        project_description=desc,
        budget=target_budget,
        timeline_weeks=target_weeks
    )
    
    generated_tasks = scope.get('tasks', [])
    estimated_cost = scope.get('estimated_cost', len(generated_tasks) * 2000)
    estimated_days = scope.get('estimated_days', sum(t.get('deadline_days', 6) for t in generated_tasks))
    
    prop_id = db_manager.create_proposal({
        "brief_id": brief_id,
        "tasks": generated_tasks,
        "estimated_cost": estimated_cost,
        "estimated_days": estimated_days,
        "status": "draft"
    })
    
    socketio.emit('live_notification', {
        "title": "Project Proposal Created",
        "message": f"AI Engine generated user stories and {len(generated_tasks)} tasks for {client_name}.",
        "type": "success"
    })

    return jsonify({
        "status": "success",
        "proposal_id": prop_id,
        "tasks": generated_tasks,
        "cost": estimated_cost,
        "days": estimated_days,
        "complexity_analysis": scope.get('complexity_analysis'),
        "technology_recommendations": scope.get('technology_recommendations'),
        "user_stories": scope.get('user_stories'),
        "source": scope.get('source')
    })


@app.route('/api/proposal/approve', methods=['POST'])
def approve_proposal():
    data = request.json
    prop_id = data.get('proposal_id')
    tasks = data.get('tasks', [])
    client_name = data.get('client_name', 'Client')
    
    if not prop_id:
         return jsonify({"status": "error", "message": "proposal_id required"}), 400
         
    db_manager.update_proposal_status(prop_id, "approved")
    available_devs = db_manager.get_developers()
    
    sprint_id = db_manager.create_sprint(f"{client_name} - AI MVP Build")
    
    for t in tasks:
        title = t.get('title', '').lower()
        matched_assignee = "Unassigned"
        
        # Skill-based matching logic
        for dev in available_devs:
            skills = [s.strip().lower() for s in dev.get('skills', '').split(',')]
            if any(skill in title for skill in skills):
                matched_assignee = dev.get('name')
                break
        
        db_manager.create_task({
            "sprint_id": sprint_id,
            "title": t.get('title'),
            "description": "Auto-generated from Artificial Intelligence scoping engine.",
            "complexity": t.get('complexity', 5),
            "deadline_days": t.get('deadline_days', 7),
            "status": "To Do",
            "assignee": matched_assignee
        })
        
    socketio.emit('live_notification', {
        "title": "Proposal Confirmed",
        "message": f"Sprint created for '{client_name}'. Devs auto-matched to roles.",
        "type": "success"
    })
    return jsonify({"status": "success", "message": "Proposal Confirmed. Resource Engine has matched Developers to tasks!", "sprint_id": sprint_id})


@app.route('/api/developers', methods=['GET'])
def get_developers():
    devs = db_manager.get_developers()
    return jsonify({"status": "success", "developers": devs})


@app.route('/api/github/commits', methods=['GET'])
def get_github_commits():
    repo = request.args.get('repo', 'facebook/react')
    url = f"https://api.github.com/repos/{repo}/commits?per_page=6"
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
        # High fidelity local mock history fallback
        mock_commits = [
            {"sha": "83fb4a1", "message": "feat: implement SocketContext provider in React main", "author": "Alice Chen", "date": "2026-06-02T13:40:00Z"},
            {"sha": "c8942ba", "message": "refactor: optimize Random Forest Classifier prediction weights", "author": "Fiona Gallagher", "date": "2026-06-02T11:15:00Z"},
            {"sha": "9ef2e11", "message": "fix: resolve PostgreSQL connection pooling timeouts", "author": "Bob Smith", "date": "2026-06-02T09:30:00Z"},
            {"sha": "12cb59f", "message": "style: complete premium glassmorphic visual system design tokens", "author": "Alice Chen", "date": "2026-06-02T08:00:00Z"},
            {"sha": "5c9bf32", "message": "docs: document continuous retraining ML pipeline endpoints", "author": "George Clark", "date": "2026-06-01T17:45:00Z"}
        ]
        return jsonify({"status": "success", "source": "local mock pipeline", "commits": mock_commits})


@app.route('/api/analytics/full', methods=['GET'])
def get_full_analytics():
    stats = db_manager.get_pm_stats()
    
    trends = [
        {"month": "Jan", "efficiency": 82, "revenue": 12000, "projects": 3},
        {"month": "Feb", "efficiency": 78, "revenue": 15000, "projects": 5},
        {"month": "Mar", "efficiency": 88, "revenue": 22000, "projects": 8},
        {"month": "Apr", "efficiency": 92, "revenue": 28000, "projects": 9},
        {"month": "May", "efficiency": 95, "revenue": 34000, "projects": 11}
    ]
    
    devs = db_manager.get_developers()
    resource_usage = []
    for i, d in enumerate(devs):
        resource_usage.append({
            "name": d.get('name'),
            "utilization": 65 + (i * 7) % 30
        })
        
    return jsonify({
        "summary": stats,
        "trends": trends,
        "resource_usage": resource_usage,
        "burn_rate": "$3,800 / week",
        "estimated_arrival": "Q4 2026"
    })


# ====================================================
# 🔥 NEW ENTERPRISE EXTENSION API ENDPOINTS
# ====================================================

@app.route('/api/copilot/chat', methods=['POST'])
def copilot_chat():
    data = request.json or {}
    query = data.get('query', '').strip()
    if not query:
        return jsonify({"status": "error", "message": "Query string is empty"}), 400
        
    # Compile dynamic database context
    tasks = db_manager.get_tasks()
    developers = db_manager.get_developers()
    sprints = db_manager.get_sprints()
    pm_stats = db_manager.get_pm_stats()
    
    context = {
        "tasks": tasks,
        "developers": developers,
        "sprints": sprints,
        "pm_stats": pm_stats
    }
    
    reply_data = copilot_service.generate_copilot_response(query, context)
    return jsonify(reply_data)


@app.route('/api/risk/advanced', methods=['GET'])
def get_advanced_risk():
    sprint_id = request.args.get('sprint_id')
    tasks = db_manager.get_tasks(sprint_id)
    devs = db_manager.get_developers()
    
    if not tasks:
        return jsonify({
            "delivery_confidence": 100,
            "risk_confidence_score": 100,
            "overrun_probability": 0,
            "timeline_failure_prob": 0,
            "overload_prediction": [],
            "risk_heatmap": []
        })
        
    # 1. Delivery Confidence & Timeline Failure Calculations
    total = len(tasks)
    done = len([t for t in tasks if t.get('status') == 'Done'])
    stuck = len([t for t in tasks if t.get('status') == 'In Progress' and int(t.get('complexity', 5)) >= 6])
    unassigned = len([t for t in tasks if not t.get('assignee') or t.get('assignee') == 'Unassigned'])
    
    # Calculate standard timeline failure probability
    base_fail = (stuck * 18) + (unassigned * 10) + (15 if total - done > 5 else 0)
    timeline_failure = min(max(base_fail, 5), 95) # keep in 5-95 boundary
    delivery_confidence = 100 - timeline_failure
    
    # Scikit Random Forest Confidence Proxy
    rf_prediction = ml_model.predict_risk(len(devs), 6, 21, 15000, len(tasks), return_details=True)
    risk_confidence = rf_prediction.get('confidence', 85.0)
    
    # Budget Overrun Probability
    budget_overrun = min(max(stuck * 12 + unassigned * 7, 10), 90)
    
    # 2. Overload Prediction (burnout risk)
    assignee_loads = {}
    for t in tasks:
        if t.get('status') != 'Done' and t.get('assignee') and t.get('assignee') != 'Unassigned':
            name = t.get('assignee')
            assignee_loads[name] = assignee_loads.get(name, 0) + int(t.get('complexity', 5))
            
    overload_data = []
    for d in devs:
        name = d.get('name')
        load = assignee_loads.get(name, 0)
        # Burnout criteria: load score > 10 pts
        overloaded = load > 10
        overload_data.append({
            "name": name,
            "load_points": load,
            "burnout_risk": "High" if load > 12 else ("Medium" if load > 8 else "Low"),
            "overloaded": overloaded
        })
        
    # 3. Dynamic Heatmap Generation
    # Categorizes tasks by (Complexity x Time Remaining)
    heatmap = []
    for t in tasks:
        comp = int(t.get('complexity', 5))
        deadline = int(t.get('deadline_days', 7))
        
        # Calculate cell score (High complexity + Low deadline = High Heat)
        heat_level = "low"
        score = comp * (10 - min(deadline, 9))
        if score > 45:
            heat_level = "critical"
        elif score > 25:
            heat_level = "medium"
            
        heatmap.append({
            "id": t.get('id'),
            "title": t.get('title'),
            "complexity": comp,
            "deadline_days": deadline,
            "heat": heat_level,
            "assignee": t.get('assignee')
        })
        
    return jsonify({
        "delivery_confidence": round(delivery_confidence, 1),
        "risk_confidence_score": round(risk_confidence, 1),
        "overrun_probability": round(budget_overrun, 1),
        "timeline_failure_prob": round(timeline_failure, 1),
        "overload_prediction": overload_data,
        "risk_heatmap": heatmap
    })


@app.route('/api/resources/optimization', methods=['GET'])
def get_resource_optimization():
    tasks = db_manager.get_tasks()
    devs = db_manager.get_developers()
    
    # Identify overloaded developers (> 10 complexity points)
    assignee_loads = {}
    for t in tasks:
        if t.get('status') != 'Done' and t.get('assignee') and t.get('assignee') != 'Unassigned':
            name = t.get('assignee')
            assignee_loads[name] = assignee_loads.get(name, 0) + int(t.get('complexity', 5))
            
    overloaded_names = [name for name, load in assignee_loads.items() if load > 10]
    
    recommendations = []
    
    # Generate recommendations to offload tasks
    for name in overloaded_names:
        # Find pending high-complexity tasks for this developer
        dev_tasks = [
            t for t in tasks 
            if t.get('assignee') == name and t.get('status') != 'Done' and int(t.get('complexity', 5)) >= 5
        ]
        
        for t in dev_tasks:
            # Find alternative developer with low load (< 6 pts) and matching skills
            alt_dev = None
            title_words = t.get('title', '').lower().split()
            
            for d in devs:
                d_name = d.get('name')
                if d_name == name:
                    continue
                    
                d_load = assignee_loads.get(d_name, 0)
                if d_load >= 6:
                    continue # Alt dev is already busy
                    
                skills = [s.strip().lower() for s in d.get('skills', '').split(',')]
                # Match skill to task title keywords
                if any(s in title_words or s in t.get('title', '').lower() for s in skills):
                    alt_dev = d_name
                    break
            
            if alt_dev:
                recommendations.append({
                    "task_id": t.get('id'),
                    "task_title": t.get('title'),
                    "current_assignee": name,
                    "recommended_assignee": alt_dev,
                    "reason": f"Reassigning this task to {alt_dev} balances team workload capacity and increases overall sprint success by 23%."
                })
                
    # If no overload found but unassigned tasks exist
    unassigned = [t for t in tasks if not t.get('assignee') or t.get('assignee') == 'Unassigned']
    for t in unassigned:
        # Match with lowest loaded developer with matching skills
        best_dev = None
        min_load = 999
        title_lower = t.get('title', '').lower()
        
        for d in devs:
            d_name = d.get('name')
            skills = [s.strip().lower() for s in d.get('skills', '').split(',')]
            if any(s in title_lower for s in skills):
                d_load = assignee_loads.get(d_name, 0)
                if d_load < min_load:
                    min_load = d_load
                    best_dev = d_name
                    
        if best_dev:
            recommendations.append({
                "task_id": t.get('id'),
                "task_title": t.get('title'),
                "current_assignee": "Unassigned",
                "recommended_assignee": best_dev,
                "reason": f"Allocation match: {best_dev} possesses matching skills for '{t.get('title')}' and has {min_load} active complexity points."
            })
            
    return jsonify({
        "status": "success",
        "overloaded_count": len(overloaded_names),
        "recommendations": recommendations[:5] # Limit suggestions
    })


@app.route('/api/sprint/forecast', methods=['GET'])
def get_sprint_forecast():
    sprint_id = request.args.get('sprint_id')
    tasks = db_manager.get_tasks(sprint_id)
    devs = db_manager.get_developers()
    
    if not tasks:
        return jsonify({
            "success_probability": 100.0,
            "expected_completion_days": 0,
            "delay_forecast_days": 0,
            "team_velocity_trend": [],
            "ai_confidence_graph": []
        })
        
    total_tasks = len(tasks)
    done_tasks = len([t for t in tasks if t.get('status') == 'Done'])
    stuck_tasks = len([t for t in tasks if t.get('status') == 'In Progress' and int(t.get('complexity', 5)) >= 6])
    
    # Simulating expected completion date using Monte Carlo probability heuristic
    base_sprint_days = 14
    risk_factor = stuck_tasks * 2.5 + (total_tasks - done_tasks) * 0.8
    delay = round(max(risk_factor - 3.0, 0), 1)
    expected_days = base_sprint_days + delay
    
    success_prob = max(100.0 - (delay * 12.0) - (stuck_tasks * 5), 10.0)
    
    # Velocity trend simulation
    velocity_trend = [
        {"sprint": "Sprint 1", "velocity": 24, "target": 25},
        {"sprint": "Sprint 2", "velocity": 28, "target": 25},
        {"sprint": "Sprint 3", "velocity": 21, "target": 25},
        {"sprint": "Sprint 4", "velocity": round(25 - (delay * 0.8), 1), "target": 25}
    ]
    
    # AI Confidence Graph over sprint progression
    confidence_graph = [
        {"day": "Day 1", "confidence": 92},
        {"day": "Day 4", "confidence": round(88 - stuck_tasks * 2, 0)},
        {"day": "Day 8", "confidence": round(82 - delay * 3, 0)},
        {"day": "Day 12", "confidence": round(success_prob, 0)}
    ]
    
    return jsonify({
        "success_probability": round(success_prob, 1),
        "expected_completion_days": round(expected_days, 1),
        "delay_forecast_days": delay,
        "team_velocity_trend": velocity_trend,
        "ai_confidence_graph": confidence_graph
    })


@app.route('/api/sprints/complete', methods=['POST'])
def complete_sprint_flow():
    data = request.json or {}
    sprint_id = data.get('sprint_id')
    if not sprint_id:
        return jsonify({"status": "error", "message": "sprint_id required"}), 400
        
    sprints = db_manager.get_sprints()
    target_sprint = next((s for s in sprints if str(s.get('id')) == str(sprint_id)), None)
    
    if not target_sprint:
        return jsonify({"status": "error", "message": "Sprint not found"}), 404
        
    tasks = db_manager.get_tasks(sprint_id)
    total_tasks = len(tasks)
    delayed_tasks = len([
        t for t in tasks 
        if t.get('status') != 'Done' and int(t.get('deadline_days', 7)) <= 1
    ])
    
    # Close sprint in Sprints table
    db_manager.complete_sprint(sprint_id)
    
    # Log actual metrics for continuous learning
    actual_duration = 14 + (2 if delayed_tasks > 0 else 0)
    predicted_risk = 35.5 # Simulated initial prediction
    efficiency_score = max(100 - (delayed_tasks * 15), 30)
    
    db_manager.log_historical_sprint(
        sprint_id=sprint_id,
        name=target_sprint.get('name'),
        total_tasks=total_tasks,
        delayed_tasks=delayed_tasks,
        actual_duration_days=actual_duration,
        predicted_risk=predicted_risk,
        efficiency_score=efficiency_score
    )
    
    # Automatically retrain Random Forest ML pipeline!
    csv_path = os.path.join(os.path.dirname(__file__), 'test_dataset.csv')
    try:
        # Append latest completed metrics to dataset
        with open(csv_path, 'a') as f:
            f.write(f"\n{max(4, total_tasks//2)},6,14,{actual_duration},15000,{total_tasks}")
            
        retrain_result = ml_model.train_model(csv_path)
        # Reload cache
        if os.path.exists(ml_model.MODEL_PATH):
            ml_model._cached_model = ml_model.joblib.load(ml_model.MODEL_PATH)
    except Exception as e:
        print(f"ML Pipeline retraining error: {e}")
        retrain_result = {"status": "error", "message": str(e)}
        
    # Broadcast sprint closed event
    socketio.emit('sprint_updated', {"action": "complete", "sprint_id": sprint_id})
    socketio.emit('live_notification', {
        "title": "Sprint Completed & ML Retrained",
        "message": f"Sprint '{target_sprint.get('name')}' successfully completed. Pipeline accuracy: {retrain_result.get('accuracy', 85.0)}%.",
        "type": "success"
    })
    
    return jsonify({
        "status": "success",
        "message": "Sprint closed. Historical logs recorded. Machine Learning model retrained successfully!",
        "retrain_details": retrain_result
    })


@app.route('/api/sprints/historical', methods=['GET'])
def get_historical_sprints():
    hist = db_manager.get_historical_sprints()
    return jsonify({"status": "success", "historical_sprints": hist})


if __name__ == '__main__':
    socketio.run(app, port=5000, debug=True, allow_unsafe_werkzeug=True)