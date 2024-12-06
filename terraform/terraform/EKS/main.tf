provider "aws" {
  region = "us-east-1"
}

# Configure o backend
terraform {
  backend "s3" {
    bucket         = "dd-terraform-sandbox-pedro-schawirin-us-east-1"
    key            = "eks/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock-table"
  }
}

# VPC
resource "aws_vpc" "eks_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name       = "eks-vpc"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "eks_igw" {
  vpc_id = aws_vpc.eks_vpc.id

  tags = {
    Name       = "eks-igw"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

# Subnets
resource "aws_subnet" "eks_subnet_1" {
  vpc_id                  = aws_vpc.eks_vpc.id
  cidr_block              = "10.0.101.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"

  tags = {
    Name       = "eks-subnet-1"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

resource "aws_subnet" "eks_subnet_2" {
  vpc_id                  = aws_vpc.eks_vpc.id
  cidr_block              = "10.0.102.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1b"

  tags = {
    Name       = "eks-subnet-2"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

# Route Table
resource "aws_route_table" "eks_route_table" {
  vpc_id = aws_vpc.eks_vpc.id

  tags = {
    Name       = "eks-route-table"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

resource "aws_route" "eks_internet_access" {
  route_table_id         = aws_route_table.eks_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.eks_igw.id
}

resource "aws_route_table_association" "eks_route_table_association_1" {
  subnet_id      = aws_subnet.eks_subnet_1.id
  route_table_id = aws_route_table.eks_route_table.id
}

resource "aws_route_table_association" "eks_route_table_association_2" {
  subnet_id      = aws_subnet.eks_subnet_2.id
  route_table_id = aws_route_table.eks_route_table.id
}

# Security Group
resource "aws_security_group" "eks_security_group" {
  name        = "eks-security-group"
  description = "Security group for EKS cluster"
  vpc_id      = aws_vpc.eks_vpc.id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.eks_vpc.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "eks-security-group"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

# IAM Roles
resource "aws_iam_role" "eks_cluster_role" {
  name = "eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

resource "aws_iam_role" "eks_node_group_role" {
  name = "eks-node-group-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_group_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_group_role.name
}

resource "aws_iam_role_policy_attachment" "eks_ec2_container_registry_read_only" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_group_role.name
}

# EKS Cluster
resource "aws_eks_cluster" "eks_sandbox_datadog" {
  name     = "eks-sandbox-datadog"
  role_arn = aws_iam_role.eks_cluster_role.arn

  vpc_config {
    subnet_ids         = [aws_subnet.eks_subnet_1.id, aws_subnet.eks_subnet_2.id]
    security_group_ids = [aws_security_group.eks_security_group.id]
  }

  tags = {
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

# Data source para AMI EKS otimizada (exemplo para Linux x86_64, pode ajustar de acordo com a versão do EKS)
data "aws_ami" "eks_worker" {
  filter {
    name   = "name"
    values = ["amazon-eks-node-1.26-v2023*"]
  }

  most_recent = true
  owners      = ["602401143452"] # Proprietário da AMI EKS
}

# Launch Template
resource "aws_launch_template" "eks_node_launch_template" {
  name          = "eks-node-launch-template"
  image_id      = data.aws_ami.eks_worker.image_id
  instance_type = "t3.medium"

  user_data = base64encode(<<EOT
#!/bin/bash
/etc/eks/bootstrap.sh ${aws_eks_cluster.eks_sandbox_datadog.name}
EOT
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "eks-node"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Node Group
resource "aws_eks_node_group" "eks_node_group" {
  cluster_name    = aws_eks_cluster.eks_sandbox_datadog.name
  node_group_name = "eks-sandbox-node-group"
  node_role_arn   = aws_iam_role.eks_node_group_role.arn
  subnet_ids      = [aws_subnet.eks_subnet_1.id, aws_subnet.eks_subnet_2.id]

  scaling_config {
    desired_size = 1
    max_size     = 3
    min_size     = 1
  }

  launch_template {
    id      = aws_launch_template.eks_node_launch_template.id
    version = "$Latest"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_ec2_container_registry_read_only
  ]

  tags = {
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}
