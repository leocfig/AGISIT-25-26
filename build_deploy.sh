#!/usr/bin/env bash
set -euo pipefail

# === Load environment variables ===
if [ -f "/root/.env" ]; then
  echo "=== Loading environment variables from .env ==="
  set -a
  source /root/.env
  set +a
else
  echo "Warning: .env file not found, skipping environment variables"
fi

# === Handle GitHub username for GHCR ===
echo ""
if [ -n "${GHCR_USERNAME:-}" ]; then
  echo "Found GHCR_USERNAME in .env: ${GHCR_USERNAME}"
  GHCR_USERNAME_INPUT="$GHCR_USERNAME"
else
  read -p "Please insert your GitHub username: " GHCR_USERNAME_INPUT
fi

# === Update image paths in Kubernetes manifests ===
echo "=== Updating image paths in Kubernetes YAML files with username: ${GHCR_USERNAME_INPUT} ==="

K8S_DIR="/root/k8s"
FILES_TO_UPDATE=(
  "authservice.yaml"
  "messageservice.yaml"
  "onlineservice.yaml"
  "frontendservice.yaml"
  "db_auth.yaml"
  "db_message.yaml"
)

for file in "${FILES_TO_UPDATE[@]}"; do
  FILE_PATH="${K8S_DIR}/${file}"
  if [ -f "$FILE_PATH" ]; then
    echo "Updating $FILE_PATH ..."
    sed -i "s|ghcr.io/.*/|ghcr.io/${GHCR_USERNAME_INPUT}/|g" "$FILE_PATH"
  else
    echo "Warning: $FILE_PATH not found, skipping."
  fi
done

echo "=== Image paths updated successfully ==="
echo ""

# === Google Cloud login ===
echo "=== Authenticating with Google Cloud ==="
gcloud auth login

# === Terraform ===
cd /root/terraform

echo "=== Initializing Terraform ==="
terraform init

# === Ensure SSH key exists ===
SSH_KEY_PATH="/root/.ssh/id_rsa"

if [ ! -f "$SSH_KEY_PATH" ]; then
  echo "=== SSH key not found, generating a new one ==="
  mkdir -p "$(dirname "$SSH_KEY_PATH")"
  ssh-keygen -t rsa -b 2048 -f "$SSH_KEY_PATH" -N ""
else
  echo "=== Using existing SSH key at $SSH_KEY_PATH ==="
fi

echo "=== Running Terraform Plan ==="
terraform plan

echo "=== Applying Terraform configuration ==="
terraform apply -auto-approve

# === 3. Update Ansible hosts file ===
echo "=== Updating Ansible hosts file (gcphosts) ==="

MASTER_IP=$(terraform output -raw master)
# Get the worker IPs as clean lines
WORKER_LINES=$(terraform output worker_IPs   | sed -e 's/tolist(\[//' -e 's/\])//' -e 's/"//g' -e 's/,$//' -e 's/^[[:space:]]*//')

HOSTS_FILE="/root/ansible/gcphosts"

# Create a temporary block with the new hosts
TMP_HEAD=$(mktemp)
{
  echo "# file: gcphosts"
  echo "# for GCP tenant hosts file"
  echo "master    ansible_host=${MASTER_IP} ansible_user=ubuntu ansible_connection=ssh"
  echo "$WORKER_LINES" | while read -r line; do
    [ -z "$line" ] && continue
    NAME=$(echo "$line" | cut -d'=' -f1 | xargs)
    IP=$(echo "$line" | cut -d'=' -f2 | xargs)
    echo "${NAME}    ansible_host=${IP} ansible_user=ubuntu ansible_connection=ssh"
  done
} > "$TMP_HEAD"

# Combine the new header with the rest of the existing file (starting from the first group [)
awk '
  BEGIN {copy=0}
  /^\[/ {copy=1}
  copy {print}
' "$HOSTS_FILE" > /tmp/hosts_tail

# Concatenate the new header and the rest of the file
cat "$TMP_HEAD" /tmp/hosts_tail > "$HOSTS_FILE"

# Remove temporary files
rm "$TMP_HEAD" /tmp/hosts_tail

echo "=== Hosts file updated ==="
cat "$HOSTS_FILE"

# === Update ingress.yaml host dynamically ===
INGRESS_FILE="/root/k8s/ingress.yaml"
WORKER1_IP=$(echo "$WORKER_LINES" | grep 'worker1' | cut -d'=' -f2 | xargs)
APP_HOSTNAME="app.${WORKER1_IP}.nip.io"

echo "=== Updating host in ingress.yaml to $APP_HOSTNAME ==="
sed -i "s|^[[:space:]]*- host:.*|  - host: $APP_HOSTNAME|" "$INGRESS_FILE"

# === Update grafana-values dynamically ===
GRAFANA_VALUES_FILE="/root/ansible/grafana-values.yaml"

echo "=== Updating Grafana host in grafana-values.yaml to $APP_HOSTNAME ==="

if grep -qE "app\.[^[:space:]]+\.nip\.io" "$GRAFANA_VALUES_FILE"; then
  sed -i "s|app\.[^[:space:]]*\.nip\.io|$APP_HOSTNAME|g" "$GRAFANA_VALUES_FILE"
else
  echo "Warning: could not find a line with app.<something>.nip.io to replace in grafana-values.yaml"
fi

# === Sleep ===
echo "=== Sleeping for 20 seconds ==="
sleep 20

# === Ansible ===
cd /root/ansible

echo "=== Configuring GCP with Ansible ==="
ansible-playbook ansible-gcp-configure-nodes.yml
ansible-playbook ansible-k8s-install.yml
ansible-playbook ansible-create-cluster.yml
ansible-playbook ansible-workers-join.yml
ansible-playbook ansible-monitoring.yml

echo "=== Deploying application ==="
ansible-playbook ansible-start-deployment.yml

# === Sleep ===
echo "=== Sleeping for 30 seconds ==="
sleep 30
echo ""

# === Inform user about application URL ===
WORKER1_IP=$(echo "$WORKER_LINES" | grep 'worker1' | cut -d'=' -f2 | xargs)
APP_HOST="app.${WORKER1_IP}.nip.io"

echo "=== Deployment completed ==="
echo "Your application should now be accessible at:"
echo "  HTTP  : http://${APP_HOST}:30080"
echo "  HTTPS : https://${APP_HOST}:30443"
echo ""
echo ""

# === Optional cleanup ===
read -p "Do you want to delete the deployment and destroy infrastructure? (y/N): " confirm
if [[ "$confirm" =~ ^[Yy]$ ]]; then
  ansible-playbook ansible-delete-deployment.yml
  cd /root/terraform
  terraform destroy -auto-approve
fi

echo "=== All steps completed successfully ==="
