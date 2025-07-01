BlockEvents.rightClicked("kubejs:basic_shipping_bin", (e) => {
  const { player, server } = e;
  server.runCommandSilent(
    `playsound shippingbin:block.shippingbin.open block @a ${player.x} ${player.y} ${player.z}`
  );
});

// Ties shipping bin to player
BlockEvents.placed("kubejs:basic_shipping_bin", (e) => {
  const playerUUID = e.player.getUuid().toString();
  let nbt = e.block.entityData;
  nbt.merge({ data: { owner: playerUUID } });
  e.block.setEntityData(nbt);
});

const shippingBinThrottle = ((temp) => (entity, tick, identifier) => {
  const { age, uuid } = entity;
  const key = `${uuid}${identifier}`;
  const now = temp[key];
  if (!now || age - now >= tick) {
    temp[key] = age;
    return false;
  }
  return true;
})({});

BlockEvents.leftClicked("kubejs:basic_shipping_bin", (e) => {
  const { player, block, level } = e;
  let binPlayer;
  let playerAttributes;
  if (shippingBinThrottle(player, 30, "shipping-bin-throttle")) return;
  level.players.forEach((p) => {
    if (p.getUuid().toString() === block.getEntityData().data.owner) {
      playerAttributes = p.nbt.Attributes;
      binPlayer = p;
    }
  });
  if (playerAttributes) {
    // This mapping is specific to Sunlit Valley and should be changed if your attributes map to different things
    let crop = playerAttributes.filter((obj) => {
      return obj.Name === "shippingbin:crop_sell_multiplier";
    });
    let gem = playerAttributes.filter((obj) => {
      return obj.Name === "shippingbin:gem_sell_multiplier";
    });
    let artisan = playerAttributes.filter((obj) => {
      return obj.Name === "shippingbin:wood_sell_multiplier";
    });
    let adventurer = playerAttributes.filter((obj) => {
      return obj.Name === "shippingbin:meat_sell_multiplier";
    });
    if (binPlayer) {
      player.tell(`§6${binPlayer.username}'s§7 Shipping Bin`);
      player.tell(" §7Current sell multipliers:");
      player.tell(`Farmer products: §ax${crop[0] ? crop[0].Base : 1}`);
      player.tell(`Artisan products: §ax${artisan[0] ? artisan[0].Base : 1}`);
      player.tell(`Geologist products: §ax${gem[0] ? gem[0].Base : 1}`);
      player.tell(`Adventurer products: §ax${adventurer[0] ? adventurer[0].Base : 1}`);
    }
  } else {
    player.tell(
      Text.gray("This is a stranger's Shipping Bin. They aren't online to draw stats from...")
    );
  }
});
