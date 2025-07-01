ItemEvents.tooltip((tooltip) => {
  // Quality food compat optional
  const formatNumber = (number, quality) => {
    let value;
    if (quality) {
      if (quality == 1.0) value = Math.round(number * 1.25);
      if (quality == 2.0) value = Math.round(number * 1.5);
      if (quality == 3.0) value = Math.round(number * 2);
    } else {
      value = number;
    }
    return global.formatPrice(value);
  };
  // Maps to the values in global.coinMap. This could be done in a way that you don't have to have them defined in both places but I can't be bothered
  const calculateCost = (coin, count, stackSize) => {
    let value = 0;
    switch (coin) {
      case "spur":
        value = 1;
        break;
      case "bevel":
        value = 8;
        break;
      case "sprocket":
        value = 16;
        break;
      case "cog":
        value = 64;
        break;
      case "crown":
        value = 512;
        break;
      case "sun":
        value = 4096;
        break;
      default:
        console.log(`Invalid coin`);
    }
    return formatNumber(value * count * (stackSize || 1));
  };
  // This mapping is specific to Sunlit Valley and should be changed if your attributes map to different things
  const getAttributeStr = (attribute) => {
    switch (attribute) {
      case "crop":
        return "Farmer product";
      case "wood":
        return "Artisan product";
      case "gem":
        return "Geologist product";
      case "meat":
        return "Adventurer product";
      default:
        console.log(`Invalid attribute`);
    }
  };
  const coinTooltips = [
    "numismatics:spur",
    "numismatics:bevel",
    "numismatics:sprocket",
    "numismatics:cog",
    "numismatics:crown",
    "numismatics:sun"
  ];
  coinTooltips.forEach((coin) => {
    tooltip.addAdvanced(coin, (item, advanced, text) => {
      if (tooltip.shift) {
        text.add(1, [
          Text.white(`${calculateCost(coin.split(":")[1], 1, item.count)} 🪙`),
          Text.gray(" Stack value"),
        ]);
      } else {
        text.add(1, [
          Text.white(`${calculateCost(coin.split(":")[1], 1, 1)} 🪙`),
          Text.darkGray(" Hold ["),
          Text.gray("Shift"),
          Text.darkGray("]"),
        ]);
      }
    });
  });
  // Prices
  const addPriceTooltip = (sellable, attribute) => {
    let value = sellable.value;
    tooltip.addAdvanced(sellable.item, (item, advanced, text) => {
      let quality;
      if (item.nbt && item.nbt.quality_food) {
        quality = item.nbt.quality_food.quality;
      }
      if (tooltip.shift) {
        text.add(1, [
          Text.white(`${formatNumber(value * item.count, quality)} 🪙`),
          Text.gray(" Stack value"),
        ]);
        text.add(2, [Text.gold(getAttributeStr(attribute))]);
      } else {
        text.add(1, [
          Text.white(`${formatNumber(value, quality)} 🪙`),
          Text.darkGray(" Hold ["),
          Text.gray("Shift"),
          Text.darkGray("]"),
        ]);
      }
    });
  };
  global.ore.forEach((item) => {
    addPriceTooltip(item, "gem");
  });
  global.crops.forEach((item) => {
    addPriceTooltip(item, "crop");
  });
});
