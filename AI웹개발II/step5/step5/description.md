# Step1 - Middleware
npm init

npm i express, morgan, dotenv, cookie-parser, express-session
npm i -D nodemon
npm i dotenv

# Step2 - Routing, nunjucks, bcrypt
npm i nunjucks
npm i bcrypt

# Step3 - Sequelize
npm i sequelize, sequelize-cli, mysql2
npx sequelize init

# Step4 - Passport
npm i passport, passport-local, passport-kakao

# Step5 - Testing
npm i -D mocha, chai, supertest

# Test
npx mocha
npm run [Name]

npx mocha --exit -f Simple test/unit.js
-f: 지정한 문자열을 포함하는 테스트만 진행