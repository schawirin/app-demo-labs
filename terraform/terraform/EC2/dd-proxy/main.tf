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
resource "aws_security_group" "datadog_proxy_sg" {
  name        = "datadog-proxy-sg"
  description = "Security group for Datadog Proxy Apache EC2 instance"
  vpc_id      = data.aws_vpc.default.id

  # Permitir conexões SSH e para o Apache Proxy
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["177.25.81.96/32"]
  }

  ingress {
    from_port   = 80
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["177.25.81.96/32"]
  }

  ingress {
    from_port   = 8125
    to_port     = 8126
    protocol    = "tcp"
    cidr_blocks = ["177.25.81.96/32"]
  }

   ingress {
    from_port   = 3834
    to_port     = 3837
    protocol    = "tcp"
    cidr_blocks = ["177.25.81.96/32"]
  }

  ingress {
    from_port   = 10514
    to_port     = 10514
    protocol    = "tcp"
    cidr_blocks = ["177.25.81.96/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "datadog-proxy-sg"
    owner      = "Latam team"
    created_by = "Pedro Schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}

# Instância EC2 para o Datadog Proxy
resource "aws_instance" "datadog_proxy_apache" {
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

  # User Data para configurar o Apache como proxy
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y httpd mod_ssl ca-certificates
              systemctl start httpd
              systemctl enable httpd

              cat <<EOT >> /etc/httpd/conf/httpd.conf
              Listen 80
              Listen 443
              Listen 3834
              Listen 3835
              Listen 3836
              Listen 3837
              Listen 10514

              <VirtualHost *:10514>
                  ServerName datadog-logs
                  ProxyRequests Off
                  ProxyPass / https://localhost:10514/
                  ProxyPassReverse / https://localhost:10514/
                  SSLEngine On
                  SSLProxyEngine On
                  SSLProxyVerify none
                  SSLProxyCheckPeerCN off
                  SSLProxyCheckPeerName off
              </VirtualHost>

              <VirtualHost *:443>
                  ServerName datadoghq-com
                  ProxyRequests Off
                  ProxyPass / https://api.datadoghq.com:443/
                  ProxyPassReverse / https://api.datadoghq.com:443/
                  SSLEngine On
                  SSLProxyEngine On
                  SSLProxyVerify none
                  SSLProxyCheckPeerCN off
                  SSLProxyCheckPeerName off
              </VirtualHost>

              <VirtualHost *:3834>
                  ServerName datadoghq-apm
                  ProxyRequests Off
                  ProxyPass / https://trace.agent.datadoghq.com:3834/
                  ProxyPassReverse / https://trace.agent.datadoghq.com:3834/
                  SSLEngine On
                  SSLProxyEngine On
                  SSLProxyVerify none
                  SSLProxyCheckPeerCN off
                  SSLProxyCheckPeerName off
              </VirtualHost>

              systemctl restart httpd
              EOF

  # Substitua "sua-chave-ssh" pelo nome da sua chave SSH
  key_name = "se-admin"

  vpc_security_group_ids = [aws_security_group.datadog_proxy_sg.id]

  tags = {
    Name       = "datadog-proxy-apache"
    owner      = "Latam team"
    created_by = "Pedro Schawirin"
    env        = "sandbox"
    terraform  = "true"
  }
}
