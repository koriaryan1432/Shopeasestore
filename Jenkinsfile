@Library('jenkins-shared-library@main') _

pipeline {
    agent { label 'aws-linux-docker' }
    
    options {
        skipDefaultCheckout()
    }

    environment {
        BUILD_TAG = "${env.BUILD_NUMBER}"
        AWS_DEFAULT_REGION = "ap-south-1"
        ECR_REGISTRY = "470855105302.dkr.ecr.ap-south-1.amazonaws.com"
        BACKEND_IMAGE  = "${ECR_REGISTRY}/shopease-backend"
        FRONTEND_IMAGE = "${ECR_REGISTRY}/shopease-frontend"
        PATH = "${env.WORKSPACE}/bin:${env.PATH}"
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo '📥 Checking out code from GitHub...'
                git url: 'https://github.com/koriaryan1432/Shopeasestore.git', branch: 'main'
                sh '''sed -i '/location \\/api\\//,\\/}/d' frontend/nginx.conf'''
            }
        }

        stage('Setup Docker CLI') {
            steps {
                echo '🛠️ Configuring local Docker CLI...'
                sh 'chmod +x bin/docker'
                sh 'docker --version'
            }
        }

        stage('Authenticate Amazon ECR') {
            steps {
                echo '🔑 Logging in to Amazon ECR...'
                sh 'aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}'
            }
        }

        stage('Generate Task Definition Templates') {
            steps {
                echo '📝 Generating Task Definition Templates...'
                sh 'mkdir -p ecs'
                writeFile file: 'ecs/task-def-backend.json', text: '''{
  "family": "shopease-backend",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "shopease-backend",
      "image": "${BACKEND_IMAGE}:${BUILD_TAG}",
      "cpu": 0,
      "portMappings": [
        {
          "containerPort": 5000,
          "hostPort": 5000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "PORT",
          "value": "5000"
        },
        {
          "name": "DB_HOST",
          "value": "172.31.47.145"
        },
        {
          "name": "DB_USER",
          "value": "root"
        },
        {
          "name": "DB_PASSWORD",
          "value": "${DB_PASSWORD}"
        },
        {
          "name": "DB_NAME",
          "value": "ecommerce_db"
        },
        {
          "name": "DB_PORT",
          "value": "3306"
        },
        {
          "name": "JWT_SECRET",
          "value": "${JWT_SECRET}"
        },
        {
          "name": "SMTP_HOST",
          "value": "smtp.gmail.com"
        },
        {
          "name": "SMTP_PORT",
          "value": "587"
        },
        {
          "name": "SMTP_USER",
          "value": "${SMTP_USER}"
        },
        {
          "name": "SMTP_PASS",
          "value": "${SMTP_PASS}"
        },
        {
          "name": "SMTP_FROM",
          "value": "ShopEase <${SMTP_USER}>"
        },
        {
          "name": "TWILIO_ACCOUNT_SID",
          "value": "${TWILIO_ACCOUNT_SID}"
        },
        {
          "name": "TWILIO_AUTH_TOKEN",
          "value": "${TWILIO_AUTH_TOKEN}"
        },
        {
          "name": "TWILIO_PHONE_NUMBER",
          "value": "${TWILIO_PHONE_NUMBER}"
        },
        {
          "name": "GOOGLE_CLIENT_ID",
          "value": "${GOOGLE_CLIENT_ID}"
        },
        {
          "name": "GEMINI_API_KEY",
          "value": "${GEMINI_API_KEY}"
        },
        {
          "name": "FRONTEND_URL",
          "value": "${FRONTEND_URL}"
        }
      ],
      "mountPoints": [],
      "volumesFrom": [],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/shopease",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "backend"
        }
      }
    }
  ],
  "requiresCompatibilities": [
    "FARGATE"
  ],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::470855105302:role/ecsTaskExecutionRole"
}'''
                writeFile file: 'ecs/task-def-frontend.json', text: '''{
  "family": "shopease-frontend",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "shopease-frontend",
      "image": "${FRONTEND_IMAGE}:${BUILD_TAG}",
      "cpu": 0,
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [],
      "mountPoints": [],
      "volumesFrom": [],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/shopease",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "frontend"
        }
      }
    }
  ],
  "requiresCompatibilities": [
    "FARGATE"
  ],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::470855105302:role/ecsTaskExecutionRole"
}'''
            }
        }

        stage('Secure Environment Setup') {
            steps {
                echo '📝 Generating secure configuration from Jenkins Vault...'
                withCredentials([
                    string(credentialsId: 'shopease-db-password', variable: 'SECURE_DB_PASSWORD'),
                    string(credentialsId: 'shopease-jwt-secret', variable: 'SECURE_JWT_SECRET'),
                    string(credentialsId: 'shopease-smtp-user', variable: 'SECURE_SMTP_USER'),
                    string(credentialsId: 'shopease-smtp-pass', variable: 'SECURE_SMTP_PASS'),
                    string(credentialsId: 'shopease-twilio-sid', variable: 'SECURE_TWILIO_SID'),
                    string(credentialsId: 'shopease-twilio-token', variable: 'SECURE_TWILIO_AUTH_TOKEN'),
                    string(credentialsId: 'shopease-twilio-phone', variable: 'SECURE_TWILIO_PHONE'),
                    string(credentialsId: 'shopease-google-client-id', variable: 'SECURE_GOOGLE_CLIENT_ID'),
                    string(credentialsId: 'shopease-gemini-key', variable: 'SECURE_GEMINI_API_KEY'),
                    string(credentialsId: 'shopease-frontend-url', variable: 'SECURE_FRONTEND_URL')
                ]) {
                    createEnv(
                        DB_NAME: 'ecommerce_db',
                        DB_PASSWORD: env.SECURE_DB_PASSWORD,
                        JWT_SECRET: env.SECURE_JWT_SECRET,
                        SMTP_HOST: 'smtp.gmail.com',
                        SMTP_PORT: '587',
                        SMTP_USER: env.SECURE_SMTP_USER,
                        SMTP_PASS: env.SECURE_SMTP_PASS,
                        SMTP_FROM: "ShopEase <${env.SECURE_SMTP_USER}>",
                        TWILIO_ACCOUNT_SID: env.SECURE_TWILIO_SID,
                        TWILIO_AUTH_TOKEN: env.SECURE_TWILIO_AUTH_TOKEN,
                        TWILIO_PHONE_NUMBER: env.SECURE_TWILIO_PHONE,
                        GOOGLE_CLIENT_ID: env.SECURE_GOOGLE_CLIENT_ID,
                        GEMINI_API_KEY: env.SECURE_GEMINI_API_KEY,
                        FRONTEND_URL: env.SECURE_FRONTEND_URL
                    )
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                echo '📦 Compiling backend image...'
                buildAndPush(
                    imageName: env.BACKEND_IMAGE,
                    buildContext: './backend',
                    buildTag: env.BUILD_TAG
                )
            }
        }

        stage('Build & Push Frontend') {
            steps {
                echo '📦 Compiling frontend image...'
                buildAndPush(
                    imageName: env.FRONTEND_IMAGE,
                    buildContext: './frontend',
                    buildTag: env.BUILD_TAG
                )
            }
        }

        stage('Deploy to ECS Fargate') {
            steps {
                echo '🚀 Deploying ShopEase container stack to ECS Fargate...'
                withCredentials([
                    string(credentialsId: 'shopease-db-password', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'shopease-jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'shopease-smtp-user', variable: 'SMTP_USER'),
                    string(credentialsId: 'shopease-smtp-pass', variable: 'SMTP_PASS'),
                    string(credentialsId: 'shopease-twilio-sid', variable: 'TWILIO_ACCOUNT_SID'),
                    string(credentialsId: 'shopease-twilio-token', variable: 'TWILIO_AUTH_TOKEN'),
                    string(credentialsId: 'shopease-twilio-phone', variable: 'TWILIO_PHONE_NUMBER'),
                    string(credentialsId: 'shopease-google-client-id', variable: 'GOOGLE_CLIENT_ID'),
                    string(credentialsId: 'shopease-gemini-key', variable: 'GEMINI_API_KEY'),
                    string(credentialsId: 'shopease-frontend-url', variable: 'FRONTEND_URL')
                ]) {
                    sh '''
                    # Resolve backend task definition
                    envsubst < ecs/task-def-backend.json > task-def-backend-resolved.json
                    
                    # Resolve frontend task definition
                    envsubst < ecs/task-def-frontend.json > task-def-frontend-resolved.json
                    
                    # Register Task Definitions
                    BACKEND_TASK_ARN=$(aws ecs register-task-definition --cli-input-json file://task-def-backend-resolved.json --region ${AWS_DEFAULT_REGION} --query "taskDefinition.taskDefinitionArn" --output text)
                    FRONTEND_TASK_ARN=$(aws ecs register-task-definition --cli-input-json file://task-def-frontend-resolved.json --region ${AWS_DEFAULT_REGION} --query "taskDefinition.taskDefinitionArn" --output text)
                    
                    # Update ECS Services
                    aws ecs update-service --cluster shopease-cluster --service shopease-backend --task-definition $BACKEND_TASK_ARN --force-new-deployment --region ${AWS_DEFAULT_REGION}
                    aws ecs update-service --cluster shopease-cluster --service shopease-frontend --task-definition $FRONTEND_TASK_ARN --force-new-deployment --region ${AWS_DEFAULT_REGION}
                    
                    # Wait for services to stabilize
                    aws ecs wait services-stable --cluster shopease-cluster --services shopease-backend shopease-frontend --region ${AWS_DEFAULT_REGION}
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up workspace credentials and session...'
            sh 'rm -f .env task-def-backend-resolved.json task-def-frontend-resolved.json'
            sh 'if command -v docker > /dev/null 2>&1; then docker logout ${ECR_REGISTRY}; fi'
        }
    }
}
