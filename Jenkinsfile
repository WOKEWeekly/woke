pipeline {
    agent { dockerfile true }
    stages {
        stage('Build') { 
            steps {
                sh 'npm --prefix ./src install'
                sh 'mkdir ./src/.next'
                sh 'npm --prefix ./src run build'
            }
        }
        stage('Deploy') { 
            steps {
                sh 'npm --prefix ./src run prod'
            }
        } 
    }
}