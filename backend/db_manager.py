import os
import sqlite3
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/decision_system')
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), 'decision_system.db')

class DatabaseManager:
    def __init__(self):
        self.use_mongodb = False
        self.mongo_client = None
        self.mongo_db = None
        
        # Try to connect to MongoDB
        try:
            self.mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
            # Trigger a call to verify connection
            self.mongo_client.server_info()
            self.mongo_db = self.mongo_client.get_database()
            self.use_mongodb = True
            print("MongoDB Connected Successfully.")
        except Exception as e:
            print(f"MongoDB Connection Failed: {e}. Falling back to SQLite.")
            self.use_mongodb = False

    def get_sqlite_conn(self):
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        # Always initialize SQLite just in case
        conn = self.get_sqlite_conn()
        c = conn.cursor()
        c.execute('CREATE TABLE IF NOT EXISTS Sprints (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, status TEXT DEFAULT "active", start_date DATETIME DEFAULT CURRENT_TIMESTAMP, end_date DATETIME)')
        c.execute('CREATE TABLE IF NOT EXISTS Tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, sprint_id INTEGER, title TEXT NOT NULL, description TEXT, status TEXT DEFAULT "To Do", assignee TEXT, complexity INTEGER DEFAULT 5, deadline_days INTEGER DEFAULT 7, risk_score REAL)')
        c.execute('CREATE TABLE IF NOT EXISTS ClientBriefs (id INTEGER PRIMARY KEY AUTOINCREMENT, client_name TEXT NOT NULL, project_description TEXT NOT NULL, budget INTEGER, timeline_weeks INTEGER, status TEXT DEFAULT "pending", created_at DATETIME DEFAULT CURRENT_TIMESTAMP)')
        c.execute('CREATE TABLE IF NOT EXISTS Proposals (id INTEGER PRIMARY KEY AUTOINCREMENT, brief_id INTEGER, tasks_json TEXT, estimated_cost INTEGER, estimated_days INTEGER, status TEXT DEFAULT "draft", created_at DATETIME DEFAULT CURRENT_TIMESTAMP)')
        c.execute('CREATE TABLE IF NOT EXISTS Developers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, skills TEXT, availability BOOLEAN DEFAULT 1)')
        c.execute('CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT DEFAULT "user")')
        
        # Seed Users if none exist
        count_users = conn.execute('SELECT COUNT(*) FROM Users').fetchone()[0]
        if count_users == 0:
            users = [
                ('admin@enterprise.com', 'admin123', 'manager'),
                ('client@test.com', 'client123', 'client')
            ]
            conn.executemany('INSERT INTO Users (username, password, role) VALUES (?, ?, ?)', users)
        
        # Seed Developers if none exist
        count = conn.execute('SELECT COUNT(*) FROM Developers').fetchone()[0]
        if count == 0:
            devs = [
                ('Alice Chen', 'react,frontend,css', 1),
                ('Bob Smith', 'backend,database,python', 1),
                ('Charlie Davis', 'mobile,ios,android', 1),
                ('Diana Prince', 'qa,documentation,testing', 1)
            ]
            conn.executemany('INSERT INTO Developers (name, skills, availability) VALUES (?, ?, ?)', devs)
        
        conn.commit()
        conn.close()

    def get_tasks(self, sprint_id=None):
        if self.use_mongodb:
            query = {}
            if sprint_id:
                query['sprint_id'] = sprint_id
            tasks = list(self.mongo_db.tasks.find(query))
            for task in tasks:
                task['id'] = str(task['_id'])
                del task['_id']
                if 'status' not in task:
                    task['status'] = 'To Do'
                if 'risk_score' not in task:
                    task['risk_score'] = 0
            return tasks
        else:
            conn = self.get_sqlite_conn()
            if sprint_id:
                tasks = conn.execute('SELECT * FROM Tasks WHERE sprint_id = ?', (sprint_id,)).fetchall()
            else:
                tasks = conn.execute('SELECT * FROM Tasks').fetchall()
            conn.close()
            return [dict(t) for t in tasks]

    def create_task(self, data):
        if self.use_mongodb:
            if 'status' not in data:
                data['status'] = 'To Do'
            if 'risk_score' not in data:
                data['risk_score'] = 0
            result = self.mongo_db.tasks.insert_one(data)
            return str(result.inserted_id)
        else:
            conn = self.get_sqlite_conn()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO Tasks (sprint_id, title, description, status, assignee, complexity, deadline_days, risk_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (data.get('sprint_id'), data.get('title'), data.get('description', ''), 
                  data.get('status', 'To Do'), data.get('assignee', ''), 
                  data.get('complexity', 5), data.get('deadline_days', 7), 
                  data.get('risk_score', 0)))
            conn.commit()
            task_id = cursor.lastrowid
            conn.close()
            return task_id

    def update_task_status(self, task_id, status):
        if self.use_mongodb:
            try:
                self.mongo_db.tasks.update_one({'_id': ObjectId(task_id)}, {'$set': {'status': status}})
            except:
                # Handle case where task_id might be an int from SQLite era
                pass
        else:
            conn = self.get_sqlite_conn()
            conn.execute('UPDATE Tasks SET status = ? WHERE id = ?', (status, task_id))
            conn.commit()
            conn.close()

    def get_sprints(self):
        if self.use_mongodb:
            sprints = list(self.mongo_db.sprints.find())
            for sprint in sprints:
                sprint['id'] = str(sprint['_id'])
                del sprint['_id']
            return sprints
        else:
            conn = self.get_sqlite_conn()
            sprints = conn.execute('SELECT * FROM Sprints').fetchall()
            conn.close()
            return [dict(s) for s in sprints]

    def create_sprint(self, name):
        if self.use_mongodb:
            result = self.mongo_db.sprints.insert_one({'name': name, 'status': 'active'})
            return str(result.inserted_id)
        else:
            conn = self.get_sqlite_conn()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO Sprints (name, status) VALUES (?, 'active')", (name,))
            conn.commit()
            sprint_id = cursor.lastrowid
            conn.close()
            return sprint_id

    def get_pm_stats(self):
        try:
            if self.use_mongodb:
                tasks = list(self.mongo_db.tasks.find({}, {'status': 1, 'risk_score': 1}))
            else:
                conn = self.get_sqlite_conn()
                tasks = conn.execute('SELECT status, risk_score FROM Tasks').fetchall()
                conn.close()
                tasks = [dict(t) for t in tasks]

            total = len(tasks)
            in_progress = sum(1 for t in tasks if t.get('status') == 'In Progress')
            done = sum(1 for t in tasks if t.get('status') == 'Done')
            high_risk = sum(1 for t in tasks if t.get('risk_score') is not None and t.get('risk_score', 0) > 70)
            
            return {
                "total": total,
                "inProgress": in_progress,
                "done": done,
                "highRisk": high_risk
            }
        except Exception as e:
            print(f"Error in get_pm_stats: {e}")
            return {"total": 0, "inProgress": 0, "done": 0, "highRisk": 0}

    def create_client_brief(self, data):
        if self.use_mongodb:
            result = self.mongo_db.client_briefs.insert_one(data)
            return str(result.inserted_id)
        else:
            conn = self.get_sqlite_conn()
            cursor = conn.execute('INSERT INTO ClientBriefs (client_name, project_description, budget, timeline_weeks, status) VALUES (?, ?, ?, ?, ?)',
                         (data.get('client_name'), data.get('project_description'), data.get('budget', 0), data.get('timeline_weeks', 0), data.get('status', 'pending')))
            conn.commit()
            brief_id = cursor.lastrowid
            conn.close()
            return brief_id

    def get_client_briefs(self):
        if self.use_mongodb:
            briefs = list(self.mongo_db.client_briefs.find())
            for b in briefs:
                b['id'] = str(b['_id'])
                del b['_id']
            return briefs
        else:
            conn = self.get_sqlite_conn()
            briefs = conn.execute('SELECT * FROM ClientBriefs').fetchall()
            conn.close()
            return [dict(b) for b in briefs]

    def create_proposal(self, data):
        import json
        if self.use_mongodb:
            result = self.mongo_db.proposals.insert_one(data)
            return str(result.inserted_id)
        else:
            conn = self.get_sqlite_conn()
            tasks_json = json.dumps(data.get('tasks', []))
            cursor = conn.execute('INSERT INTO Proposals (brief_id, tasks_json, estimated_cost, estimated_days, status) VALUES (?, ?, ?, ?, ?)',
                         (data.get('brief_id'), tasks_json, data.get('estimated_cost', 0), data.get('estimated_days', 0), data.get('status', 'draft')))
            conn.commit()
            prop_id = cursor.lastrowid
            conn.close()
            return prop_id

    def update_proposal_status(self, proposal_id, status):
        from bson import ObjectId
        if self.use_mongodb:
            self.mongo_db.proposals.update_one({'_id': ObjectId(proposal_id)}, {'$set': {'status': status}})
            return True
        else:
            conn = self.get_sqlite_conn()
            conn.execute('UPDATE Proposals SET status = ? WHERE id = ?', (status, proposal_id))
            conn.commit()
            conn.close()
            return True

    def get_developers(self):
        if self.use_mongodb:
            devs = list(self.mongo_db.developers.find())
            for d in devs:
                d['id'] = str(d['_id'])
                del d['_id']
            return devs
        else:
            conn = self.get_sqlite_conn()
            devs = conn.execute('SELECT * FROM Developers').fetchall()
            conn.close()
            return [dict(d) for d in devs]

db_manager = DatabaseManager()
