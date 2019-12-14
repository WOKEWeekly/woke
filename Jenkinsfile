pipeline {
    agent { dockerfile true }
    stages {
        stage('Clean') { 
            steps {
                sh 'rm -rf node_modules .next out'
            }
        }
    }
}