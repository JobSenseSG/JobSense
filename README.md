# JobSense
JobSense is a platform that utilizes big data technologies and artificial intelligence to tackle the problem of rising unemployment due to job market trends.
The platform provides tailored recommendations to help users to enhance their portfolio and increase their chances of securing employment opportunities.

## Getting Started
This section describes a quick way to deploy the project locally for development purposes. 

### Prerequisites
The project leverages on the following technologies which must be configured beforehand:
- [Node.js](https://nodejs.org)
- [Python](https://www.python.org)
- [TimescaleDB](https://docs.timescale.com)
- [Gemini](https://ai.google.dev)

### JobSense Web Application
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Web Scraping and Data Processing
The Python scripts to scrape and process the data using Gemini are stored in the `scripts/` directory.

First, install the required Python dependencies:
```bash

# Initialize a Python virtual environment
python -m venv env

# On Linux, activate the virtual environment
source env/bin/activate

# Dependencies will be installed in the env/ virtual environment instead of system-wide, the latter is usually not recommended.
pip install -r requirements.txt
```

Secondly, run the appropriate script to scrape or process data:
```bash
# Run the web scraper to scrape various job sites into job.csv
python scraper.py

# Create .env file based on .env.example and populate required values
cp .env.example .env

# Process scraped data
python main.py path/to/jobs.csv
```
