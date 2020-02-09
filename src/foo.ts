import { createConnection, getRepository } from 'typeorm';
import { AmzNCForainKeys } from './entity/AmzNCForainKeys';
import { AmazonUser } from '../alexa-skill-user-manager/src';
import { NextcloudUser } from '../nextcloud-oauth2-client/src';

createConnection().then(async () => {

    let key: AmzNCForainKeys = new AmzNCForainKeys();
    key.data = 3;

    let amzUser: AmazonUser = await AmazonUser.getUser('AmazonUser');
    key.amazonUser = amzUser;

    let ncUser: NextcloudUser = await NextcloudUser.getUser('voc');
    key.nectcloudUser = ncUser;

    getRepository<AmzNCForainKeys>('AmzNCForainKeys').save(key)
        .then(user => console.log(user))
        .catch(reason => console.log(reason));
});
