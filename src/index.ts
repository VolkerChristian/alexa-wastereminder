import 'reflect-metadata';
import express, { Router, Request, Response, RequestHandler } from 'express';
import { createConnection, getCustomRepository } from 'typeorm';
import { skill } from './lambda';
import { ExpressAdapter } from 'ask-sdk-express-adapter';
import { AmzNCForainKeys } from './entity/AmzNCForainKeys';
import { AmzNCForainKeysRepository } from './AmzNCForainKeysRepository';
import { router, getEntities as getNextcloudUserEntities, setConnection as nextcloudSetConnection, setNextcloudConfig } from 'nextcloud-oauth2-client';
import { getEntities as getAmazonUserManagerEntities, setConnection as amazonSetConnection, setOAuth2Config } from 'alexa-skill-user-manager';
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

import { aptOAuth2Config } from '../amzconfig.json';
setOAuth2Config(aptOAuth2Config);

import nextcloudConfig from '../ncconfig.json';
setNextcloudConfig(nextcloudConfig);

const paeSend = async (amzNCForainKeys: AmzNCForainKeys) => {
    let expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 23);

    const event: services.proactiveEvents.Event = {
        name: 'AMAZON.TrashCollectionAlert.Activated',
        payload: {
            alert: {
                garbageTypes: ['LANDFILL', 'RECYCLABLE_PLASTICS', 'WASTE_PAPER'],
                collectionDayOfWeek: 'TUESDAY'
            }
        }
    }

    const relevantAudience: services.proactiveEvents.RelevantAudience = {
        type: 'Unicast',
        payload: {
            user: amzNCForainKeys.amazonUser.userId
        }
    }

    const proactiveEventRequest: services.proactiveEvents.CreateProactiveEventRequest = {
        event: event,
        timestamp: new Date().toISOString(),
        referenceId: 'wastecalendar-event-' + Date.now(),
        expiryTime: expiryTime.toISOString(),
        localizedAttributes: [],
        relevantAudience: relevantAudience
    }

    let result: services.ApiResponse;

    //console.log(JSON.stringify(proactiveEventRequest, null, 4));

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
    try {
        result = await pesc.callCreateProactiveEvent(proactiveEventRequest, 'DEVELOPMENT');
    } catch (error) {
        console.log("Error: " + error);
    }
    console.log("Status Code: " + JSON.stringify(result.statusCode, null, 4));
}


const paeProcess: RequestHandler = (req: Request, res: Response) => {
    const skillId = "amzn1.ask.skill.5119403b-f6c6-45f8-bd7e-87787e6f5da2";

    let str: string = "";

    getCustomRepository(AmzNCForainKeysRepository)
        .getAllForSkillId(skillId)
        .then((values: AmzNCForainKeys[]) => {
            values.forEach((value: AmzNCForainKeys) => {
                str += "==============================\n"
                str += JSON.stringify(value, null, 4) + "\n";
                str += "==============================\n";
                paeSend(value);
            });
            res.send(str);
        })
        .catch(reason => {
            res.status(500).send(reason);
        });
}


const paeRouter = Router();
paeRouter.get('/', paeProcess);


getNextcloudUserEntities();


async function connect() {
    let connection = await createConnection({
        type: "mysql",
        host: "proliant.home.vchrist.at",
        port: 3306,
        username: "wastereminder",
        password: "!!!SoMaSi01!!!",
        database: "WasteReminder",
        synchronize: true,
        logging: false,
        entities: Array().concat(getAmazonUserManagerEntities(), getNextcloudUserEntities(), [AmzNCForainKeys])
    });

    return connection;
}



connect()
    .then(connection => {
        nextcloudSetConnection(connection);
        amazonSetConnection(connection);
        const app = express();

        app.use('/', router);

        app.post('/wastereminder/handler', new ExpressAdapter(skill, true, true).getRequestHandlers());

        app.use('/wastereminder/pae', paeRouter);

        app.listen(8080, () => {
            console.log("Wastereinder listening on 8080");
        });
    })
    .catch(reason => console.error(reason));
