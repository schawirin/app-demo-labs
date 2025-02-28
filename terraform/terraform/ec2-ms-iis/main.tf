provider "aws" {
  region  = "us-east-1"
  profile = "sandbox-datadog"
}

# Criando a Role IAM para a SSM
resource "aws_iam_role" "ssm_role" {
  name = "ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}

# Criando a política IAM personalizada para SSM
resource "aws_iam_policy" "ssm_windows_policy" {
  name        = "ssm-windows"
  description = "Policy for SSM access on Windows instances"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:DescribeAssociation",
        "ssm:GetDeployablePatchSnapshotForInstance",
        "ssm:GetDocument",
        "ssm:DescribeDocument",
        "ssm:GetManifest",
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:ListAssociations",
        "ssm:ListInstanceAssociations",
        "ssm:PutInventory",
        "ssm:PutComplianceItems",
        "ssm:PutConfigurePackageResult",
        "ssm:UpdateAssociationStatus",
        "ssm:UpdateInstanceAssociationStatus",
        "ssm:UpdateInstanceInformation",
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel",
        "ec2messages:AcknowledgeMessage",
        "ec2messages:DeleteMessage",
        "ec2messages:FailMessage",
        "ec2messages:GetEndpoint",
        "ec2messages:GetMessages",
        "ec2messages:SendReply"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

# Anexando a política IAM à role
resource "aws_iam_role_policy_attachment" "ssm_windows_policy_attachment" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = aws_iam_policy.ssm_windows_policy.arn
}

# Criando um IAM Instance Profile e associando-o à Role IAM
resource "aws_iam_instance_profile" "ssm_instance_profile" {
  name = "ssm-instance-profile"
  role = aws_iam_role.ssm_role.name
}

resource "aws_security_group" "iis_sales_sg" {
  name        = "iis-sales"
  description = "Security group for IIS on EC2"

  ingress {
    from_port   = 3389
    to_port     = 3389
    protocol    = "tcp"
    cidr_blocks = ["189.68.175.190/32"] # Substitua <YOUR_IP> pelo seu endereço IP
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "iis-sales"
  }
}

resource "aws_instance" "windows_server" {
  ami                 = "ami-09ec59ede75ed2db7" # Substitua pela AMI do Windows Server mais recente
  instance_type       = "t3.large"
  key_name            = "se-admin"
  security_groups     = [aws_security_group.iis_sales_sg.name]
  iam_instance_profile = aws_iam_instance_profile.ssm_instance_profile.name

  tags = {
    Creator    = "pedro.schawirin@datadoghq.com"
    Team       = "sales-latam"
    Service    = "ec2"
    terraform  = "true"
    name       = "ms-iis-sales"
  }

  # Script de inicialização para instalar o IIS
  user_data = <<-EOF
              <powershell>
              Install-WindowsFeature -name Web-Server -IncludeManagementTools
              </powershell>
              EOF

  # Anexando o volume EBS à instância
  root_block_device {
    volume_size           = 200
    delete_on_termination = true
    volume_type           = "gp2"
  }
}
