provider "aws" {
  region = "us-east-1"  # Defina a região correta
}

# 🔹 Usar a VPC existente
data "aws_vpc" "existing_vpc" {
  id = "vpc-0a996d27e2e1d2b56"
}

# 🔹 Usar as Subnets existentes
data "aws_subnet" "public_subnet_1" {
  id = "subnet-0f51a4c7da0dca6e4"
}

data "aws_subnet" "public_subnet_2" {
  id = "subnet-007be4b9236911c7f"
}

# 🔹 Criar um Security Group para permitir tráfego HTTP (porta 8080)
resource "aws_security_group" "ecs_sg" {
  vpc_id = data.aws_vpc.existing_vpc.id
  name   = "ecs_fargate_sg"

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Aberto para qualquer IP (para testes)
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 🔹 Criar um Cluster ECS Fargate
resource "aws_ecs_cluster" "ecs_cluster" {
  name = "ecs-fargate-cluster"
}

# 🔹 Criar uma Task Definition para rodar o app Java
resource "aws_ecs_task_definition" "java_task" {
  family                   = "java-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "java-app"
      image     = "schawirin/javasandbox:v1"  # Use sua imagem Docker
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]
    }
  ])
}

# 🔹 Criar um Serviço ECS com IP Público
resource "aws_ecs_service" "java_service" {
  name            = "java-service"
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.java_task.arn
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [data.aws_subnet.public_subnet_1.id, data.aws_subnet.public_subnet_2.id]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true  # Habilitar IP Público para acessar diretamente
  }

  desired_count = 1
}

# 🔹 Criar uma Role para permitir execução de Tarefas ECS
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
