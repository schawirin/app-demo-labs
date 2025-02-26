provider "aws" {
  region = "us-east-1"  # Região da AWS onde você quer provisionar
}

# Variáveis
variable "my_ip" {
  type    = string
  default = "187.101.207.195/32"  # IP da sua máquina (alterar se necessário)
}

variable "vpc_id" {
  type    = string
  default = "vpc-0a996d27e2e1d2b56"  # ID da VPC existente
}

# Security Group
resource "aws_security_group" "mongodb_sg" {
  name        = "mongodb_sg"
  description = "Allow MongoDB access from my IP"
  vpc_id      = var.vpc_id  # 👈 Adicione esta linha!

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Instâncias EC2 MongoDB com Tags e Cluster Name
resource "aws_instance" "mongodb_instance_1" {
  ami             = "ami-04b4f1a9cf54c11d0"  # AMI correta para a sua região
  instance_type   = "t2.micro"  # Free Tier
  key_name        = "se-admin"  # Substitua pela sua chave SSH
  vpc_security_group_ids = [aws_security_group.mongodb_sg.id]
  security_groups = [aws_security_group.mongodb_sg.id]  # Usando ID do Security Group
  subnet_id       = "subnet-0f51a4c7da0dca6e4"  # Subnet 1
  
  user_data = <<-EOF
              #!/bin/bash
              sudo apt update
              sudo apt install -y mongodb
              sudo systemctl enable mongodb
              sudo systemctl start mongodb
              EOF

  tags = {
    Name       = "mongo-dogboot"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
    ClusterName = "mongo-dogboot"
  }
}

resource "aws_instance" "mongodb_instance_2" {
  ami             = "ami-04b4f1a9cf54c11d0"  # AMI correta para a sua região
  instance_type   = "t2.micro"  # Free Tier
  key_name        = "se-admin"  # Substitua pela sua chave SSH
  vpc_security_group_ids = [aws_security_group.mongodb_sg.id]
  security_groups = [aws_security_group.mongodb_sg.id]  # Usando ID do Security Group
  subnet_id       = "subnet-007be4b9236911c7f"  # Subnet 2

  user_data = <<-EOF
              #!/bin/bash
              sudo apt update
              sudo apt install -y mongodb
              sudo systemctl enable mongodb
              sudo systemctl start mongodb
              EOF

  tags = {
    Name       = "mongo-dogboot"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
    ClusterName = "mongo-dogboot"
  }
}

# Outputs
output "instance_1_public_ip" {
  value = aws_instance.mongodb_instance_1.public_ip
}

output "instance_2_public_ip" {
  value = aws_instance.mongodb_instance_2.public_ip
}
