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
import { AmazonUser } from 'alexa-skill-user-manager';
import { NextcloudUser } from 'nextcloud-oauth2-client';


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
}
