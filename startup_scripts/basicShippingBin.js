// priority: 1
const debug = false;

const calculateSlotsNeeded = (coins) => {
  let slots = 0;
  coins.forEach((coinObj) => {
    let { count } = coinObj;
    for (let index = 0; index <= count; index += 64) {
      slots++;
    }
  });
  return slots;
};

// Returns array of coins from price, prioritizing high value coins
const calculateCoinsFromValue = (price, output, coinMap) => {
  const resolvedCoinMap = coinMap || global.coinMap;

  for (let i = 0; i < resolvedCoinMap.length; i++) {
    let { coin, value } = resolvedCoinMap[i];
    if (value <= price) {
      if (price % value === 0) {
        output.push({ coin: coin, count: price / value });
        return output;
      } else {
        output.push({ coin: coin, count: Math.floor(price / value) });
        calculateCoinsFromValue(price % value, output, resolvedCoinMap);
      }
      return output;
    }
  }
};

// Only relevant when quality food mod installed, doesn't break anything when it's not
const calculateQualityValue = (number, quality) => {
  let value;
  if (quality) {
    if (quality == 1.0) value = Math.round(number * 1.25);
    if (quality == 2.0) value = Math.round(number * 1.5);
    if (quality == 3.0) value = Math.round(number * 2);
  } else {
    value = number;
  }
  return value;
};

global.processShippingBinInventory = (inventory, inventorySlots, attributes, returnRemoved) => {
  let calculatedValue = 0;
  let removedItems = [];
  let slotItem;
  let isSellable;
  for (let i = 0; i < inventorySlots; i++) {
    slotItem = inventory.getStackInSlot(i).item;
    isSellable =
      global.trades.has(String(slotItem.id)) ||
      ["splendid_slimes:plort", "splendid_slimes:slime_heart"].includes(slotItem.id);
    if (isSellable) {
      let trade = global.trades.get(String(slotItem.id));
      let quality;
      let slotNbt;
      if (inventory.getStackInSlot(i).hasNBT()) {
        slotNbt = inventory.getStackInSlot(i).nbt;
      }
      // Splendid Slimes compat,  doesn't break anything when it's not installed
      if (slotNbt && ((slotNbt.slime && slotNbt.slime.id) || (slotNbt.plort && slotNbt.plort.id))) {
        if (slotNbt.slime) trade = global.trades.get(`${slotItem.id}/${slotNbt.slime.id}`);
        if (slotNbt.plort) trade = global.trades.get(`${slotItem.id}/${slotNbt.plort.id}`);
      }

      if (slotNbt && slotNbt.quality_food) {
        quality = slotNbt.quality_food.quality;
      }
      calculatedValue +=
        calculateQualityValue(trade.value, quality) *
        inventory.getStackInSlot(i).count *
        (Number(
          attributes.filter((obj) => {
            return obj.Name === trade.multiplier;
          })[0]?.Base
        ) || 1);
    }
    if (isSellable) {
      if (returnRemoved) removedItems.push(i);
      else inventory.setStackInSlot(i, "minecraft:air");
    }
  }
  return { calculatedValue: calculatedValue, removedItems: removedItems };
};

