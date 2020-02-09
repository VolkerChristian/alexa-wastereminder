import { createConnection } from 'typeorm';
import { AmzNCForainKeys } from './entity/AmzNCForainKeys';
import { AmazonUser, amzStartUp } from '../alexa-skill-user-manager/src';
import { NextcloudUser, ncStartUp } from '../nextcloud-oauth2-client/src';
import { NextcloudToken } from '../nextcloud-oauth2-client/src/entity/NextcloudToken';

ncStartUp().then(() => {
    amzStartUp().then(() => {
        createConnection('wastereminder').then(async connection => {
/*
            let incUser = new NextcloudUser('voc');
            let incToken = new NextcloudToken();
            incToken.accessToken = "Access Token";
            incToken.refreshToken = "Refresh Token";
            incToken.tokenType = 'Bearer';
            incToken.expiresIn = '3600';
            incUser.token = incToken;
            await NextcloudUser.save(incUser);
*/




            let key: AmzNCForainKeys = new AmzNCForainKeys();
            key.data = 3;

            let amzUser: AmazonUser = await AmazonUser.getUser('AmazonUser');
            key.amazonUser = amzUser;

            let ncUser: NextcloudUser = await NextcloudUser.getUser('voc');
            key.nectcloudUser = ncUser;

            connection.getRepository<AmzNCForainKeys>('AmzNCForainKeys').save(key)
                .then(user => console.log(user))
                .catch(reason => console.log(reason));
        });
    });
})
