from ast import literal_eval
from dotenv import load_dotenv
import os
import click
import pandas as pd
import requests
import json

# Load environment variables from .env file
load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
# Use mlvoca free-llm-api with deepseek-r1:1.5b
MLVOCA_URL = 'https://mlvoca.com/api/generate'

def query(payload):
    prompt = f"""
    Extract the required information from the job opening as a Python variable without special characters. If the extracted values contain multiple items, store values separated by comma. If no value is found, respond with the word, None.
    Job description: {payload}
    """

    try:
        resp = requests.post(MLVOCA_URL, json={
            'model': 'deepseek-r1:1.5b',
            'prompt': prompt,
            'stream': False,
            'options': {'max_tokens': 512, 'temperature': 0.5}
        }, timeout=30)

        if resp.status_code != 200:
            print(f"mlvoca error {resp.status_code}: {resp.text}")
            return None

        data = resp.json()
        return data.get('response')
    except Exception as e:
        print(f"ERROR querying mlvoca DeepSeek: {e}")
        return None

def parse(file):
    df = pd.read_csv(file)

    # Ensure required columns are present
    required_columns = ["site", "job_url", "title", "company", "location", "job_type", "date_posted", "interval", "min_amount", "max_amount", "currency", "is_remote", "emails", "description"]
    if not all(column in df.columns for column in required_columns):
        print(f"ERROR: The CSV file must contain the following columns: {', '.join(required_columns)}")
        return

    extracted_data = []

    for _, row in df.iterrows():
        job_description = row["description"]

        # Extracting required information using mlvoca DeepSeek
        extracted_info = query(job_description)
        if extracted_info is None:
            extracted_info = "None"

        extracted_data.append({
            "site": row["site"],
            "job_url": row["job_url"],
            "title": row["title"],
            "company": row["company"],
            "location": row["location"],
            "job_type": row["job_type"],
            "date_posted": row["date_posted"],
            "interval": row["interval"],
            "min_amount": row["min_amount"],
            "max_amount": row["max_amount"],
            "currency": row["currency"],
            "is_remote": row["is_remote"],
            "emails": row["emails"],
            "description": job_description,
            "extracted_info": extracted_info
        })

    # Print extracted data instead of saving to a file
    for data in extracted_data:
        print(json.dumps(data, indent=2))

@click.command()
@click.argument("file", type=click.Path(exists=True))
def main(file):
    parse(file)
    exit(0)

if __name__ == "__main__":
    main()
