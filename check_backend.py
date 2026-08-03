import os
# Mocking the check that the deployment script performs
print("Checking for DEPLOY_RELEASE...")
exists = os.path.exists("server/DEPLOY_RELEASE")
print(f"DEPLOY_RELEASE in server/: {exists}")
