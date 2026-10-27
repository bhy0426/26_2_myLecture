const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    // 정적 메소드이므로 User.init으로 호출 가능
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.STRING(100),
                allowNull: false,
                primaryKey: true
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            name: {
                type: Sequelize.STRING(20),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            }
        }, {
            sequelize,
            timestamps: false,
            // table명 _ 유무
            underscored: false,
            // modelName과 tableName 설정 중요
            modelName: 'User',
            tableName: 'users',
            paranoid: false,
            // mb4는 이모티콘도 가능한 charset
            charset: 'utf8mb4',
            // 정렬 순서
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        // hasMany 1:n 관계
        // cascade - 부모 테이블에서 키가 삭제되면 자식 테이블의 데이터 삭제
        db.User.hasMany(db.Comment, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'cascade' });
    }
};
