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
                sh 'npm --prefix ./src rebuild node-sass'
                sh 'npm --prefix ./src run first-build'
            }
        }
    }
}