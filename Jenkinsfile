boolean isMaster = $env.JOB_NAME == "woke"
String slackMessage = isMaster
  ? "Master build #${env.BUILD_NUMBER}"
  : "Branch build [${env.BRANCH_NAME}]"

pipeline {
  agent {
    dockerfile true
  }

  environment {
    PORT = 3000
    JWT_SECRET = credentials('jwt-secret')
    AUTH_KEY = credentials('authorization-key')
    MYSQL_HOST = credentials('mysql-host')
    MYSQL_NAME = credentials('mysql-name')
    MYSQL_USER = credentials('mysql-user')
    MYSQL_PWD = credentials('mysql-pwd')
    CLOUDINARY_NAME = credentials('cloudinary-name')
    CLOUDINARY_API_KEY = credentials('cloudinary-api-key')
    CLOUDINARY_API_SECRET = credentials('cloudinary-api-secret')
    SLACK_TOKEN = credentials('slack-token')
    EMAIL_USER = credentials('email-user')
    EMAIL_PWD = credentials('email-pwd')
  }

  options {
    timeout(time: 7.5, unit: 'MINUTES')
  }

  stages {
    stage('Install dependencies') {
      steps {
        dir('src') {
          sh 'npm ci'
        }
      }
    }
    stage('Build') {
      steps {
        dir('src') {
          sh 'npm run build'
        }
      }
    }
    stage('Test') {
      steps {
        dir('src') {
          sh 'npm run test-ci'
          junit '**/test-results.xml'
        }
      }
    }
  }

  post {
    always {
      dir('src') {
        sh 'rm -rf node_modules .next'
      }
    }

    success {
      slackSend (color: 'good', message: "${slackMessage} successful.")
    }

    aborted {
      slackSend (color: 'warning', message: "${slackMessage} timed out.")
    }
    
    failure {
      slackSend (color: 'danger', message: "${slackMessage} failed.")
    }
  }
}
