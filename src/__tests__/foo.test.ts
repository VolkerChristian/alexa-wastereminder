//import { AmazonUser } from '../../alexa-skill-user-manager/src';
import { createConnection } from 'typeorm';

test('insert amazonuser', (done) => {
    createConnection('wastereminder')
        .then(connection => {
            /*
            let user: AmazonUser = new AmazonUser();
            user.userId = 'voc';
            connection.getRepository<AmazonUser>('AmazonUser').save(user);
            expect(user.userId).toBe('voc');
            */
            done();
        })
        .catch(error => {
            done(error);
        })
});
