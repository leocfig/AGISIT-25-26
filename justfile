set shell := ["bash", "-uc"]

default:
  @just --list

build:
  ./build_images.sh

start:
  docker build -t mgmt .
  docker run --rm --name mgmt --hostname mgmt -v "$(pwd):/root" -d mgmt
  docker exec -it mgmt bash /root/build_deploy.sh

mgmt:
  docker exec -it mgmt bash

benchmark:
  docker exec -it mgmt bash -c "cd /root/ansible && ansible-playbook ansible-benchmark.yml"

ps:
  docker ps

stop:
  docker stop mgmt

clean:
  rm -rf ssh-keys
