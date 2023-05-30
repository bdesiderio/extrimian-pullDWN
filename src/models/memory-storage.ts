import { DWNMessage, MessageStorage } from "@extrimian/dwn-client";

export class MemoryStorage implements MessageStorage {
    mapper: DWNMessage[]= new Array<DWNMessage>();
    lastPullDate?: Date;
    
    async saveMessages(messages: DWNMessage[]): Promise<void> {
        this.mapper.push(...messages);
    }
    
    async getMessages(): Promise<DWNMessage[]> {
        return this.mapper;
    }
    
    async getLastPullDate(): Promise<Date> {
        return this.lastPullDate || new Date();
    }

    async updateLastPullDate(date: Date): Promise<void> {
        this.lastPullDate = date;
    }
}