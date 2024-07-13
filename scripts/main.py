import time
from ast import literal_eval
from dotenv import load_dotenv
import os
import click
import pandas as pd
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError, ClientError
import json
import requests

# Load environment variables from .env file
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = 'us-west-2'
MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0'

# Check for AWS credentials
if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    raise Exception("AWS credentials (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY) not found in environment variables.")

# Initialize AWS Bedrock client
client = boto3.client(
    'bedrock-runtime',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

def query(payload):
    prompt = f"""
    Extract the required information from the job opening as a Python variable without special characters. If the extracted values contain multiple items, store values separated by comma. If no value is found, respond with the word, None.
    Job description: {payload}
    """

    conversation = [
        {
            "role": "user",
            "content": [{"text": prompt}],
        }
    ]

    try:
        response = client.converse(
            modelId=MODEL_ID,
            messages=conversation,
            inferenceConfig={"maxTokens": 512, "temperature": 0.5, "topP": 0.9},
        )
        response_text = response["output"]["message"]["content"][0]["text"]
        return response_text
    except (NoCredentialsError, PartialCredentialsError) as e:
        print(f"Credentials error: {e}")
        return None
    except ClientError as e:
        print(f"ERROR: Can't invoke '{MODEL_ID}'. Reason: {e}")
        return None
    except Exception as e:
        print(f"ERROR: Can't invoke '{MODEL_ID}'. Reason: {e}")
        return None

def insert_into_supabase(data):
    url = f"{SUPABASE_URL}/rest/v1/your_table_name"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    if response.status_code != 201:
        print(f"Error inserting data into Supabase: {response.text}")

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

        # Extracting required information using AWS Bedrock Gen AI
        extracted_info = query(job_description)
        while extracted_info is None:
            print("Waiting for AI response...")
            time.sleep(5)  # Wait before trying again
            extracted_info = query(job_description)

        print(f"Extracted Info: {extracted_info}")

        try:
            extracted_info_json = json.loads(extracted_info)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            continue

        data = {
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
            "extracted_info": extracted_info_json
        }

        extracted_data.append(data)
        insert_into_supabase(data)

        # Add a delay between requests to avoid overwhelming the service
        time.sleep(1)

@click.command()
@click.argument("file", type=click.Path(exists=True))
def main(file):
    parse(file)
    exit(0)

if __name__ == "__main__":
    main()
