from ast import literal_eval
import google.generativeai as genai
import psycopg2
import os
import click
import pandas as pd
from dotenv import load_dotenv
from job import Job

# Load env var from .env file
load_dotenv()

CONNECTION = os.getenv("CONNECTION")
API_TOKEN = os.getenv("API_TOKEN")


def query(payload):
    genai.configure(api_key=API_TOKEN, transport="rest")

    safety_settings = [
        {
            "category": "HARM_CATEGORY_DANGEROUS",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE",
        },
    ]

    model = genai.GenerativeModel("gemini-pro", safety_settings=safety_settings)

    tokens = model.count_tokens(payload).total_tokens

    if tokens > 20000:
        print("Tokens in prompt is " + str(tokens) + ", which is more than allowed.")
        return

    response = model.generate_content(payload)

    return response.text


def save_database(row: Job):
    if CONNECTION is None:
        raise Exception("Env file not found")

    with psycopg2.connect(CONNECTION) as conn:
        cursor = conn.cursor()

        # use the cursor to interact with your database
        # cursor.execute("SELECT * FROM table")
        cursor.execute(
            """
            INSERT INTO bigdata_job (site, job_url, title, company, location, 
            job_type, date_posted, interval, min_amount, max_amount, currency, 
            is_remote, emails, description, years_of_experience, 
            skills_required) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
            %s, %s, %s, %s, %s, %s);
            """,
            (
                row.site,
                row.job_url,
                row.title,
                row.company,
                row.location,
                row.job_type,
                row.date_posted,
                row.interval,
                row.min_amount,
                row.max_amount,
                row.currency,
                row.is_remote,
                row.emails,
                row.description,
                row.years_of_experience,
                row.skills_required,
            ),
        )
        conn.commit()


def parse(file):
    df = pd.read_csv(file)

    for _, row in df.iterrows():
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
            [row["emails"]],
            row["description"],
            0,
            "",
        )

        keywords = [
            "years_of_experience",
            "skills_required",
        ]

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
            Extract the {} from the job opening as a Python variable called {} without
            special characters. If the extracted values contain multiple items, store
            values seperated by comma. If no value is found, respond with the word,
            None.
            """.format(
                keyword, job.description
            )

            output = query(prompt)

            print(output)

            if output is not None and output != "None":
                if keyword == "skills_required":
                    job[keyword] = output.split(",")
                else:
                    output = "".join(e for e in output if e.isalnum())
                    job[keyword] = "".join(filter(str.isdigit, output))
            else:
                job[keyword] = None
            # print(json.dumps(job.__dict__, indent=4))

        save_database(job)


@click.command()
@click.argument("file", type=click.Path(exists=True))
def main(file):
    if not CONNECTION or not API_TOKEN:
        raise Exception("Required variables not found.")
    parse(file)

    exit(0)


if __name__ == "__main__":
    main()
