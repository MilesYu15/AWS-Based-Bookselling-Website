#!/bin/bash

packer build \
    -var 'aws_region=us-east-1' \
    -var 'subnet_id=subnet-3e6ef773' \
    -var 'source_ami=ami-026c8acd92718196b' \
    ami.json 