# LCP burn address creator
# LCP火烧地址创建者

A burn address is an address to which you can send assets that can never be recovered, because there is no private key corresponding to that address.


火烧地址是您可以向其发送资产的地址，但是从那里它们永远无法恢复，因为没有与该地址对应的私钥。


An address represents a definition, which is a Boolean expression (remotely similar to Bitcoin script). When a user signs a unit, he also provides a set of authentifiers (usually ECDSA signatures) which, when applied to the definition, must evaluate it to true in order to prove that this user had the right to sign this unit. We write definitions in JSON. For example, this is the definition for an address that requires one ECDSA signature to sign:


`["sig",{"pubkey":"Ald9tkgiUZQQ1djpZgv2ez7xf1ZvYAsTLhudhvn0931w"}]`


The definition indicates that the owner of the address has a private key whose public counterpart is given in the definition (in base64 encoding), and he will sign all units with this private key. The above definition evaluates to true if the signature given in the corresponding authentifier is valid, or otherwise false. The signature is calculated over all data of the unit except the authentifiers.
Given a definition object, the corresponding address is just a hash of the initial definition object plus a checksum. The checksum is added to avoid typing errors. Unlike usual checksum designs, however, the checksum bits are not just appended to the end of the unchecksummed data. Rather, they are inserted into multiple locations inside the data. This design makes it hard to insert long strings of illegal data in fields where an address is expected. The address is written in base32 encoding. 

The burn addresses that are created with this tool take a definition based on a completely invalid public key. Public keys for the LCP network are base64 encoded and the public key for this burn address was made using characters that are not found in the Base64 encoding alphabet. Aside from that the 'public key' being used in the definition can have no corresponding private key. That means the funds sent to a burn address are mathematically and computationally inaccessible. 


地址表示一个定义，它是一个布尔表达式（远程类似于比特币脚本）。当用户签署一个单元时，他还提供了一组认证（通常是ECDSA签名），当应用于定义时，必须将其评估为真，以证明该用户有权签署该单元。我们用JSON编写定义。例如，这是需要一个ECDSA签名签名的地址定义：


`[ “SIG”，{ “PUBKEY”： “Ald9tkgiUZQQ1djpZgv2ez7xf1ZvYAsTLhudhvn0931w”}]`


该定义表明地址的所有者有一个私钥，其公共对应物在定义中给出（以base64编码），并且他将使用该私钥对所有单元进行签名。如果相应的authentifier中给出的签名有效，则上述定义的结果为true，否则为false。签名是在除了认证者之外的所有单位数据上计算的。
给定定义对象，相应的地址只是初始定义对象的散列加上校验和。添加校验和以避免输入错误。然而，与通常的校验和设计不同，校验和位不仅仅附加到未校验数据的末尾。相反，它们被插入到数据内的多个位置。这种设计使得很难在需要地址的字段中插入长串的非法数据。地址用base32编码。

使用此工具创建的刻录地址基于完全无效的公钥进行定义。 LCP网络的公钥是base64编码的，此刻录地址的公钥是使用Base64编码字母表中找不到的字符制作的。除此之外，定义中使用的“公钥”可以没有相应的私钥。这意味着发送到刻录地址的资金在数学上和计算上都是不可访问的。


to verify the first official LCP burn address run these commands:


验证第一个正式的LCP刻录地址运行这些命令：


```
git clone https://github.com/LovechainPTYLTD/burn_address_creator.git

npm install

node burn_address_creator.js
```
the expected output is:

预期的产出是： 


```
硬币销毁地址: 3CVF7WEVOTUW5L3FTQOQL4P5J3D6IYOK
是有效的地址？:  true
```