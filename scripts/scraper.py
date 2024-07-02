import csv
from jobspy import scrape_jobs

jobs = scrape_jobs(
    site_name=["indeed", "linkedin", "zip_recruiter", "glassdoor"],
    search_term="software engineer",
    location="Singapore, SG",
    results_wanted=20,
    hours_old=72,  # (only Linkedin/Indeed is hour specific, others round up to days old)
    country_indeed="Singapore",  # only needed for indeed / glassdoor
)
print(f"Found {len(jobs)} jobs")
print(jobs.head())
jobs.to_csv(
    "jobs.csv", quoting=csv.QUOTE_NONNUMERIC, escapechar="\\", index=False
)  # to_xlsx
