const assert = require('chai').assert;
const { User } = require('../models/');
const { Comment } = require('../models/');

// 테스트 모음
describe('Simple Test', () => {
    before(() => {});
    after(() => {});
    // 각각의 테스트 전
    beforeEach(() => {});

    // 각각의 테스트 후 
    afterEach(() => {});
    
    // it 하나가 단위 
    it('abcd', () => {
        assert.equal(3 * 3, 9);
    });
});

// ORM : Object Relation Mapping
describe('ORM Test: [User Model]', () => {
    it('User.findOne(id=wkim)', async () => {
        const user = await User.findOne({
            where: { id: 'hyhy' },
            attributes: ['id', 'name', 'description']
        });

        assert.equal('hyhy', user.id);
    });
    
    it('User.findAll()', async () => {
        const users = await User.findAll({
            attributes: ['id', 'name', 'description']
        });

        assert.exists(users);
    });

    it('Comment.findOne()', async () => {
        const comment = await Comment.findOne({
            where: { userId: '5165373262' },
            attributes: ['comment']
        });

        assert.equal('hh', comment);
    });
});

