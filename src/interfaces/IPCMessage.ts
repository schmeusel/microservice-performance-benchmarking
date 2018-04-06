import { IPCMessageType } from '.';

export default interface IPCMessage {
    type: IPCMessageType;
    data?: any;
};
