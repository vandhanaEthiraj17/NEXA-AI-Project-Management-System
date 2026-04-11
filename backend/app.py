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
    alerts = []
    recommendation = "Maintain current velocity."
    
    if in_progress > 0 and avg_comp > 4:
        risk_score += 40.0
        alerts.append(f"High risk: {in_progress} complex tasks are bottlenecked in Progress.")
        recommendation = "Recommend adding 2 developers to unblock 'In Progress' queue."
    elif (total_tasks - done_tasks) > 5 and avg_comp > 6:
        risk_score += 30.0
        alerts.append("Timeline limit approaching due to high volume of complex remaining tasks.")
        recommendation = "Consider extending the sprint timeline by 5 days."
        
    if risk_score >= 40:
        return jsonify({"status": "warning", "message": " ".join(alerts), "recommendation": recommendation, "risk": risk_score})
        
    return jsonify({"status": "stable", "message": "Sprint is proceeding normally.", "recommendation": "Continue execution.", "risk": risk_score})

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

if __name__ == '__main__':
    app.run(port=5000, debug=True)