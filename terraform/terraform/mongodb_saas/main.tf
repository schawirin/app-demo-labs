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
resource "aws_security_group" "documentdb_sg" {
  name        = "documentdb_sg"
  description = "Allow access to DocumentDB from my IP"

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

# Amazon DocumentDB Cluster com nome atualizado
resource "aws_docdb_cluster" "my_documentdb_cluster" {
  cluster_identifier = "dogboot-llm-rga"  # Nome do Cluster alterado
  engine             = "docdb"
  master_username    = "dogboot"  # Substituído de 'admin' para 'admin_user'
  master_password    = "dogboot77"  # Substitua por uma senha segura
  skip_final_snapshot = true

  vpc_security_group_ids = [aws_security_group.documentdb_sg.id]

  tags = {
    Name       = "dogboot-llm-rga"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

# Criando 3 instâncias para o cluster DocumentDB (usando db.r5.large)
resource "aws_docdb_cluster_instance" "my_documentdb_instance_1" {
  cluster_identifier = aws_docdb_cluster.my_documentdb_cluster.cluster_identifier
  instance_class     = "db.t3.medium"  # Tipo de instância suportado pelo Amazon DocumentDB
  engine             = "docdb"
  
  tags = {
    Name       = "dogboot-llm-rga-instance-1"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

resource "aws_docdb_cluster_instance" "my_documentdb_instance_2" {
  cluster_identifier = aws_docdb_cluster.my_documentdb_cluster.cluster_identifier
  instance_class     = "db.t3.medium"  # Tipo de instância suportado pelo Amazon DocumentDB
  engine             = "docdb"
  
  tags = {
    Name       = "dogboot-llm-rga-instance-2"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

resource "aws_docdb_cluster_instance" "my_documentdb_instance_3" {
  cluster_identifier = aws_docdb_cluster.my_documentdb_cluster.cluster_identifier
  instance_class     = "db.t3.medium"  # Tipo de instância suportado pelo Amazon DocumentDB
  engine             = "docdb"
  
  tags = {
    Name       = "dogboot-llm-rga-instance-3"
    owner      = "Latam team"
    created_by = "pedro schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

# Outputs
output "documentdb_cluster_endpoint" {
  value = aws_docdb_cluster.my_documentdb_cluster.endpoint
}

output "documentdb_cluster_reader_endpoint" {
  value = aws_docdb_cluster.my_documentdb_cluster.reader_endpoint
}
