// 생성자 함수로 호출
const Sequelize = require('sequelize');
const User = require('./user');
const Comment = require('./comment');

// NODE_ENV 속성이 없으면 development 키를 가져옴
const env = process.env.NODE_ENV || 'development';
// config.json에서 development 키를 가져와 config에 저장
const config = require('../config/config')[env];

const sequelize = new Sequelize(
    config.database, config.username, config.password, config
);

const db = {
    sequelize,
    User,
    Comment
};

User.init(sequelize);
Comment.init(sequelize);

User.associate(db);
Comment.associate(db);

module.exports = db;
