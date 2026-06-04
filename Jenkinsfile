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
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Tests y Cobertura') {
            steps {
                dir('backend') {
                    sh 'npm test -- --coverage --coverageReporters=lcov --coverageReporters=text'
                }
            }
            post {
                always {
                    junit 'backend/junit.xml'
                    publishHTML(target: [
                        allowMissing         : false,
                        alwaysLinkToLastBuild: true,
                        keepAll : true,
                        reportDir : 'backend/coverage/lcov-report',
                        reportFiles : 'index.html',
                        reportName : 'Coverage Report'
                    ])
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completado - 139 tests OK.'
        }
        failure {
            echo 'El pipeline falló, ponte a llorar o revisa los logs. xD'
        }
    }
}
