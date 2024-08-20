import os
from dotenv import load_dotenv
from predibase import Predibase, FinetuningConfig, DeploymentConfig

load_dotenv()

api_key = os.getenv("PREDIBASE_API_KEY")

pb = Predibase(api_token=api_key)

dataset = pb.datasets.from_file("fine-tuning-data.csv", name="skills_dataset_v2")

repo = pb.repos.create(name="skills-repo", description="Repository for fine-tuning skills identification model", exists_ok=True)

adapter = pb.adapters.create(
    config=FinetuningConfig(
        base_model="solar-1-mini-chat-240612",
        epochs=3,
        batch_size=8,
        learning_rate=1e-5,
    ),
    dataset=dataset,
    repo=repo,
    description="Fine-tuning model to identify skills from resume"
)

pb.deployments.create(
    name="skills-ai-deployment",
    config=DeploymentConfig(
        base_model="solar-1-mini-chat-240612",
        adapter_id=f"{repo.name}/1",
        min_replicas=0,
        max_replicas=1,
    )
)

input_prompt = "[INST] Identify 3 skills to learn from this resume: ... [/INST]"
lorax_client = pb.deployments.client("skills-ai-deployment")
response = lorax_client.generate(input_prompt, max_new_tokens=100)
print(response.generated_text)
