import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

# Path to persistent model
MODEL_PATH = 'risk_model.joblib'

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

if __name__ == "__main__":
    # Internal test with synthetic data if it's new
    pass
