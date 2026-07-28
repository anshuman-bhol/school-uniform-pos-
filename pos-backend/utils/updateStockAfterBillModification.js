const updateStock = require("./updateStock");

const updateStockAfterBillModification = async (
    oldItems,
    newItems
) => {

    oldItems = oldItems.filter(
        item => item.itemType === "ReadyMade"
    );

    newItems = newItems.filter(
        item => item.itemType === "ReadyMade"
    );

    const oldMap = new Map();
    const newMap = new Map();

    oldItems.forEach(item => {
        const key = `${item.itemId}_${item.size}_${item.colour}`;
        oldMap.set(key, item);
    });

    newItems.forEach(item => {
        const key = `${item.itemId}_${item.size}_${item.colour}`;
        newMap.set(key, item);
    });

    const allKeys = new Set([
        ...oldMap.keys(),
        ...newMap.keys(),
    ]);

    for (const key of allKeys) {

        const oldItem = oldMap.get(key);
        const newItem = newMap.get(key);

        const oldQty = oldItem?.quantity || 0;
        const newQty = newItem?.quantity || 0;

        if (oldQty === newQty) {
            continue;
        }

        const item = oldItem || newItem;

        const difference = newQty - oldQty;

        if (difference > 0) {

            await updateStock({
                itemId: item.itemId,
                size: item.size,
                colour: item.colour,
                quantity: difference,
                operation: "sale",
                remarks: "Bill Modification",
            });

        } else {

            await updateStock({
                itemId: item.itemId,
                size: item.size,
                colour: item.colour,
                quantity: Math.abs(difference),
                operation: "return",
                remarks: "Bill Modification",
            });

        }

    }

};

module.exports = updateStockAfterBillModification;