import type { DataConnection } from "peerjs";
import type { State } from "../core/types";

export type PushHandler = (data: State) => void;
export type ConnectionHandler = (peerId: string) => void;

export type ConnectionManager = {
	add: (peerId: string, connection: DataConnection) => void;
	get: (peerId: string) => DataConnection | undefined;
	getAll: () => DataConnection[];
	remove: (peerId: string) => void;
	clear: () => void;
	size: () => number;
};

export type NetworkProvider = {
	push: (data: State) => Promise<void>;
	init: (opts: {
		onPush: PushHandler;
		onConnection: ConnectionHandler;
		peerId: string;
	}) => () => void;
};

export type WebRTCNetworkProvider = NetworkProvider & {
	pushTo: (targetPeerId: string, data: State) => Promise<void>;
};
