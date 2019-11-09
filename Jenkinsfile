pipeline {
    agent { dockerfile true }
    stages {
        stage('Build') { 
            steps {
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