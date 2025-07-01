// priority: 0
global.coinMap = [
  { coin: "numismatics:sun", value: 4096 },
  { coin: "numismatics:crown", value: 512 },
  { coin: "numismatics:cog", value: 64 },
  { coin: "numismatics:sprocket", value: 16 },
  { coin: "numismatics:bevel", value: 8 },
  { coin: "numismatics:spur", value: 1 },
];

global.formatPrice = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Ores
global.ore = [
  { item: "minecraft:raw_copper", value: 4 },
  { item: "minecraft:raw_copper_block", value: 36 },
  { item: "minecraft:raw_iron", value: 8 },
  { item: "minecraft:raw_iron_block", value: 72 },
  { item: "minecraft:coal", value: 8 },
  { item: "minecraft:coal_block", value: 72 },
  { item: "minecraft:raw_gold", value: 16 },
  { item: "minecraft:raw_gold_block", value: 144 },
  { item: "create:raw_zinc", value: 8 },
  { item: "create:raw_zinc_block", value: 72 },
  { item: "minecraft:redstone", value: 8 },
  { item: "minecraft:redstone_block", value: 72 },
  { item: "minecraft:lapis_lazuli", value: 6 },
  { item: "minecraft:lapis_block", value: 64 },
  { item: "minecraft:emerald", value: 32 },
  { item: "minecraft:emerald_block", value: 288 },
  { item: "minecraft:amethyst_shard", value: 8 },
  { item: "minecraft:amethyst_block", value: 32 },
  { item: "minecraft:quartz", value: 8 },
  { item: "minecraft:quartz_block", value: 32 },
  { item: "minecraft:diamond", value: 256 },
  { item: "minecraft:diamond_block", value: 2304 },
  { item: "minecraft:netherite_scrap", value: 1024 },
];

// Crops
global.crops = [
  { item: "minecraft:sweet_berries", value: 2 },
  { item: "minecraft:melon", value: 81 },
  { item: "minecraft:cocoa_beans", value: 4 },
  { item: "minecraft:carrot", value: 23 },
  { item: "minecraft:potato", value: 24 },
  { item: "minecraft:poisonous_potato", value: 4 },
  { item: "minecraft:beetroot", value: 24 },
  { item: "minecraft:apple", value: 8 },
  { item: "minecraft:red_mushroom", value: 8 },
  { item: "minecraft:brown_mushroom", value: 8 },
  { item: "minecraft:crimson_fungus", value: 16 },
  { item: "minecraft:warped_fungus", value: 16 },
  { item: "minecraft:bamboo_block", value: 9 },
  { item: "minecraft:cactus", value: 12 },
  { item: "minecraft:wheat", value: 46 },
  { item: "minecraft:hay_block", value: 414 },
  { item: "minecraft:sugar_cane", value: 12 },
  { item: "minecraft:pumpkin", value: 80 },
  { item: "minecraft:chorus_fruit", value: 16 },
  { item: "minecraft:glow_berries", value: 24 },
  { item: "minecraft:torchflower", value: 128 },
  { item: "minecraft:pitcher_plant", value: 64 },
];

global.trades = new Map();
global.ore.forEach((oreItem) => {
  const { item, value } = oreItem;
  global.trades.set(item, {
    value: value,
    multiplier: "shippingbin:gem_sell_multiplier",
  });
});
global.crops.forEach((crop) => {
  const { item, value } = crop;
  global.trades.set(item, {
    value: value,
    multiplier: "shippingbin:crop_sell_multiplier",
  });
});