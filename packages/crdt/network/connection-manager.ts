import type { DataConnection } from "peerjs";
import type { ConnectionManager } from "./types";

export const createConnectionManager = (): ConnectionManager => {
	const connections = new Map<string, DataConnection>();

	return {
		add: (peerId: string, connection: DataConnection) => {
			connections.set(peerId, connection);

			connection.addListener("close", () => {
				connections.delete(peerId);
			});
		},

		get: (peerId: string) => connections.get(peerId),

		getAll: () => Array.from(connections.values()),

		remove: (peerId: string) => {
			const connection = connections.get(peerId);
			if (connection) {
				connection.close();
				connections.delete(peerId);
			}
		},

		clear: () => {
			for (const connection of connections.values()) {
				connection.close();
			}
			connections.clear();
		},

		size: () => connections.size,
	};
};
