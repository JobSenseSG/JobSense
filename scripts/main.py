import pandas as pd
import numpy as np
import re
from supabase import create_client, Client
import nltk
import math
import json

# NLTK setup
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

# Read CSV
df = pd.read_csv('jobs.csv')

# Process data
df_supabase = df[[
    'site',
    'job_url',
    'title',
    'company',
    'location',
    'job_type',
    'date_posted',
    'interval',
    'min_amount',
    'max_amount',
    'currency',
    'is_remote',
    'emails',
    'description'
]].copy()

# Functions to extract data
def extract_years_of_experience(description):
    if not isinstance(description, str):
        return None
    pattern = r'(\d+)\+?\s*(?:years|year) of experience'
    matches = re.findall(pattern, description, re.IGNORECASE)
    return max(map(int, matches)) if matches else None

def extract_skills(description):
    if not isinstance(description, str):
        return None
    skills_list = [
        'Python', 'Java', 'C++', 'JavaScript', 'Flutter', 'Dart', 'SQL',
        'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Structures', 'Algorithms'
    ]
    skills_found = [skill for skill in skills_list if skill.lower() in description.lower()]
    return skills_found if skills_found else None

# Apply functions
df_supabase['years_of_experience'] = df_supabase['description'].apply(extract_years_of_experience)
df_supabase['skills_required'] = df_supabase['description'].apply(extract_skills)

# Clean data
def str_to_bool(s):
    if isinstance(s, str):
        return s.lower() == 'true'
    else:
        return False

df_supabase['is_remote'] = df_supabase['is_remote'].apply(str_to_bool)
df_supabase['date_posted'] = pd.to_datetime(df_supabase['date_posted'], errors='coerce')

# Replace NaN with None
df_supabase = df_supabase.replace({np.nan: None})

# Supabase connection
url: str = 'https://vajvudbmcgzbyivvtlvy.supabase.co'
key: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhanZ1ZGJtY2d6YnlpdnZ0bHZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDc1MzE5MCwiZXhwIjoyMDM2MzI5MTkwfQ.sc52sU-m0JUnP9EtnHTPb2tnQ-Gl9us0VTHmRHgnvlw'  # Replace with your actual Supabase API key
supabase: Client = create_client(url, key)

# Function to convert data types
def convert_types(row):
    for key, value in row.items():
        if isinstance(value, pd.Timestamp):
            row[key] = value.isoformat()
        elif isinstance(value, (np.integer, int)):
            row[key] = int(value)
        elif isinstance(value, (np.floating, float)):
            # Convert float to integer for years_of_experience
            if key == 'years_of_experience' and not pd.isnull(value):
                row[key] = int(value)
            elif math.isnan(value):
                row[key] = None
            else:
                row[key] = float(value)
        elif isinstance(value, (np.ndarray, list)):
            # Convert NumPy arrays to lists
            row[key] = value.tolist() if isinstance(value, np.ndarray) else value
        elif pd.isnull(value):
            row[key] = None
        elif key == 'emails' and isinstance(value, str):
            # Convert emails field to a list if it's a string
            row[key] = [value]
        else:
            # Leave other types as is
            pass
    return row


# Insert data
# Get the current highest id from the table
max_id_response = supabase.table('jobsv2').select('id').order('id', desc=True).limit(1).execute()
max_id = max_id_response.data[0]['id'] if max_id_response.data else 0

# Start inserting from the next available id
next_id = max_id + 1

for index, row in df_supabase.iterrows():
    data = row.to_dict()
    data = convert_types(data)
    
    # Assign 'id' starting from the next available id
    data['id'] = next_id
    next_id += 1
    
    # Insert data into Supabase
    response = supabase.table('jobsv2').insert(data).execute()

    # Check for errors in the response
    if response.data:  # Check if data is present
        print(f"Successfully inserted row {index}")
    elif response.error:  # Check if there's an error
        print(f"Error inserting row {index}: {response.error}")
    else:
        print(f"Unexpected issue with row {index}, response: {response}")
