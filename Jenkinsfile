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
    MAILCHIMP_INSTANCE = credentials('mailchimp-instance')
    MAILCHIMP_API_KEY = credentials('mailchimp-api-key')
    MAILCHIMP_LISTID = credentials('mailchimp-listid')
  }

  options {
    parallelsAlwaysFailFast()
  }

  stages {
    stage('Clean') { 
      steps {
        dir('src'){
          sh 'rm -rf node_modules .next'
        }
      }
    }
    stage('Build & Test'){
      parallel {
        stage('Build') { 
          steps {
            timeout(time: 3, unit: 'MINUTES') {
              dir('src'){
                sh 'npm install'
                sh 'npm run build'
              }
            }
          }
        }
        stage('Test') {
          steps {
            timeout(time: 3, unit: 'MINUTES') {
              dir('src'){
                sh 'npm run test-ci'
                junit '**/test-results.xml'
              }
            }
          }
        }
      }
    }
  }

  post {
    always {
      dir('src'){
        sh 'rm -rf node_modules'
      }
    }
  }
}