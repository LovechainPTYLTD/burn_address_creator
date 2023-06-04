const { getChash160, getSourceString, isChashValid } = require("./utils");
var burnDefinition = ["sig", { pubkey: "[Hello world.@$%&]" }];
var burnAddress = getChash160(getSourceString(burnDefinition));
console.log(getChash160('Hello World'));
console.log("硬币销毁地址:", burnAddress);
console.log("是有效的地址？: ", isChashValid(burnAddress));