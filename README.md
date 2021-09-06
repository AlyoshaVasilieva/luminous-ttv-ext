## Luminous TTV browser extension
A browser extension to avoid ads on Twitch. See [Luminous TTV][srv] for the other half
of the code. Should work in any Chrome-like browser and Firefox.

### Setup

Prerequisite: The [server][srv] must be running on your machine for this extension to work.

1. Download [the latest release][latest].
2. Load the extension:
   * Chrome: Open the Extensions page, enable *Developer mode*, and drag the ZIP onto
     the page. Alternatively, use *Load unpacked* to load the contents of the ZIP file.
   * Firefox: In the extensions tab, click the gear, select *Debug Add-ons*,
     and use *Load Temporary Add-on*. Extension will be removed on every browser
     restart.

[latest]: https://github.com/AlyoshaVasilieva/luminous-ttv-ext/releases/latest
[srv]: https://github.com/AlyoshaVasilieva/luminous-ttv

### Building

Prerequisite: Ensure [you have Node and NPM installed*][npm].

1. `npm install`
2. `npm run build`
3. Extension files including ZIP are output to `dist` directory.

*: That link is the fast way. [Read this guide for the correct way][guide].

[guide]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
[npm]: https://nodejs.org/en/

### Issues

* In Firefox, and browsers built using its code, the extension's error failsafe code 
  can't be used. If the server isn't running, you won't be able to view any streams
  on Twitch. (In Chrome-like browsers, this extension will fall back to the
  ad-filled stream when anything goes wrong.)
* A white pixel will appear in the bottom left of the Twitch page. This is an ad iframe
  that fails to load due to being blocked.

### License

GNU GPLv3.
