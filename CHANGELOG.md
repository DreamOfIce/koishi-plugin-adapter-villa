## [0.5.1](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/compare/v0.5.0...v0.5.1) (2023-07-24)

### Bug Fixes

- fix a typo ([2f5da7a](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/2f5da7a10405400e3d4b4131801f803fe061a681))

## [0.5.0](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/compare/v0.4.1...v0.5.0) (2023-07-24)

### Features

- add config `verifyCallback` ([b678175](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/b6781752889ea84bd06c98f5a362da99539ee77b))

### Bug Fixes

- fix image transfer ([c840800](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/c840800485d7c6df073dd1f16d03d8ceffabeea7))
- fix some typos ([d526092](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/d526092971168cce03e7cd6fbb6b1db12ca1c712))

## [0.4.1](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/compare/v0.4.0...v0.4.1) (2023-07-22)

### Bug Fixes

- fix image parse error ([7d1f006](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/7d1f006c62f7d32314c2d961dd1d931720c0cc38))
- **messanger:** allow non-standard public key ([f22e9d1](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/f22e9d18eb3b65b105166cbff50be0d59e118c73))

## [0.4.0](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/compare/v0.3.0...v0.4.0) (2023-07-20)

### ⚠ BREAKING CHANGES

- mark pubKey as required config

### Features

- add public key import cache ([1888535](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/188853501d8634e22f10fb8a150a540e6d95d4d6))
- mark pubKey as required config ([d24aa4a](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/d24aa4a98c6d06560e9404905c0257fe95ed16c7))
- support callback signature verfiry ([bc4836a](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/bc4836a83d20780be2b2697eaa05376fbb7d2751))
- support image transfer ([94a365a](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/94a365a0abec6f386f3046af7ea9e161944a0e00))
- support new API auth method ([584026d](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/584026dce645db07b248b9698ade7ec7b4596e13))

### Bug Fixes

- fix a typo ([2fd17ce](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/2fd17cebd721f60c798c0f6e4e438bda4b45521b))
- fix a typo ([66c79e9](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/66c79e94a49cd295c7b0e1a67901e87d7d07920a))
- fix callback verify error ([9291595](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/9291595d59b9311bbe29f1728765baa3a721f383))
- fix some errors ([30cb25a](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/30cb25a9d744e5a7a4b62f3984c7aa963fad30be))
- use file-type@16 to support cjs ([2671cd6](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/2671cd613bb007928a411198c6010de77f10b414))

## [0.3.0](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/compare/v0.2.0...v0.3.0) (2023-07-08)

### ⚠ BREAKING CHANGES

- use '~' as splitter of msgId and channelId
- add villa id to channelId
- add timestamp to message id

### Features

- add timestamp to message id ([b3cc6f1](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/b3cc6f1435898e4d4ac89cad47437df950eaca1f))
- add villa id to channelId ([fd38b22](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/fd38b220115a34e800efadccbd01994e393d39ab))
- support delete message ([53f81f6](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/53f81f6b6db9aa60899bc25fcebfd5ff82f4a7a0))
- support parsing quote info ([f403896](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/f4038966ea414f48550a191187827534f8b67fa7))
- support reaction ([bb36838](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/bb368387f5856d57dae7fe44a86200e959f50a79))
- use '~' as splitter of msgId and channelId ([8c4c71a](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/8c4c71a806379588315de8d8230df888f56e1222))

## [0.2.0](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/compare/v0.1.1...v0.2.0) (2023-06-20)

### Features

- export utils ([c7a184b](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/c7a184b2cba31ed56ed4defcd9bba0a966497ea4))
- **messanger:** ignore null message ([7ca4671](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/7ca46716fff08f23626bb8e9abb0f1f5079b449d))
- support custom callback path ([25cff20](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/25cff202ef967f875926d4dcfa72bc553cd162bd))
- support getChannelList() ([ddaaa67](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/ddaaa67b660b3fdfd561ea0db49e86de23d5fbbf))
- support getGuildMemberList() ([7e914a9](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/7e914a9ef639371d5efa40187d294f25a6024d2d))
- support guild-added and guild-deleted ([5fcd108](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/5fcd108864e38a719ea13043fed7646f9114572a))
- support image message ([60d127b](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/60d127bc6048e513d111af553c7e9f5fe7d52034))
- support session.elements ([9b93b7c](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/9b93b7cb047c906dfa31e199cef00e3eea0c19d5))

### Bug Fixes

- fix a typo error ([ea4bfc9](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/ea4bfc9c304cf9c180ce367357f4cd696fde5805))
- fix message parse error ([7574b86](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/7574b867d80ddc93a12e4715172fc597f8c51de9))
- **messanger:** fix a typo error ([b376f02](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/b376f02156966b3706050ddd86dd06703d6bef55))

## [0.1.1](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/compare/v0.1.0...v0.1.1) (2023-06-08)

### Bug Fixes

- fix config export ([3e97f72](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/3e97f720068cb56406ff5aaceab6f622e9b56bcd))

## 0.1.0 (2023-06-07)

### Features

- get message and user ([7fb3073](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/7fb307305e875ee1c91f80e1b6ec638b66e654f7))
- send message ([68ba628](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/68ba628f6fd88b3080f2b30b284f7383fbf2716f))
- support getGuild ([0b92be5](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/0b92be5a1c46cd9625867955068c3b55cb950dbf))
- support getRoom ([26933dc](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/26933dc875e60868b284dbc8d32d6ae0070ae376))
- support message elements when send ([5628a57](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/5628a5734c518cd992cf9d1514513c486d2276d0))
- use room name as default name of <sharp> ([5facd7a](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/5facd7a0e839422d292f00b12cc960e9afbb0428))

### Bug Fixes

- fix an error of <at> ([2932786](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/2932786c63d34aae7508b342fbcde5b156692299))
- fix some errors of messanger ([55cb205](https://github.com/DreamOfIce/koishi-plugin-adapter-villa/commit/55cb205ba613921ea986afa193ef586b753fcab2))
