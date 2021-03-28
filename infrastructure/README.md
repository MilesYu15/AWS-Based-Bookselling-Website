# Infrastructure as Code

## Initialization

Initialize the terraform directory by

```
terraform init
```

## Create AWS components

Check if the components are correct.  

```
terraform plan
```

Apply chanages

```
terraform apply
```

## Destroy

Destroy the components managed by Terraform
mm

```
terraform destroy
```

## Import SSL certificate into AWS Certificate Manager
```aws acm import-certificate --certificate fileb://Certificate.crt --certificate-chain fileb://CertificateChain.ca-bundle --private-key fileb://private.key```
