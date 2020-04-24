pipeline {
    agent { 
        dockerfile true
    }
    stages {
        stage('Clean') { 
            steps {
              dir('src'){
                sh 'rm -rf node_modules .next'
              }
            }
        }
        stage('Build') { 
            steps {
              dir('src'){
                sh 'npm install'
                sh 'npm run build-ci'
              }
            }
        }
        // stage('Deploy') {
        //   steps {
        //     sh '/home/rebuild-woke.sh Dockerfile-woke-from-jenkins'
        //   }
        // }
    }
}