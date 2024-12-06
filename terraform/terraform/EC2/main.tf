terraform {
  backend "s3" {
    bucket         = "dd-terraform-sandbox-pedro-schawirin-us-east-1"
    key            = "ec2/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock-table"
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC padrão
data "aws_vpc" "default" {
  default = true
}

# Zonas de disponibilidade disponíveis
data "aws_availability_zones" "available" {
  state = "available"
}

# Subnet padrão na primeira zona de disponibilidade
data "aws_subnet" "default" {
  availability_zone = data.aws_availability_zones.available.names[0]
  default_for_az    = true
}

# Obter a AMI Amazon Linux 2 mais recente
data "aws_ami" "amazon_linux" {
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  owners = ["137112412989"]
}

# Security Group para a Instância EC2
resource "aws_security_group" "docker_lab_sg" {
  name        = "docker-lab-sg"
  description = "Security group for Docker Lab EC2 instance"
  vpc_id      = data.aws_vpc.default.id

  # Ajuste "seu_ip/32" para o seu IP público real, ex: "203.0.113.5/32"
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["seu_ip/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "docker-lab-sg"
    owner      = "Latam team"
    created_by = "Pedro Schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

# Instância EC2 (Spot)
resource "aws_instance" "docker_lab" {
  ami           = data.aws_ami.amazon_linux.image_id
  instance_type = "t3.medium"
  subnet_id     = data.aws_subnet.default.id

  instance_market_options {
    market_type = "spot"

    spot_options {
      max_price                      = "0.03"
      spot_instance_type             = "one-time"
      instance_interruption_behavior = "terminate"
    }
  }

  root_block_device {
    volume_size = 100
    volume_type = "gp2"
  }

  # User Data para instalar e iniciar o Docker
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              amazon-linux-extras install docker -y
              service docker start
              usermod -a -G docker ec2-user
              EOF

  # Substitua "sua-chave-ssh" pelo nome da sua chave SSH
  key_name = "sua-chave-ssh"

  vpc_security_group_ids = [aws_security_group.docker_lab_sg.id]

  tags = {
    Name       = "docker-lab"
    owner      = "Latam team"
    created_by = "Pedro Schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}
