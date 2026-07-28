import qz from "qz-tray";

let connected = false;

export const connectQZ = async () => {
    if (connected && qz.websocket.isActive()) return;

    await qz.websocket.connect();
    connected = true;
};


export const printReceipt = async (receipt) => {
    await connectQZ();

    const config = qz.configs.create("EPSON TM-T82X-II Receipt");

    await qz.print(config, [{
        type: "raw",
        data: receipt,
    }]);
};