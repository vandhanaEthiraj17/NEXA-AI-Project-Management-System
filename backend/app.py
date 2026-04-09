from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db
import ml_model
import os

app = Flask(__name__)
CORS(app)

# Ensure system is initialized
init_db()
ml_model.init_model()

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    domain = data.get('domain', 'Software')
    
    # Default values falling back securely
    team_size = int(data.get('team_size', 5))
    complexity = 5 
    estimated_days = int(data.get('deadline', 30))
    budget = int(data.get('budget', 10000))
    
    risk_score = ml_model.predict_risk(team_size, complexity, estimated_days, budget, 10)
    success_prob = 100 - risk_score
    
    # Generate enhanced logic
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
        "explanation": f"The ML model analyzed your domain parameters and identified an initial risk of {risk_score:.1f}%. By adjusting team allocation, you can significantly optimize project delivery."
    })

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    sprint_id = request.args.get('sprint_id')
    conn = get_db_connection()
    if sprint_id:
        tasks = conn.execute('SELECT * FROM Tasks WHERE sprint_id = ?', (sprint_id,)).fetchall()
    else:
        tasks = conn.execute('SELECT * FROM Tasks').fetchall()
    conn.close()
    return jsonify([dict(t) for t in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    sprint_id = data.get('sprint_id')
    title = data.get('title')
    description = data.get('description', '')
    status = data.get('status', 'To Do')
    assignee = data.get('assignee', '')
    complexity = data.get('complexity', 5)
    deadline_days = data.get('deadline_days', 7)
    risk_score = data.get('risk_score', 0)

    conn = get_db_connection()
    conn.execute('''
        INSERT INTO Tasks (sprint_id, title, description, status, assignee, complexity, deadline_days, risk_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (sprint_id, title, description, status, assignee, complexity, deadline_days, risk_score))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"}), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    status = data.get('status')
    conn = get_db_connection()
    conn.execute('UPDATE Tasks SET status = ? WHERE id = ?', (status, task_id))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/sprints', methods=['GET'])
def get_sprints():
    conn = get_db_connection()
    sprints = conn.execute('SELECT * FROM Sprints').fetchall()
    conn.close()
    return jsonify([dict(s) for s in sprints])

@app.route('/api/sprints', methods=['POST'])
def create_sprint():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"status": "error", "message": "Name is required"}), 400
        
    conn = get_db_connection()
    conn.execute("INSERT INTO Sprints (name, status) VALUES (?, 'active')", (name,))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"}), 201

@app.route('/api/pm/stats', methods=['GET'])
def get_pm_stats():
    conn = get_db_connection()
    tasks = conn.execute('SELECT status, risk_score FROM Tasks').fetchall()
    conn.close()
    
    total = len(tasks)
    in_progress = sum(1 for t in tasks if t['status'] == 'In Progress')
    done = sum(1 for t in tasks if t['status'] == 'Done')
    high_risk = sum(1 for t in tasks if t['risk_score'] and t['risk_score'] > 70)
    
    return jsonify({
        "total": total,
        "inProgress": in_progress,
        "done": done,
        "highRisk": high_risk
    })

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