import 'reflect-metadata';
import express, { Router, Request, Response, RequestHandler } from 'express';
import { createConnection, getRepository } from 'typeorm';
import { router, NextcloudUser } from '../nextcloud-oauth2-client/src';
import { skill } from './lambda';
import { ExpressAdapter } from 'ask-sdk-express-adapter';
import { AmzNCForainKeys } from './entity/AmzNCForainKeys';
import { NextcloudToken } from '../nextcloud-oauth2-client/src/entity/NextcloudToken';
import { AmazonUser, AmazonApiEndpoint } from '../alexa-skill-user-manager/src';
import {
    getRequestType,
    getIntentName,
    getUserId,
    ErrorHandler,
    HandlerInput,
    RequestHandler as AskRequestHandler,
    SkillBuilders,
    getAccountLinkingAccessToken,
    getApiAccessToken,
    getDeviceId,
    getDialogState,
    getSlot,
    getSlotValue,
    getSupportedInterfaces,
    getLocale,
    getViewportDpiGroup,
    getViewportOrientation,
    getViewportProfile,
    getViewportSizeGroup,
    DefaultApiClient
} from 'ask-sdk-core';
import {
    services
} from 'ask-sdk-model';


const paeSend = async (amzNCForainKeys: AmzNCForainKeys) => {

    let expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 23);
    
    const proactiveEventRequest: services.proactiveEvents.CreateProactiveEventRequest = {
        event: {
            name: 'AMAZON.TrashCollectionAlert.Activated',
            payload: {
                alert: {
                    garbageTypes: ['LANDFILL', 'RECYCLABLE_PLASTICS', 'WASTE_PAPER'],
                    collectionDayOfWeek: 'TUESDAY'
                }
            }
        },
        timestamp: new Date().toISOString(),
        referenceId: 'wastecalendar-event-' + Date.now(),
        expiryTime: expiryTime.toISOString(),
        localizedAttributes: [],
        relevantAudience: {
            type: 'Unicast',
            payload: {
                user: amzNCForainKeys.amazonUser.userId
            }
        }
    }

    let result;

    try {
        console.log(JSON.stringify(proactiveEventRequest, null, 4));

        const apiConfiguration: services.ApiConfiguration = {
            apiClient: new DefaultApiClient(),
            apiEndpoint: amzNCForainKeys.amazonUser.apiEndpoint,
            authorizationValue: 'Bearer ' + amzNCForainKeys.amazonUser.amazonApiEndpoint.apiAccessToken
        };

        const authenticationConfiguration: services.AuthenticationConfiguration = {
            clientId: 'amzn1.application-oa2-client.c1494a447d77405883037efdc06baad6',
            clientSecret: '07c7affba53c9d2632186cff30c678d5ed243efc6140436c533f2eac32e8dd11'
        };

        var pesc = new services.proactiveEvents.ProactiveEventsServiceClient(apiConfiguration, authenticationConfiguration);
        result = await pesc.callCreateProactiveEvent(proactiveEventRequest, 'DEVELOPMENT');
    } catch (error) {
        console.log("Error: " + error);
    }
    console.log("-------- " + JSON.stringify(result, null, 4));
}


const paeProcess: RequestHandler = (req: Request, res: Response) => {
    const skillId = "amzn1.ask.skill.5119403b-f6c6-45f8-bd7e-87787e6f5da2";

    let str: string;

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
        .getMany()
        .then((values: AmzNCForainKeys[]) => {
            values.forEach((value: AmzNCForainKeys) => {
                str += "==============================\n"
                str += JSON.stringify(value, null, 4) + "\n";
                str += "==============================\n";

                console.log("=============================");
//                console.log(JSON.stringify(value, null, 4));
                console.log("=============================");

                paeSend(value);
            });
            res.send(str);
        });
}


const paeRouter = Router();
paeRouter.get('/', paeProcess);


createConnection()
    .then(() => {
        const app = express();

        app.use('/', router);

        app.post('/wastereminder/handler', new ExpressAdapter(skill, true, true).getRequestHandlers());

        app.use('/wastereminder/pae', paeRouter);

        app.listen(8080, () => {
            console.log("Wastereinder listening on 8080");
        });
    })
    .catch(reason => console.error(reason));
