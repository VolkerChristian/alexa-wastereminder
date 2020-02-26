import { createConnection, getRepository } from 'typeorm';
import { AmzNCForainKeys } from './entity/AmzNCForainKeys';
import { AmazonUser, AmazonApiEndpoint, getApiToken, getAmazonUserRepository } from 'alexa-skill-user-manager';
import { NextcloudUser, NextcloudToken, getNextcloudUserRepository } from 'nextcloud-oauth2-client';
import util from 'util';


const a = () => {
    createConnection().then(async () => {

        let key: AmzNCForainKeys = new AmzNCForainKeys();
        //        key.data = 3;

        let amzUser: AmazonUser = await getAmazonUserRepository().getUser('AmazonUser');
        key.amazonUser = amzUser;

        let ncUser: NextcloudUser = await getNextcloudUserRepository().getUser('voc');
        key.nextcloudUser = ncUser;

        getRepository<AmzNCForainKeys>('AmzNCForainKeys')
            .save(key)
            .then(user => console.log(user))
            .catch(reason => console.log(reason));
    });
}

const b = (ncUserName: string, skillId: string) => {
    createConnection()
        .then(connection => {
            getApiToken(skillId)
                .then(token => console.log(util.inspect(token)))
                .catch(reason => console.log(reason));


            getRepository<AmzNCForainKeys>('AmzNCForainKeys')
                .createQueryBuilder('link')
                .innerJoinAndMapOne(
                    'link.nextcloudUser',
                    NextcloudUser, 'n',
                    'link.nextcloudUserId = n.id'
                )
                .leftJoinAndMapOne(
                    'n.token',
                    NextcloudToken, 't',
                    'n.id = t.userId'

                )
                .innerJoinAndMapOne(
                    'link.ammazonUser',
                    AmazonUser, 'a',
                    'link.amazonUserId = a.id'
                )
                .leftJoinAndMapOne(
                    'a.amazonApiEndpoint',
                    AmazonApiEndpoint, 'e',
                    'e.applicationId = a.applicationId'
                )
                .where('a.applicationId = "' + skillId + '"')
                .getMany()
                .then((values: AmzNCForainKeys[]) => {
                    values.forEach((value: AmzNCForainKeys) => {
                        console.log("=============================");
                        console.log(JSON.stringify(value, null, 4));
                        console.log("=============================");
                    });
                });


            /*
                        getRepository<AmazonUser>('AmazonUser')
                            .createQueryBuilder('a')
                            .innerJoin(
                                AmzNCForainKeys, 'an',
                                'a.id = an.amazonUserId'
                            )
                            .innerJoin(
                                NextcloudUser, 'n',
                                'an.nextcloudUserId = n.id'
                            )
                            .leftJoin(
                                AmazonApiEndpoint, 'e',
                                'e.applicationId = a.applicationId'
                            )
                            .select('a.UserId', 'userId')
                            .addSelect('e.apiAccessToken', 'accessToken')
                            .addSelect('n.userName', 'userName')
                            .where('n.userName = "' + ncUserName + '"')
                            .andWhere('a.applicationId = "' + skillId + '"')
                            .getRawOne()
                            .then(result => console.log(JSON.stringify(result)))
                            .catch(reason => console.log(reason));
            */
        })
        .catch(reason => {
            console.log(reason);
        })
}

b('voc', 'amzn1.ask.skill.5119403b-f6c6-45f8-bd7e-87787e6f5da2');

/*
const c = () => {
    createConnection()
        .then(connection => {
            connection
                getRepository<AmazonUser>('AmazonUser')
                .createQueryBuilder('a')
                .innerJoin(
                    AmzNCForainKeys, 'an',
                    'a.id = an.amazonUserId'
                )
                .innerJoin(
                    NextcloudUser, 'n',
                    'an.nectcloudUserId = n.id'
                )
                .innerJoin(
                    AmazonApiEndpoint, 'e',
                    'e.applicationId = a.applicationId'
                )
                .select('a.UserId')
                .addSelect(['e.apiAccessToken', 'n.userName'])
                .getRawMany()
                .then(result => console.log(result))
                .catch(reason => console.log(reason));
        })
}

c();*/


/*
SELECT a.*, n.*, e.*
    FROM amazon_user as a
INNER JOIN amz_nc_forain_keys AS an ON a.id = an.amazonUserId
INNER JOIN nextcloud_user AS n ON an.nectcloudUserId = n.id
INNER JOIN amazon_api_endpoint AS e ON e.applicationId = a.applicationId
WHERE n.userName = 'voc'
*/