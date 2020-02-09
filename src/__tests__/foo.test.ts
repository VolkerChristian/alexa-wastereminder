import { AmazonUser } from '../../alexa-skill-user-manager/src';
import { createConnection, getRepository } from 'typeorm';

test('insert amazonuser', (done) => {
    createConnection()
        .then(connection => {
            
            let user: AmazonUser = new AmazonUser();
            user.userId = 'voc';

            getRepository<AmazonUser>('AmazonUser').save(user);
            expect(user.userId).toBe('voc');
            
            done();
        })
        .catch(error => {
            done(error);
        })
});
