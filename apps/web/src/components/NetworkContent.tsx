import { PlusIcon } from "@heroicons/react/24/outline";
import { getDeviceId } from "../collections/entries";
import { Button } from "./Button";
import { useConnections } from "./Connections";

export const NetworkContent = () => {
	const { connections } = useConnections();

	const handleLink = () => {
		const peerId = prompt("Enter the ID of the device you want to connect to");
		console.log("Link to peer ID:", peerId);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 rounded-xl bg-card p-2">
				<div className="flex items-center justify-between">
					<h2 className="p-2 font-semibold">Connections</h2>
					<Button variant="ghost" onClick={handleLink}>
						<PlusIcon />
					</Button>
				</div>
				<div className="space-y-1">
					{connections.length === 0 && (
						<div className="p-2 text-muted-foreground">No connections yet.</div>
					)}
					{connections.map((connection) => (
						<div
							key={connection}
							className="flex items-center justify-between p-2"
						>
							<span className="font-medium">{connection}</span>
						</div>
					))}
				</div>
			</div>
			<div className="flex flex-col gap-4 rounded-xl bg-card p-4">
				<p className="text-center text-muted-foreground text-sm">
					To connect to this device, enter the ID found below.
				</p>
				<p className="select-text text-center text-muted-foreground text-xs">
					{getDeviceId()}
				</p>
			</div>
		</div>
	);
};
