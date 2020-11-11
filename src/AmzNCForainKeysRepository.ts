import { EntityRepository, Repository } from 'typeorm';
import { AmzNCForainKeys } from './entity/AmzNCForainKeys';
import { NextcloudUser, NextcloudToken } from 'nextcloud-oauth2-client';
import { AmazonUser, AmazonApiEndpoint } from 'alexa-skill-user-manager';

@EntityRepository(AmzNCForainKeys)
export class AmzNCForainKeysRepository extends Repository<AmzNCForainKeys> {
    getAllWithSkillId(skillId: string): Promise<AmzNCForainKeys[]> {
        return this.createQueryBuilder('link')
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
                'link.amazonUser',
                AmazonUser, 'a',
                'link.amazonUserId = a.id'
            )
            .leftJoinAndMapOne(
                'a.amazonApiEndpoint',
                AmazonApiEndpoint, 'e',
                'e.applicationId = a.applicationId'
            )
            .where('a.applicationId = "' + skillId + '"')
            .getMany();
    }
}
