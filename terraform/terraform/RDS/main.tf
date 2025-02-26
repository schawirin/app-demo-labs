provider "aws" {
  region = "us-east-1"
}

# 🚀 Criando uma NOVA VPC
resource "aws_vpc" "llm_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true

  tags = {
    Name = "llm-vpc"
  }
}

# 🚀 Criando Sub-rede Pública
resource "aws_subnet" "public_subnet" {
  vpc_id = aws_vpc.llm_vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "llm-public-subnet"
  }
}

# 🚀 Criando Sub-rede Privada (onde ficará o RDS)
resource "aws_subnet" "private_subnet" {
  vpc_id = aws_vpc.llm_vpc.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "llm-private-subnet"
  }
}

# 🚀 Criando Internet Gateway (para acesso público)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.llm_vpc.id

  tags = {
    Name = "llm-igw"
  }
}

# 🚀 Criando NAT Gateway para permitir tráfego da sub-rede privada
resource "aws_eip" "nat_eip" {}

resource "aws_nat_gateway" "nat_gw" {
  subnet_id = aws_subnet.public_subnet.id
  allocation_id = aws_eip.nat_eip.id

  tags = {
    Name = "llm-nat-gw"
  }
}

# 🚀 Criando Tabela de Rotas para a sub-rede pública
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.llm_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "llm-public-rt"
  }
}

# 🚀 Criando Tabela de Rotas para a sub-rede privada
resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.llm_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = {
    Name = "llm-private-rt"
  }
}

# 🚀 Associando sub-redes às tabelas de rotas
resource "aws_route_table_association" "public_assoc" {
  subnet_id = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_assoc" {
  subnet_id = aws_subnet.private_subnet.id
  route_table_id = aws_route_table.private_rt.id
}

# 🚀 Criando Grupo de Subnet para o RDS
resource "aws_db_subnet_group" "db_subnets" {
  name = "llm-dbm-subnet-group"
  subnet_ids = [aws_subnet.private_subnet.id]

  tags = {
    Name = "llm-dbm-subnet-group"
  }
}

# 🚀 Criando Grupo de Segurança para o RDS
resource "aws_security_group" "db_sg" {
  name = "llm-dbm-sg"
  description = "Allows PostgreSQL connections"
  vpc_id = aws_vpc.llm_vpc.id

  ingress {
    from_port = 5432
    to_port = 5432
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # ⚠️ Ajuste isso para um IP mais restrito para segurança
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 🚀 Criando Função IAM para Monitoramento Aprimorado do RDS
resource "aws_iam_role" "rds_monitoring_role" {
  name = "rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# 🚀 Anexando a política de monitoramento ao IAM Role
resource "aws_iam_role_policy_attachment" "rds_monitoring_role_attachment" {
  role = aws_iam_role.rds_monitoring_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# 🚀 Criando a instância do RDS PostgreSQL
resource "aws_db_instance" "llm_dbm" {
  identifier = "llm-dbm"
  allocated_storage = 50
  storage_type = "gp3"
  engine = "postgres"
  engine_version = "14.15"
  instance_class = "db.t3.medium"
  username = "db_admin"
  password = "llm-dbm-778899"
  publicly_accessible = false
  skip_final_snapshot = true
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name = aws_db_subnet_group.db_subnets.name
  backup_retention_period = 7
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring_role.arn
}

# 🚀 Saída com o Endpoint do Banco de Dados
output "db_endpoint" {
  value = aws_db_instance.llm_dbm.endpoint
}
