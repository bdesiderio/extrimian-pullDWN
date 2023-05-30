// import { Agent, AgentModenaUniversalRegistry, AgentModenaUniversalResolver, CredentialFlow, DID, FileSystemAgentSecureStorage, FileSystemStorage, VerifiableCredential, WACICredentialOfferSucceded, WACIProtocol } from "@extrimian/agent";
import { DWNClient } from "@extrimian/dwn-client";
import { MemoryStorage } from "./models/memory-storage";

const index = async () => {
    const dwnClient = new DWNClient({
        did: "did:quarkid:starknet:EiCRug3zBbTGEO93MMywxUDg4EU9j9zJuW7xbxVmY__EHg",
        inboxURL: "https://dwn-ssi.buenosaires.gob.ar/",
        storage: new MemoryStorage(),
    });

    setInterval(async () => {
        const messages = await dwnClient.pullNewMessages();
        console.log(messages);
    }, 10000);
}

index();