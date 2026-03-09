pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'your-dockerhub-username'
        BACKEND_IMAGE = 'habitflow-backend'
        FRONTEND_IMAGE = 'habitflow-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install --legacy-peer-deps'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install --legacy-peer-deps'
                        }
                    }
                }
            }
        }

        stage('Lint & Static Analysis') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            sh 'npm run build' // Type checking via TS
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build' // Type checking via Next.js build
                        }
                    }
                }
            }
        }

        stage('Unit Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Docker Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        sh "docker build -t ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${env.BUILD_NUMBER} ./backend"
                        sh "docker tag ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${env.BUILD_NUMBER} ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest"
                    }
                }
                stage('Build Frontend') {
                    steps {
                        sh "docker build -t ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${env.BUILD_NUMBER} ./frontend"
                        sh "docker tag ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${env.BUILD_NUMBER} ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Publish Images') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${env.BUILD_NUMBER}"
                    sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${env.BUILD_NUMBER}"
                }
            }
        }
    }

    post {
        always {
            // This is the "Reporting back to Bitbucket" part
            // Requires the 'Bitbucket Build Status Notifier' plugin for Jenkins
            bitbucketStatusNotify(
                buildState: currentBuild.currentResult == 'SUCCESS' ? 'SUCCESSFUL' : 'FAILED',
                repoSlug: 'habitflow',
                commitId: "${sh(returnStdout: true, script: 'git rev-parse HEAD').trim()}"
            )
            cleanWs()
        }
    }
}
