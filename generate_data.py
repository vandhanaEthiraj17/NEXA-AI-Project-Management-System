import pandas as pd
import numpy as np
import os

def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    
    # Features
    team_sizes = np.random.randint(2, 25, size=num_samples)
    complexities = np.random.randint(1, 11, size=num_samples)
    estimated_days = np.random.randint(10, 180, size=num_samples)
    budgets = team_sizes * estimated_days * np.random.randint(50, 150, size=num_samples)
    task_counts = (complexities * 5) + np.random.randint(5, 50, size=num_samples)
    
    data = {
        'team_size': team_sizes,
        'project_complexity': complexities,
        'estimated_days': estimated_days,
        'budget': budgets,
        'task_count': task_counts
    }
    
    df = pd.DataFrame(data)
    
    # Calculate target: actual_days
    # Pattern: 
    # - Higher complexity -> more likely to delay
    # - team_size < (complexity * 2) -> more likely to delay
    # - estimated_days too short for complexity -> delay
    
    base_multiplier = 1.0 + (df['project_complexity'] / 15)
    size_penalty = np.where(df['team_size'] < (df['project_complexity'] * 1.5), 1.2, 1.0)
    random_variance = np.random.uniform(0.8, 1.4, size=num_samples)
    
    df['actual_days'] = (df['estimated_days'] * base_multiplier * size_penalty * random_variance).astype(int)
    
    return df

if __name__ == "__main__":
    df = generate_synthetic_data(1200)
    output_path = os.path.join(os.path.dirname(__file__), 'backend', 'test_dataset.csv')
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} samples and saved to {output_path}")
