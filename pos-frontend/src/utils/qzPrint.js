import qz from "qz-tray";

let connected = false;

const PRINTER_NAMES = [
    "EPSON TM-T82X-II Receipt",
    "TM-T82",
];

export const connectQZ = async () => {
    if (connected && qz.websocket.isActive()) return;

    await qz.websocket.connect();
    connected = true;
};


export const printReceipt = async (receipt) => {
    await connectQZ();

    const availablePrinters = await qz.printers.find();
    const printerName = PRINTER_NAMES.find((name) =>
        availablePrinters.includes(name)
    );

    if (!printerName) {
        throw new Error(
            `No supported receipt printer found. Available printers: ${availablePrinters.join(", ")}`
        );
    }

    const config = qz.configs.create(printerName);

    await qz.print(config, [{
        type: "raw",
        data: receipt,
    }]);
};