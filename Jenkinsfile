pipeline {
    agent {
        docker {
            image 'node:12.13.0-alpine' 
            args '-p 3001:3001' 
        }
    }
    stages {
        stage('Build') { 
            steps {
                sh 'sudo apt-get update'
                sh 'sudo apt-get install'
                sh 'npm --prefix ./src install'
            }
        }
        stage('Deploy') { 
            steps {
                sh 'npm --prefix ./src run prod'
            }
        } 
    }
}