StartupEvents.registry("block", (event) => {
  // Make sure you remove/hide the old shipping bin so players don't get confused! 
  event
    .create("kubejs:basic_shipping_bin", "cardinal")
    .tagBlock("minecraft:mineable/axe")
    .item((item) => {
      item.tooltip(Text.gray("Sells items every morning and leaves coins in its inventory"));
      item.modelJson({
        parent: "shippingbin:block/shipping_bin",
      });
    })
    .model("shippingbin:block/shipping_bin")
    .blockEntity((blockInfo) => {
      blockInfo.inventory(9, 4);
      blockInfo.initialData({ owner: "-1" });
      blockInfo.serverTick(10, 0, (entity) => {
        const { inventory, level, block } = entity;
        let dayTime = level.dayTime();
        let morningModulo = dayTime % 24000;
        if (morningModulo >= 5 && morningModulo < 15) {
          let slots = inventory.getSlots();
          let value = 0;
          let playerAttributes;
          let binPlayer;
          let binPlayerUUID;
          let removedSlots = [];
          let calculationResults;
          // This only lets the shipping bin sell when the player is online. If this isn't here, it won't take into account bonuses from attributes
          level.players.forEach((p) => {
            if (p.getUuid().toString() === block.getEntityData().data.owner) {
              playerAttributes = p.nbt.Attributes;
              binPlayer = p;
              binPlayerUUID = binPlayer.getUuid().toString();
            }
          });
          if (playerAttributes) {
            calculationResults = global.processShippingBinInventory(
              inventory,
              slots,
              playerAttributes,
              true
            );
            value = Math.round(calculationResults.calculatedValue);
            removedSlots = calculationResults.removedItems;
            if (value > 0) {
              let outputs = calculateCoinsFromValue(value, [], global.coinMap);
              if (!outputs) outputs = [];

              if (debug) {
                console.log(`slots: ${slots}`);
                console.log(`countNonEmpty: ${inventory.countNonEmpty()}`);
                console.log(`RemovedSlots: ${removedSlots.length}`);
                console.log(`calculateSlotsNeeded: ${calculateSlotsNeeded(outputs)}`);
              }
              if (
                slots -
                  inventory.countNonEmpty() +
                  removedSlots.length -
                  calculateSlotsNeeded(outputs) >=
                0
              ) {
                binPlayer.server.runCommandSilent(
                  `playsound minecraft:entity.experience_orb.pickup block @a ${binPlayer.x} ${binPlayer.y} ${binPlayer.z} 0.3`
                );
                // If using immersive messages, remove //
                // binPlayer.server.runCommandSilent(
                //   `immersivemessages sendcustom ${
                //     binPlayer.username
                //   } {anchor:7,background:1,color:"#FFAA00",size:1,y:30,slideleft:1,slideoutleft:1,typewriter:1} 8 🪙 ${global.formatPrice(value)} §7worth of goods sold`
                // );
                binPlayer.tell(
                  Text.gold(
                    `🪙 ${global.formatPrice(value)} §7worth of goods sold`
                  )
                );
                for (let i = 0; i < removedSlots.length; i++) {
                  inventory.setStackInSlot(removedSlots[i], "minecraft:air");
                }
                outputs.forEach((output) => {
                  let { coin, count } = output;
                  for (let index = 0; index <= count; index += 64) {
                    let difference = count - index;
                    for (let i = 0; i < slots; i++) {
                      if (inventory.getStackInSlot(i).item.id === "minecraft:air") {
                        inventory.setStackInSlot(
                          i,
                          Item.of(`${difference > 64 ? 64 : difference}x ${coin}`)
                        );
                        break;
                      }
                    }
                  }
                });
              } else {
                // Replace sound with av
                binPlayer.server.runCommandSilent(
                  `playsound minecraft:block.anvil.land block @a ${binPlayer.x} ${binPlayer.y} ${binPlayer.z} 0.3`
                );
                // If using immersive messages, remove //
                // binPlayer.server.runCommandSilent(
                //   `immersivemessages sendcustom ${binPlayer.username} {anchor:7,background:1,color:"#FF5555",size:1,y:24,slideleft:1,slideoutleft:1,typewriter:1} 8 🪙 Your Basic Shipping Bin was too full to sell...`
                // );
                binPlayer.tell(Text.red("Your Basic Shipping Bin was too full to sell..."));
              }
            }
          }
        }
      }),
        blockInfo.rightClickOpensInventory();
      blockInfo.attachCapability(
        CapabilityBuilder.ITEM.blockEntity()
          .insertItem((blockEntity, slot, stack, simulate) =>
            blockEntity.inventory.insertItem(slot, stack, simulate)
          )
          .extractItem((blockEntity, slot, stack, simulate) =>
            blockEntity.inventory.extractItem(slot, stack, simulate)
          )
          .getSlotLimit((blockEntity, slot) => blockEntity.inventory.getSlotLimit(slot))
          .getSlots((blockEntity) => blockEntity.inventory.slots)
          .getStackInSlot((blockEntity, slot) => blockEntity.inventory.getStackInSlot(slot))
      );
    });
});
