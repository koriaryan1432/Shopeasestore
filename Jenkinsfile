@Library('jenkins-shared-library@main') _

pipeline {
    agent { label 'aws-linux-docker' }

    environment {
        BUILD_TAG = "${env.BUILD_NUMBER}"
        BACKEND_IMAGE  = "koriaryan/shopease-backend"
        FRONTEND_IMAGE = "koriaryan/shopease-frontend"
        REGISTRY_CREDS = "dockerhub-credentials"
        PATH = "${env.WORKSPACE}/bin:${env.PATH}"
    }

    stages {
        stage('Setup Docker CLI & Compose') {
            steps {
                echo '🛠️ Configuring local Docker CLI and Compose plugin...'
                sh 'chmod +x bin/docker'
                sh 'chmod +x bin/docker-compose'
                sh 'mkdir -p ~/.docker/cli-plugins'
                sh 'cp bin/docker-compose ~/.docker/cli-plugins/docker-compose'
                sh 'chmod +x ~/.docker/cli-plugins/docker-compose'
                sh 'docker --version'
                sh 'docker compose version'
            }
        }

        stage('Authenticate Docker Hub') {
            steps {
                echo '🔑 Logging in to Docker Hub...'
                dockerLogin(env.REGISTRY_CREDS)
            }
        }

        stage('Secure Environment Setup') {
            steps {
                echo '📝 Generating secure configuration from Jenkins Vault...'
                
                // Bind all credentials securely from Jenkins Credentials Vault to prevent leaks
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
                    // Call the shared library utility method to output the secure .env file
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

        stage('Deploy Stack') {
            steps {
                echo '🚀 Deploying ShopEase containers...'
                deployApp(
                    composeFile: './docker-compose.yml',
                    buildTag: env.BUILD_TAG
                )
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up workspace credentials and session...'
            sh 'rm -f .env'
            sh 'if command -v docker > /dev/null 2>&1; then docker logout; fi'
        }
    }
}