boolean isMaster = env.JOB_NAME == 'woke'
String slackMessage = isMaster
  ? "Master build #${env.BUILD_NUMBER}"
  : "PR build #${env.BUILD_NUMBER} on ${env.CHANGE_BRANCH} branch by ${env.CHANGE_AUTHOR_DISPLAY_NAME}"
String cwd = 'src'

pipeline {
  agent {
    docker { image 'node:13-alpine' }
  }

  environment {
    PORT = 3000
    JWT_SECRET = credentials('jwt-secret')
    SESSION_NAME = credentials('session-name')
    SESSION_SECRET = credentials('session-secret')
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
    disableConcurrentBuilds()
    timeout(time: 7.5, unit: 'MINUTES')
  }

  stages {
    stage('Install dependencies') {
      steps {
        dir(cwd) {
          sh 'npm ci'
        }
      }
    }
    stage('Build') {
      steps {
        dir(cwd) {
          sh 'npm run build'
        }
      }
    }
    stage('Test') {
      steps {
        dir(cwd) {
          sh 'npm run test-ci'
        }
      }
    }
  }

  post {
    always {
      dir(cwd) {
        junit '**/test-results.xml'
        sh 'rm -rf node_modules .next'
      }
    }

    // success {
    //   slackSend (color: 'good', message: "${slackMessage} successful.")
    // }

    // aborted {
    //   slackSend (color: 'warning', message: "${slackMessage} timed out.")
    // }

    // failure {
    //   slackSend (color: 'danger', message: "${slackMessage} failed.")
    // }
  }
}
