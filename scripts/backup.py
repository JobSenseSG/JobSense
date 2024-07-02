import json
import psycopg2
import os
import click
import requests
import pandas as pd
from dotenv import load_dotenv
from job import Job

# Load env var from .env file
load_dotenv()

CONNECTION = os.getenv("CONNECTION")
API_URL = os.getenv("API_URL")
API_TOKEN = os.getenv("API_TOKEN")


def query(payload):
    if API_URL is None:
        raise Exception("Env file not found")

    headers = {"Authorization": "Bearer {}".format(API_TOKEN)}

    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()


def save_database(rows: list[Job]):
    if CONNECTION is None:
        raise Exception("Env file not found")

    with psycopg2.connect(CONNECTION) as conn:
        cursor = conn.cursor()

        # use the cursor to interact with your database
        # cursor.execute("SELECT * FROM table")
        for row in rows:
            try:
                cursor.execute(
                    """
                    INSERT INTO bigdata_job (site, job_url, title, company, location, 
                    job_type, date_posted, interval, min_amount, max_amount, currency, 
                    is_remote, emails, description, academic_qualification, 
                    professional_qualification, years_of_experience, skills_required) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s);
                    """,
                    (
                        row.site,
                        row.job_url,
                        row.title,
                        row.company,
                        row.location,
                        row.job_type,
                        row.job_type,
                        row.date_posted,
                        row.interval,
                        row.min_amount,
                        row.max_amount,
                        row.currency,
                        row.is_remote,
                        row.emails,
                        row.description,
                        row.academic_qualification,
                        row.professional_qualification,
                        row.years_of_experience,
                        row.skills_required,
                    ),
                )
            except (Exception, psycopg2.Error) as error:
                print(error)
        conn.commit()
        conn.close()
    exit()


def parse(file):
    df = pd.read_csv(file)

    count = 0
    for _, row in df.iterrows():
        if count == 2:
            break
        job = Job(
            row["site"],
            row["job_url"],
            row["title"],
            row["company"],
            row["location"],
            row["job_type"],
            row["date_posted"],
            row["interval"],
            row["min_amount"],
            row["max_amount"],
            row["currency"],
            row["is_remote"],
            row["emails"],
            row["description"],
            "",
            "",
            0,
            "",
        )

        keywords = [
            "academic_qualification",
            "professional_qualification",
            "years_of_experience",
            "skills_required",
        ]

        jobs = []
        for keyword in keywords:
            # prompt = """
            # You are a program that processes and extracts required information from a
            # job posting based on a keyword which could be academic_qualifications,
            # professional_qualifications, years_of_experience, and skills_required.
            # When provided with the years_of_experience keyword, you are to only output
            # an integer, if nothing is found, you are to output 0.
            # For other keywords, you are to only provide the exact phrasing from the
            # job posting if found, otherwise, output the word "None".
            # Hence, find the {} from the following job posting: {}
            # """.format(
            #     keyword, job.description
            # )

            prompt = """
            Extract the {} from the job opening as a 
            Python variable called {} without special characters and code.
            """.format(
                keyword, job.description
            )

            output = query(
                {
                    "inputs": prompt,
                    "parameters": {
                        "temperature": 0.5,
                        "max_new_tokens": 128,
                        "top_p": 0.95,
                        "top_k": 50,
                        "repetition_penalty": 1.1,
                        "return_full_text": False,
                    },
                }
            )

            job[keyword] = output[0]["generated_text"]

            print(json.dumps(output, indent=4))
        jobs.append(job)
        count += 1
    # save_database(jobs)


@click.command()
@click.argument("file", type=click.Path(exists=True))
def main(file):
    parse(file)

    exit(0)


if __name__ == "__main__":
    main()
