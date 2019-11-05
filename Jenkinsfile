pipeline {
    agent {
        docker {
            image 'node:13-alpine' 
            args '-p 3001:3001' 
        }
    }
    stages {
        stage('Build') { 
            steps {
                sh 'npm --prefix ./src install'
            }
        }
    }
}