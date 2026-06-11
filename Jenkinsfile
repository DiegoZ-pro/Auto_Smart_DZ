pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        CI = 'true'
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
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Tests y Cobertura') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test -- --coverage --coverageReporters=lcov --coverageReporters=text'
                        }
                    }
                    post {
                        always {
                            junit 'backend/junit.xml'
                            publishHTML(target: [
                                allowMissing : false,
                                alwaysLinkToLastBuild: true,
                                keepAll : true,
                                reportDir : 'backend/coverage/lcov-report',
                                reportFiles : 'index.html',
                                reportName : 'Backend Coverage Report'
                            ])
                        }
                    }
                }

                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test'
                        }
                    }
                    post {
                        always {
                            junit 'frontend/junit-frontend.xml'
                            publishHTML(target: [
                                allowMissing : false,
                                alwaysLinkToLastBuild: true,
                                keepAll : true,
                                reportDir : 'frontend/coverage',
                                reportFiles : 'index.html',
                                reportName : 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completado - Backend + Frontend tests OK.'
        }
        failure {
            echo 'El pipeline falló, revisa los logs.'
        }
    }
}
