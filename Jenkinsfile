pipeline {
    agent { dockerfile true }
    stages {
        stage('Clean') { 
            steps {
                sh 'rm -rf node_modules .next out'
            }
        }
        stage('Build') { 
            steps {
                sh 'cd src'
                sh 'npm ci'
                sh 'npm run build'
                sh 'npm run export'
                // sh 'npm --prefix ./src rebuild node-sass'
                // sh 'npm --prefix ./src run first-build'
                // sh 'npm --prefix ./src run export'
            }
        }
    }
}