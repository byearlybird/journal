import Peer, { type DataConnection } from "peerjs";
import type { State } from "../core/types";
import { createConnectionManager } from "./connection-manager";
import type {
	ConnectionHandler,
	PushHandler,
	WebRTCNetworkProvider,
} from "./types";

type PeerJSAdapterOptions = {
	peerId: string;
	peerFactory?: (id: string) => Peer;
};

type Message = {
	type: "push";
	data: State;
};

const message = <T extends Message["type"]>(
	type: T,
	data: Extract<Message, { type: T }>["data"],
): Extract<Message, { type: T }> =>
	({ type, data }) as Extract<Message, { type: T }>;

const initializePeer = (
	peerFactory: (id: string) => Peer,
	peerId: string,
	{
		onPush,
		onConnection,
	}: { onPush: PushHandler; onConnection: (conn: DataConnection) => void },
): Peer => {
	const peer = peerFactory(peerId);
	peer.on("connection", (conn) => {
		conn.addListener("data", (data) => {
			const msg = data as Message;
			if (msg && msg.type === "push") {
				onPush(msg.data);
			}
		});

		onConnection(conn);
	});
	return peer;
};

export const createPeerJsAdapter = ({
	peerId,
	peerFactory = (id: string) => new Peer(id),
}: PeerJSAdapterOptions): WebRTCNetworkProvider => {
	let peer: Peer | null = null;
	const connectionManager = createConnectionManager();

	const push = async (data: State) => {
		for (const conn of connectionManager.getAll()) {
			conn.send(message("push", data));
		}
	};

	const pushTo = async (targetPeerId: string, data: State) => {
		const conn = connectionManager.get(targetPeerId);
		if (conn) {
			conn.send(message("push", data));
		} else {
			console.warn(`No connection to peer ${targetPeerId}`);
		}
	};

	const init = ({
		onPush,
		onConnection,
	}: {
		onPush: PushHandler;
		onConnection: ConnectionHandler;
	}) => {
		if (peer) {
			throw new Error("PeerJSAdapter is already initialized");
		}

		peer = initializePeer(peerFactory, peerId, {
			onPush,
			onConnection: (conn: DataConnection) => {
				connectionManager.add(conn.peer, conn);
				onConnection(conn.peer);
			},
		});

		return () => {
			connectionManager.clear();
			peer?.destroy();
			peer = null;
		};
	};

	return {
		push,
		pushTo,
		init,
	};
};
