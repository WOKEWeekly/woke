pipeline {
    agent { dockerfile true }
    stages {
        stage('Clean') { 
            steps {
                sh 'npm --prefix ./src prune'
            }
        }
        stage('Build') { 
            steps {
                sh 'npm --prefix ./src install'
                sh 'npm --prefix ./src run first-build'
            }
        }
        stage('Deploy') { 
            steps {
                sh 'npm --prefix ./src run prod'
            }
        } 
    }
}