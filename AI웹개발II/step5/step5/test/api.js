const request = require("supertest");
const app = require("../app");
const { Comment } = require("../models")

var comment

async function getComment() {
    comment = Comment.findAll({
            where : { userId: '5165373262' },
            attributes : [ 'comment ']
        })
    console.log(comment)
    return comment
}    

describe('API Test: [User]', () => {
    it('GET /users', done => {
        request(app)
            .get("/users")
            .expect(res => {
                console.log(res.body);
            })
            .expect(200, done);
    });

    it('GET /user/hyhy', done => {
        request(app)
            .get("/user/hyhy")
            .expect(res => {
                console.log(res.body);
            })
            .expect(200, { 
                id: 'hyhy', name: 'hayeon', description: 'http://k.kakaocdn.net/dn/b0YCpU/dJMcacK7HtS/K3wppc7TKppNXbQPewKPik/img_640x640.jpg' 
            }, done);
    });

    it('GET /comments', done => {
        // console.log(getComment)

        request(app)
            .get("/comments")
            .expect(res => {
                console.log(res.body);
            })
            .expect(200, {
                comments : comments.attributes
            }, done)
    })

    // npx mocha --exit -f POST test/api.js
    // -f: 지정한 문자열을 포함하는 테스트만 진행
    it('POST /user/update', done => {
        request(app)
            .post("/user/update")
            .send({ id: "hyhy", description: "gg" })
            .expect(302, done);
    });
});
