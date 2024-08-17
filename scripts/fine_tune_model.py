from predibase import Predibase, FinetuningConfig, DeploymentConfig

pb = Predibase(api_token="pb_OazV7b2NXX2rsTowwTPEYQ")

# Load the dataset
dataset = pb.datasets.from_file("C:/Users/Javier/Downloads/JBMX/JBMX/scripts/fine-tuning-data.csv", name="skills_dataset_v2")

# Create a repository
repo = pb.repos.create(name="skills-repo", description="Repository for fine-tuning skills identification model", exists_ok=True)

# Fine-tuning configuration
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

# Deployment configuration with a different accelerator type
pb.deployments.create(
    name="skills-ai-deployment",
    config=DeploymentConfig(
        base_model="solar-1-mini-chat-240612",
        adapter_id=f"{repo.name}/1",  # Use the correct adapter version number
        min_replicas=0,
        max_replicas=1,
        accelerator="t4"  # Try using 't4' instead of 'v100'
    )
)

# Test the fine-tuned model
input_prompt = "[INST] Identify 3 skills to learn from this resume: ... [/INST]"
lorax_client = pb.deployments.client("skills-ai-deployment")
response = lorax_client.generate(input_prompt, max_new_tokens=100)
print(response.generated_text)
