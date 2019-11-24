pipeline {
    agent { dockerfile true }
    stages {
        stage('Clean') { 
            steps {
                sh 'rm -rf node_modules .next out'
            }
        }
        // stage('Build') { 
        //     steps {
        //         // sh 'npm --prefix ./src install'
        //         // sh 'npm --prefix ./src rebuild node-sass'
        //         sh 'npm --prefix ./src run first-build'
        //         // sh 'npm --prefix ./src run export'
        //     }
        // }
    }
}