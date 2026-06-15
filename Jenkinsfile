@Library('jenkins-shared-library@main') _

pipeline {
    agent { label 'jenkins-agent' }

    environment {
        BUILD_TAG = "${env.BUILD_NUMBER}"
        BACKEND_IMAGE  = "koriaryan/shopease-backend"
        FRONTEND_IMAGE = "koriaryan/shopease-frontend"
        REGISTRY_CREDS = "dockerhub-credentials"
        PATH = "${env.WORKSPACE}/bin:${env.PATH}"
    }

    stages {
        stage('Install Docker CLI') {
            steps {
                echo '🛠️ Checking and installing Docker CLI...'
                sh '''
                    if ! command -v docker > /dev/null 2>&1; then
                        echo "Docker CLI not found in PATH."
                        mkdir -p "${WORKSPACE}/bin"
                        if [ -f "${WORKSPACE}/bin/docker" ]; then
                            echo "Docker CLI already exists in workspace bin."
                        else
                            echo "Attempting to download static Docker CLI..."
                            DOWNLOAD_URL="https://download.docker.com/linux/static/stable/x86_64/docker-26.1.4.tgz"
                            
                            if command -v curl > /dev/null 2>&1; then
                                curl -fsSL "$DOWNLOAD_URL" -o /tmp/docker.tgz
                            elif command -v wget > /dev/null 2>&1; then
                                wget -qO /tmp/docker.tgz "$DOWNLOAD_URL"
                            elif command -v python3 > /dev/null 2>&1; then
                                python3 -c "import urllib.request; urllib.request.urlretrieve('$DOWNLOAD_URL', '/tmp/docker.tgz')"
                            elif command -v python > /dev/null 2>&1; then
                                python -c "import urllib; urllib.urlretrieve('$DOWNLOAD_URL', '/tmp/docker.tgz')"
                            elif command -v perl > /dev/null 2>&1; then
                                export DOWNLOAD_URL
                                perl -MHTTP::Tiny -e 'my $response = HTTP::Tiny->new->mirror($ENV{DOWNLOAD_URL}, "/tmp/docker.tgz"); die "Download failed: $response->{reason}" unless $response->{success};'
                            else
                                echo "No downloader tool found (curl, wget, python, perl). Failing."
                                exit 1
                            fi
                            
                            echo "Extracting docker CLI..."
                            tar -xzf /tmp/docker.tgz -C /tmp
                            mv /tmp/docker/docker "${WORKSPACE}/bin/docker"
                            chmod +x "${WORKSPACE}/bin/docker"
                            rm -rf /tmp/docker.tgz /tmp/docker
                        fi
                    fi
                    docker --version
                '''
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