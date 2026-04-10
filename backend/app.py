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
        risk_reason = ml_model.get_risk_reasoning(team_size, complexity, estimated_days, budget)
        rec_count = team_size + 2 if risk_score > 50 else team_size + 1
        resource_details = ml_model.get_resource_breakdown(rec_count, domain)
        
        return jsonify({
            "status": "success",
            "metrics": {
                "risk_score": round(risk_score, 1),
                "success_probability": round(success_prob, 1),
                "recommended_action": f"Add {rec_count} team members",
                "risk_reason": risk_reason,
                "success_reason": "High success probability is driven by adequate resource allocation and manageable task complexity." if success_prob > 60 else "Success probability is constrained by current timeline and resource gaps.",
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
            "explanation": f"The ML model analyzed your {domain} parameters and identified an intelligent complexity level of {complexity}. The resulting initial risk is {risk_score:.1f}%."
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

# Removed /api/ml/train for production-ready backend training

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