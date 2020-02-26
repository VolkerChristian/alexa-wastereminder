//import "reflect-metadata";
require('reflect-metadata');
import {
    Entity,
    Index,
    PrimaryGeneratedColumn,
    JoinColumn,
    OneToOne,
    UpdateDateColumn,
    CreateDateColumn,
    VersionColumn,
    Column,
    getRepository
} from "typeorm";
import { AmazonUser } from '../../alexa-skill-user-manager/src';
import { NextcloudUser } from '../../nextcloud-oauth2-client/src';


@Entity()
export class AmzNCForainKeys {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => AmazonUser, {
        onDelete: 'CASCADE',
        cascade: ['insert', 'update']
    })
    @JoinColumn()
    @Index("AmazonUser-Idx")
    amazonUser: AmazonUser;

    @OneToOne(type => NextcloudUser, {
        onDelete: 'CASCADE',
        cascade: ['insert', 'update']
    })
    @JoinColumn()
    @Index("NextcloudUser-Idx")
    nextcloudUser: NextcloudUser;

    @UpdateDateColumn()
    changed: Date;

    @CreateDateColumn()
    created: Date;

    @VersionColumn()
    version: Number;
    
    static save(forainKeys: AmzNCForainKeys) {
        return new Promise<AmzNCForainKeys>((resolve, reject) => {
            getRepository<AmzNCForainKeys>('AmzNCForainKeys')
                .save(forainKeys)
                .then(forainKey => resolve(forainKey))
                .catch(reason => reject(reason));
        });
    }

    static delete(forainKey: AmzNCForainKeys) {
        return new Promise<AmzNCForainKeys>((resolve, reject) => {
            getRepository<AmzNCForainKeys>('AmzNCForainKeys')
                .remove(forainKey)
                .then(forainKey => resolve(forainKey))
                .catch(reason => reject(reason));
        });
    }
}
