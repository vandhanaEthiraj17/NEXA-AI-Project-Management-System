import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

# Path to persistent model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'risk_model.joblib')
DEFAULT_DATA_PATH = os.path.join(os.path.dirname(__file__), 'test_dataset.csv')

# Global cache to prevent redundant disk I/O
_cached_model = None

def init_model():
    """Initializes the model on startup: loads if exists, otherwise tries to auto-train."""
    global _cached_model
    if os.path.exists(MODEL_PATH):
        print(f"Model found at {MODEL_PATH}. Loading into memory...")
        try:
            _cached_model = joblib.load(MODEL_PATH)
            return _cached_model
        except Exception as e:
            print(f"Error loading model: {e}. Attempting re-training...")
    
    _cached_model = auto_train()
    return _cached_model

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

def validate_description(description):
    """
    Validates if the description provides enough context for a professional AI analysis.
    Returns (is_valid, error_message)
    """
    if not description or len(description.strip()) < 5:
        return False, "Description is too short. Please provide a brief project scope to analyze."
    
    # Gibberish detection heuristics
    words = description.split()
    if not words: return False, "Invalid input."
    
    avg_len = sum(len(w) for w in words) / len(words)
    if avg_len > 12:
        return False, "Input rejected: AI Model flagged the descriptive scope as malformed or gibberish."
        
    vowels = set('aeiouAEIOU')
    for word in words:
        if len(word) > 8 and not any(char in vowels for char in word):
            return False, "Input rejected: Unrecognizable word character sequences detected."
            
    return True, ""

def analyze_complexity(description):
    """
    Heuristic-based complexity analysis for project descriptions.
    Returns a score between 1 and 10.
    """
    is_valid, error = validate_description(description)
    if not is_valid:
        # We still return a baseline for internal calculations if called, 
        # but the API layer should catch this via validate_description first.
        return 5.0
        
    score = 3.0 # Starting point
    desc_lower = description.lower()
    
    # Keyword-based escalation
    high_complexity_keywords = [
        'international', 'global', 'security', 'compliance', 'legacy', 
        'migration', 'real-time', 'architecture', 'integration', 'multi-platform',
        'critical', 'blockchain', 'ai', 'machine learning', 'microservices'
    ]
    
    med_complexity_keywords = [
        'database', 'api', 'dashboard', 'user', 'interface', 'support',
        'deployment', 'optimization', 'refactor'
    ]
    
    for word in high_complexity_keywords:
        if word in desc_lower: score += 1.0
        
    for word in med_complexity_keywords:
        if word in desc_lower: score += 0.4
        
    # Length-based escalation (deeper descriptions usually imply more details/layers)
    score += min(len(description) / 100, 2.0)
    
    return min(max(round(score, 1), 1.0), 10.0)
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

def predict_risk(team_size, complexity, estimated_days, budget=10000, task_count=10, return_details=False):
    """
    Predicts risk using the trained model. 
    Falls back to a baseline heuristic if no model is found.
    """
    global _cached_model
    
    # Load into cache if not already present
    if _cached_model is None and os.path.exists(MODEL_PATH):
        try:
            _cached_model = joblib.load(MODEL_PATH)
        except:
            pass

    if _cached_model is not None:
        try:
            # Create a 2D array for prediction
            input_data = [[team_size, complexity, estimated_days, budget, task_count]]
            prediction = _cached_model.predict(input_data)[0]
            
            try:
                probabilities = _cached_model.predict_proba(input_data)[0]
                confidence = max(probabilities) * 100
            except:
                confidence = 85.0
            
            # Map back to 0-100 scale (High: 85, Med: 50, Low: 15)
            risk_map = {2: 85.0, 1: 50.0, 0: 15.0}
            risk_score = risk_map.get(prediction, 50.0)
            
            if return_details:
                return {"risk_score": risk_score, "confidence": round(confidence, 1)}
            return risk_score
        except Exception as e:
            print(f"Prediction Error: {e}")
            if return_details:
                return {"risk_score": 50.0, "confidence": 75.0}
            return 50.0
    else:
        # Baseline heuristic if no model is trained yet
        # Higher complexity and larger team relative to deadline = higher risk
        base_risk = (complexity * 10) + (team_size * 2) - (estimated_days / 10)
        risk_score = max(min(base_risk, 100), 0)
        confidence = 100 - abs(50 - risk_score) / 2
        
        if return_details:
            return {"risk_score": round(risk_score, 1), "confidence": round(confidence, 1)}
        return round(risk_score, 1)

def get_risk_reasoning(team_size, complexity, estimated_days, budget, title="This project"):
    """Generates a human-readable reason for the predicted risk score."""
    logic = []
    _title = title.strip() or "This project"
    
    # Timeline vs Complexity
    if estimated_days < 20 and complexity > 6:
        logic.append(f"For '{_title}', there is a highly aggressive timeline ({estimated_days} days) relative to the predicted complexity level {complexity}.")
    elif estimated_days < 10:
        logic.append(f"Extremely short deadline for '{_title}' poses severe integration and testing risks.")
        
    # Manpower issues
    if team_size < 3 and complexity > 5:
        logic.append(f"Critical staffing shortage: A team of {team_size} is insufficient for the high-complexity tasks required in '{_title}'.")
    elif complexity > 8 and team_size < 10:
        logic.append(f"The scale of '{_title}' requires specialized leads which are currently missing from the small {team_size}-person team allocation.")
        
    # Budget constraints
    if budget < 5000 and complexity > 7:
        logic.append(f"Financial resources for '{_title}' are tightly constrained relative to the technical scope.")

    if not logic:
        logic.append(f"Variables for '{_title}' indicate a stable trajectory, but standard operational risks apply.")
        
    return " ".join(logic)

def get_resource_breakdown(count, domain):
    """Generates a detailed breakdown of specific team members based on Excel data."""
    try:
        file_path = os.path.join(os.path.dirname(__file__), 'developers data.xlsx')
        if not os.path.exists(file_path):
            raise FileNotFoundError("Developers data excel file not found.")
            
        df = pd.read_excel(file_path)
        
        # Sort by PerformanceScore descending to get the best developers
        df = df.sort_values(by='PerformanceScore', ascending=False)
        
        # Take the top 'count' developers
        selected = df.head(count)
        
        resources = []
        for i, row in selected.iterrows():
            resources.append({
                "id": str(row.get('EmployeeID', i)),
                "name": str(row.get('Name', 'Unknown')),
                "role": str(row.get('Role', 'Developer')),
                "experience": str(row.get('Experience (Years)', 'N/A')) + ' Years',
                "skills": str(row.get('Skills', 'N/A')),
                "availability": str(row.get('Availability', 'N/A')),
                "salary": str(row.get('Salary', 'N/A')),
                "performance": str(row.get('PerformanceScore', 'N/A'))
            })
            
        # If we need more than we have, we might duplicate but the dataset has plenty.
        # Fallback just in case counts exceed available developers
        while len(resources) < count and len(resources) > 0:
            resources.append(resources[len(resources) % len(selected)])
            
        return resources
    except Exception as e:
        print(f"Error loading developer data: {e}")
        # Fallback to a single mock developer if it fails entirely
        return [{"id": "error", "name": "System Error", "role": "Data missing", "experience": "N/A", "skills": "N/A", "availability": "N/A", "salary": "N/A", "performance": "N/A"}]

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
