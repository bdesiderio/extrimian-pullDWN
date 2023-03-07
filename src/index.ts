import { Agent, AgentModenaUniversalRegistry, AgentModenaUniversalResolver, CredentialFlow, DID, FileSystemAgentSecureStorage, FileSystemStorage, VerifiableCredential, WACICredentialOfferSucceded, WACIProtocol } from "@extrimian/agent";

const index = async () => {
    const issuerAgent = await getIssuerAgent();
 
    if (!issuerAgent.identity.getOperationalDID()) {
        await issuerAgent.identity.createNewDID({
            dwnUrl: "http://ssi.gcba-extrimian.com:1337",
        });

        const didCreatedIs = new Promise<DID>((resolver, reject) => {
            issuerAgent.identity.didCreated.on((args) => {
                resolver(args!.did!);
            });
        })

        const didIs2 = await didCreatedIs;
        console.log(didIs2);
    }

    const finish = new Promise<void>((resolve, reject) => {
        issuerAgent.vc.credentialIssued.on((args) => {
            console.log(args);
        });

        issuerAgent.vc.ackCompleted.on((args) => {
            console.log(args);
            resolve();
        });
    })

    const invMessage = await issuerAgent.vc.createInvitationMessage({ flow: CredentialFlow.Issuance });

    console.log(invMessage);

    await finish;
}

async function getIssuerAgent() {
    const waciProtocol = new WACIProtocol({
        issuer: {
            issueCredentials: async (waciInvitationId: string, holderId: string) => {
                return new WACICredentialOfferSucceded({
                    credentials: [{
                        credential: {
                            "@context": [
                                "https://www.w3.org/2018/credentials/v1",
                                "https://www.w3.org/2018/credentials/examples/v1",
                                "https://w3id.org/security/bbs/v1"
                            ],
                            id: "http://example.edu/credentials/58473",
                            type: [
                                "VerifiableCredential",
                                "AlumniCredential"
                            ],
                            issuer: "did:quarkid:matic:EiDs1liYifwFEg9l7rxrpR48MH-7Z-M2E32R1vEYThQWsQ",
                            issuanceDate: new Date(),
                            credentialSubject: {
                                id: "did:quarkid:matic:EiCG4tEWdX08DuGKM6rX-fUfHxmJ_N6SY8XqTI8QHfBgtQ",
                                givenName: "Jhon",
                                familyName: "Does"
                            }
                        },
                        outputDescriptor: {
                            id: "alumni_credential_output",
                            schema: "https://schema.org/EducationalOccupationalCredential",
                            display: {
                                title: {
                                    path: [
                                        "$.name",
                                        "$.vc.name"
                                    ],
                                    fallback: "Alumni Credential"
                                },
                                subtitle: {
                                    path: [
                                        "$.class",
                                        "$.vc.class"
                                    ],
                                    fallback: "Alumni"
                                },
                                description: {
                                    "text": "Credencial que permite validar que es alumno del establecimiento"
                                },
                            },
                            styles: {
                                background: {
                                    color: "#ff0000"
                                },
                                thumbnail: {
                                    uri: "https://dol.wa.com/logo.png",
                                    alt: "Universidad Nacional"
                                },
                                hero: {
                                    uri: "https://dol.wa.com/alumnos.png",
                                    alt: "Alumnos de la universidad"
                                },
                                text: {
                                    color: "#d4d400"
                                }
                            }
                        }
                    }],
                    issuer: {
                        name: "Universidad Nacional",
                        styles: {
                            thumbnail: {
                                uri: "https://dol.wa.com/logo.png",
                                alt: "Universidad Nacional"
                            },
                            hero: {
                                uri: "https://dol.wa.com/alumnos.png",
                                alt: "Alumnos de la universidad"
                            },
                            background: {
                                color: "#ff0000"
                            },
                            text: {
                                color: "#d4d400"
                            }
                        }
                    },
                    options: {
                        challenge: "508adef4-b8e0-4edf-a53d-a260371c1423",
                        domain: "9rf25a28rs96"
                    },
                });
            }
        },
        verifier: {
            presentationDefinition: async (invitationId: string) => {
                return {
                    frame: {
                        "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://www.w3.org/2018/credentials/examples/v1",
                            "https://w3id.org/security/bbs/v1"
                        ],
                        "type": [
                            "VerifiableCredential",
                            "AlumniCredential"
                        ],
                        "credentialSubject": {
                            "@explicit": true,
                            "type": [
                                "AlumniCredential"
                            ],
                            "givenName": {},
                            "familyName": {}
                        }
                    },
                    inputDescriptors: [
                        {
                            id: "Alumni Credential",
                            name: "AlumniCredential",
                            constraints: {
                                fields: [
                                    {
                                        path: [
                                            "$.credentialSubject.givenName"
                                        ],
                                        filter: {
                                            type: "string"
                                        }
                                    },
                                    {
                                        path: [
                                            "$.credentialSubject.familyName"
                                        ],
                                        filter: {
                                            type: "string"
                                        }
                                    }
                                ]
                            }
                        }
                    ],
                }
            }
        }
    });

    const registry2 = new AgentModenaUniversalRegistry("http://modena.gcba-extrimian.com:8080");

    registry2.setDefaultDIDMethod("did:quarkid:matic");

    const issuerAgent = new Agent({
        didDocumentRegistry: registry2,
        didDocumentResolver: new AgentModenaUniversalResolver("http://modena.gcba-extrimian.com:8080"),
        vcProtocols: [waciProtocol],
        secureStorage: new FileSystemAgentSecureStorage({
            filepath: "./issuer-secure.json"
        }),
        agentStorage: new FileSystemStorage({
            filepath: "./issuer-storage.json",
        })
    })

    await issuerAgent.initialize();

    return issuerAgent;
}

index();