import sys
print("Python version:", sys.version)
try:
    import pandas as pd
    print("Pandas imported successfully")
except Exception as e:
    print("Pandas import failed:", e)

try:
    import sklearn
    print("Sklearn imported successfully")
except Exception as e:
    print("Sklearn import failed:", e)

print("Test script finished")
