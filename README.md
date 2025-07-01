# Chakyl's Custom Shipping Bin
A custom shipping bin implementation written using Kubejs for Minecraft Modpacks.

One of the more annoying parts of making a commerce modpack pack is actually selling the items. There are a bunch of different mod solutions and they all have their own flaws so I wrote a custom solution for [Society: Sunlit Valley](https://www.curseforge.com/minecraft/modpacks/society-sunlit-valley). The code isn't perfect but it's been stress-tested and stable!

## Features:
- Made for Minecraft 1.20.1 Forge
- Define values for all the items in one convenient place
- Shipping bin sells items at 6am (tick 0) every day
- Totals the entire inventory of the bin and outputs the highest value coin it can
- Supports the Shipping Bin mod's attribute system so you can do things like make crops sell for 2x more with things like skills
- Items with a sell value will automatically have tooltips. You can hold shift while hovering to auto-calculate the entire stack size

## Dependencies
- [Kubejs](https://www.curseforge.com/minecraft/mc-mods/kubejs) - **Required**
- [PowerfulJS](https://www.curseforge.com/minecraft/mc-mods/powerfuljs) - **Required**
- [Shipping Bin](https://www.curseforge.com/minecraft/mc-mods/shipping-bin) - For assets/sounds/attributes. Can also be replaced if you substitute it with your own. You'll need to hide/remove the recipe for the existing shipping bin in this mod.
- [Create: Numismatics](https://www.curseforge.com/minecraft/mc-mods/numismatics) - Unless you replace numismatics coins with your own custom coins. (Will need to change it in [`globalValues.js`](https://github.com/Chakyl/chakyl-custom-shipping-bin/blob/main/kubejs/startup_scripts/globalValues.js) and [`valueTooltips.js`](https://github.com/Chakyl/chakyl-custom-shipping-bin/blob/main/kubejs/client_scripts/valueTooltips.js)

## Optional mod support:
- [Quality Food](https://www.curseforge.com/minecraft/mc-mods/quality-food) - Quality has an impact on values that's also reflected in the tooltip
- [Immersive Messages](https://www.curseforge.com/minecraft/mc-mods/immersive-messages-api) - Uncomment out the lines for nicer sell alerts. I wouldn't recommend this though because txnilib jarinjar's the entire forgefied fabric api
- [Splendid Slimes](https://www.curseforge.com/minecraft/mc-mods/splendid-slimes) - Plorts/Hearts are data driven so the type is determined by nbt.

### Splendid Slimes compat
If you're using Splendid Slimes you'll also need to add this to [`globalValues.js`](https://github.com/Chakyl/chakyl-custom-shipping-bin/blob/main/kubejs/startup_scripts/globalValues.js):
```
global.plorts = [
  { type: "splendid_slimes:slimy", value: 32 },
  { type: "splendid_slimes:dusty", value: 64 },
  { type: "splendid_slimes:rotting", value: 72 },
  { type: "splendid_slimes:webby", value: 128 },
  { type: "splendid_slimes:luminous", value: 132 },
  { type: "splendid_slimes:puddle", value: 224 },
  { type: "splendid_slimes:boomcat", value: 256 },
  { type: "splendid_slimes:all_seeing", value: 256 },
  { type: "splendid_slimes:bitwise", value: 288 },
  { type: "splendid_slimes:blazing", value: 256 },
  { type: "splendid_slimes:weeping", value: 320 },
  { type: "splendid_slimes:prisma", value: 400 },
  { type: "splendid_slimes:phantom", value: 512 },
  { type: "splendid_slimes:sweet", value: 768 },
  { type: "splendid_slimes:shulking", value: 1024 },
  { type: "splendid_slimes:ender", value: 1024 },
  { type: "splendid_slimes:orby", value: 1280 },
  { type: "splendid_slimes:minty", value: 1280 },
  { type: "splendid_slimes:gold", value: 2048 },
];

global.slimeHearts = [];
// Replace the 16 here with however many plorts it takes to craft a heart
global.plorts.forEach((plort) => {
  global.slimeHearts.push({
    type: plort.type,
    value: Math.floor(plort.value * 16 * 1.5),
  });
});
global.plorts.forEach((plort) => {
  const { type, value } = plort;
  global.trades.set(`splendid_slimes:plort/${type}`, {
    value: value,
    multiplier: "shippingbin:meat_sell_multiplier",
  });
});
global.slimeHearts.forEach((heart) => {
  const { type, value } = heart;
  global.trades.set(`splendid_slimes:slime_heart/${type}`, {
    value: value,
    multiplier: "shippingbin:meat_sell_multiplier",
  });
});
```
And this to [`valueTooltips.js`](https://github.com/Chakyl/chakyl-custom-shipping-bin/blob/main/kubejs/client_scripts/valueTooltips.js):
```
  tooltip.addAdvanced("splendid_slimes:plort", (item, advanced, text) => {
    let plortType;
    let price;
    if (item.nbt && item.nbt.plort) {
      plortType = item.nbt.plort.id;
    }
    global.plorts.forEach((plort) => {
      if (plort.type == plortType) price = plort.value;
    });
    if (tooltip.shift) {
      text.add(1, [
        Text.white(`${formatNumber(price * item.count, 0)} :coin:`),
        Text.gray(" Stack value"),
      ]);
      text.add(2, [Text.gold(getAttributeStr("meat"))]);
    } else {
      text.add(1, [
        Text.white(`${formatNumber(price, 0)} :coin:`),
        Text.darkGray(" Hold ["),
        Text.gray("Shift"),
        Text.darkGray("]"),
      ]);
    }
  });

  tooltip.addAdvanced("splendid_slimes:slime_heart", (item, advanced, text) => {
    let heartType;
    let price;
    if (item.nbt && item.nbt.slime) {
      heartType = item.nbt.slime.id;
    }
    global.slimeHearts.forEach((heart) => {
      if (heart.type == heartType) price = heart.value;
    });
    if (tooltip.shift) {
      text.add(1, [
        Text.white(`${formatNumber(price * item.count, 0)} :coin:`),
        Text.gray(" Stack value"),
      ]);
      text.add(2, [Text.gold(getAttributeStr("meat"))]);
    } else {
      text.add(1, [
        Text.white(`${formatNumber(price, 0)} :coin:`),
        Text.darkGray(" Hold ["),
        Text.gray("Shift"),
        Text.darkGray("]"),
      ]);
    }
  });
```
