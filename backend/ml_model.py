import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

# Path to persistent model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'risk_model.joblib')
DEFAULT_DATA_PATH = os.path.join(os.path.dirname(__file__), 'test_dataset.csv')

def init_model():
    """Initializes the model on startup: loads if exists, otherwise tries to auto-train."""
    if os.path.exists(MODEL_PATH):
        print(f"Model found at {MODEL_PATH}. Loading...")
        try:
            return joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Error loading model: {e}. Attempting re-training...")
    
    return auto_train()

def auto_train():
    """Attempts to train the model using a default dataset if available."""
    print("Checking for default dataset for auto-training...")
    
    # Check possible data locations
    possible_paths = [
        DEFAULT_DATA_PATH,
        os.path.join(os.path.dirname(__file__), '..', 'test_dataset.csv'),
        os.path.join(os.path.dirname(__file__), 'training_data.csv')
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            print(f"Dataset found at {path}. Starting auto-train...")
            result = train_model(path)
            if result['status'] == 'success':
                print(f"Auto-train complete. Accuracy: {result['accuracy']}%")
                return joblib.load(MODEL_PATH)
            else:
                print(f"Auto-train failed: {result['message']}")
    
    print("No training data found. System will use fallback heuristics.")
    return None
def train_model(csv_path):
    """
    Trains a RandomForest model on the provided CSV and saves it.
    Expects columns: team_size, project_complexity, estimated_days, actual_days, budget, task_count
    """
    try:
        df = pd.read_csv(csv_path)
        
        # 1. Data Cleaning
        df = df.dropna()
        
        # 2. Target Engineering: Delay Risk
        # actual_days > estimated_days → 2 (High)
        # actual_days == estimated_days → 1 (Medium)
        # actual_days < estimated_days → 0 (Low)
        def label_risk(row):
            if row['actual_days'] > row['estimated_days']:
                return 2  # High
            elif row['actual_days'] == row['estimated_days']:
                return 1  # Medium
            else:
                return 0  # Low
        
        df['delay_risk'] = df.apply(label_risk, axis=1)
        
        # 3. Feature Selection
        features = ['team_size', 'project_complexity', 'estimated_days', 'budget', 'task_count']
        X = df[features]
        y = df['delay_risk']
        
        # 4. Train/Test Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # 5. Model Training
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # 6. Evaluate
        accuracy = model.score(X_test, y_test)
        
        # 7. Persist
        joblib.dump(model, MODEL_PATH)
        
        return {
            "status": "success",
            "accuracy": round(accuracy * 100, 2),
            "samples": len(df)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def predict_risk(team_size, complexity, estimated_days, budget=10000, task_count=10):
    """
    Predicts risk using the trained model. 
    Falls back to a baseline heuristic if no model is found.
    """
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            # Create a 2D array for prediction
            input_data = [[team_size, complexity, estimated_days, budget, task_count]]
            prediction = model.predict(input_data)[0]
            
            # Map back to 0-100 scale (High: 85, Med: 50, Low: 15)
            risk_map = {2: 85.0, 1: 50.0, 0: 15.0}
            return risk_map.get(prediction, 50.0)
        except Exception as e:
            print(f"Prediction Error: {e}")
            return 50.0
    else:
        # Baseline heuristic if no model is trained yet
        # Higher complexity and larger team relative to deadline = higher risk
        base_risk = (complexity * 10) + (team_size * 2) - (estimated_days / 10)
        return max(min(base_risk, 100), 0)

def get_risk_reasoning(team_size, complexity, estimated_days, budget):
    """Generates a human-readable reason for the predicted risk score."""
    logic = []
    
    # Timeline vs Complexity
    if estimated_days < 20 and complexity > 6:
        logic.append(f"Highly aggressive timeline ({estimated_days} days) for a project of complexity level {complexity}.")
    elif estimated_days < 10:
        logic.append("Extremely short deadline poses severe integration and testing risks.")
        
    # Manpower issues
    if team_size < 3 and complexity > 5:
        logic.append(f"Critical staffing shortage: A team of {team_size} is insufficient for high-complexity tasks.")
    elif complexity > 8 and team_size < 10:
        logic.append("Project scale requires specialized leads which are currently missing from the small team allocation.")
        
    # Budget constraints
    if budget < 5000 and complexity > 7:
        logic.append("Financial resources are tightly constrained relative to the technical scope.")

    if not logic:
        logic.append("Variables indicate a stable trajectory, but standard operational risks apply.")
        
    return " ".join(logic)

def get_resource_breakdown(count, domain):
    """Generates a detailed breakdown of team roles, experience, and tasks."""
    resources = []
    
    software_roles = [
        {"role": "Lead System Architect", "exp": "8+ Years", "task": "Architecting scalable infrastructure and high-level design."},
        {"role": "Senior Fullstack Developer", "exp": "5-7 Years", "task": "Core business logic implementation and API integration."},
        {"role": "Mid-level Frontend Developer", "exp": "3-5 Years", "task": "Responsive UI/UX development and client-side logic."},
        {"role": "DevOps Engineer", "exp": "4+ Years", "task": "CI/CD pipeline management and cloud deployment."},
        {"role": "QA Automation Engineer", "exp": "3+ Years", "task": "End-to-end testing and quality assurance."},
        {"role": "UI/UX Designer", "exp": "4+ Years", "task": "User journey mapping and high-fidelity mockups."},
        {"role": "Database Administrator", "exp": "6+ Years", "task": "Schema optimization and data security management."}
    ]
    
    business_roles = [
        {"role": "Senior Market Analyst", "exp": "6+ Years", "task": "Competitive landscape analysis and trend forecasting."},
        {"role": "Operations Manager", "exp": "7+ Years", "task": "Process optimization and resource coordination."},
        {"role": "Financial Consultant", "exp": "8+ Years", "task": "Budget auditing and ROI projection."},
        {"role": "Customer Success Lead", "exp": "4+ Years", "task": "Retention strategy and feedback loop management."},
        {"role": "Sales Strategist", "exp": "5+ Years", "task": "Channel expansion and revenue growth planning."}
    ]
    
    hardware_roles = [
        {"role": "Lead Mechanical Engineer", "exp": "10+ Years", "task": "Physical prototyping and structural integrity testing."},
        {"role": "Embedded Systems Expert", "exp": "7+ Years", "task": "Firmware development and sensor integration."},
        {"role": "Supply Chain Specialist", "exp": "5+ Years", "task": "Procurement and vendor relationship management."},
        {"role": "Industrial Designer", "exp": "6+ Years", "task": "Ergonomics and aesthetic design optimization."},
        {"role": "Safety & Compliance Officer", "exp": "8+ Years", "task": "ISO certification and regulatory compliance."}
    ]
    
    pool = software_roles
    if domain == 'Business': pool = business_roles
    elif domain == 'Hardware': pool = hardware_roles
    
    # Cycle through pool to fulfill count
    for i in range(count):
        role_data = pool[i % len(pool)]
        resources.append({
            "id": i + 1,
            "role": role_data["role"],
            "experience": role_data["exp"],
            "tasks": role_data["task"]
        })
        
    return resources

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
        print(f"Manual Training Triggered with: {csv_file}")
        res = train_model(csv_file)
        print(res)
    else:
        print("Usage: python ml_model.py <path_to_training_csv>")
        print("Example: python ml_model.py historical_data.csv")
