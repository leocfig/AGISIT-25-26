# Use the official Ubuntu base image.
FROM ubuntu:latest

# Prevent interactive prompts during package installation.
ENV DEBIAN_FRONTEND=noninteractive

# Update package lists + install base facilities (single layer) and clean up.
RUN apt-get update && \
    apt-get install -y supervisor openssh-server iputils-ping unzip && \
    rm -rf /var/lib/apt/lists/*

# Install additional facilities.
RUN apt-get update && \
    apt-get -y install libssl-dev libffi-dev gnupg python3-dev python3-pip snapd && \
    rm -rf /var/lib/apt/lists/*

# Install ansible.
RUN apt-get update && \
    apt install -y software-properties-common && \
    apt-add-repository -y -u ppa:ansible/ansible && \
    apt-get update && \
    apt-get install -y ansible && \
    rm -rf /var/lib/apt/lists/*

# Install terraform.
RUN wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(grep -oP '(?<=UBUNTU_CODENAME=).*' /etc/os-release || lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list && \
    apt-get update && \
    apt-get install -y terraform && \
    rm -rf /var/lib/apt/lists/*
#Add graoh builder tool for Terraform
RUN apt-get update && \
    apt-get -y install graphviz && \
    rm -rf /var/lib/apt/lists/*

# Install Google Cloud SDK.
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list && \
    mkdir -p /usr/share/keyrings && \
    wget -qO- https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor | tee /usr/share/keyrings/cloud.google.gpg > /dev/null && \
    apt-get update || true && \
    apt-get -y install google-cloud-sdk && \
    rm -rf /var/lib/apt/lists/*
#Install Kubernetes Controller.
RUN apt-get update && \
    apt-get -y install kubectl google-cloud-sdk-gke-gcloud-auth-plugin && \
    rm -rf /var/lib/apt/lists/*

# Create directories for supervisor and sshd 
RUN mkdir -p /var/run/sshd /var/log/supervisor

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Clean cache packages
RUN apt-get clean all && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /root

# Supervisor is out "init". Launches ssh and waits forever.
CMD ["/usr/bin/supervisord"]
