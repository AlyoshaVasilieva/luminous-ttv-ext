"use strict";

import BlockingResponse = browser.webRequest.BlockingResponse;
import WebRequestBodyDetails = browser.webRequest._OnBeforeRequestDetails;

browser.webRequest.onBeforeRequest.addListener(
    redirectM3U,
    {urls: ["https://usher.ttvnw.net/api/channel/hls/*", "https://usher.ttvnw.net/vod/*"]},
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    blockAdServer,
    {urls: ["https://*.amazon-adsystem.com/*"]},
    ["blocking"]
);

/** Log the request's URL and tell Chrome to block it. */
function blockAdServer(details: WebRequestBodyDetails): BlockingResponse | void {
    // This function should only be hit on VODs, since streams won't be serving ads.
    // VODs continue to serve ads without this function.
    // TODO: Use `if (window.location.toString().startsWith("https://www.twitch.tv/videos/"))` if this triggers
    //  anti-adblock code for livestreams.
    console.log(`blocking request to ad-related server: ${details.url}`)
    return {
        cancel: true
    };
}

/** Tell TypeScript about a legacy Firefox API. */
declare const InstallTrigger: void;

/** Attempt to grab the M3U8 from the relay server, triggering a redirect to a data URL if successful. */
function redirectM3U(details: WebRequestBodyDetails): BlockingResponse | void {
    const base = "http://localhost:9595";
    const source = /\/(hls|vod)\/(.+)\.m3u8(.+)/.exec(details.url);
    if (source === null) {
        console.log(`unmatched URL, source ${details.url}`);
        return;
    }

    const type = source[1];
    const endpoint = type === "hls" ? "/live/" : "/vod/";
    const id = source[2];
    const query = source[3];
    const url = `${base}${endpoint}${id}${query}`;
    if (typeof InstallTrigger !== 'undefined') {
        // Firefox blocks redirecting to a data URL, citing CORS.
        // I'm pretty sure this is a bug, but I've tried reporting bugs to them before.
        // Skip all the nice error presentation and just go for it.
        // If the server fails, Twitch's player will retry a bit before error 2000.
        // Maybe it's https://bugzilla.mozilla.org/show_bug.cgi?id=1267027 from 2016?
        console.log(`redirecting ${type} ${id}`);
        return {redirectUrl: url};
    }
    const req = new XMLHttpRequest();
    console.log(`calling ${url}`);
    req.open("GET", url, false); // Ignore the deprecation warning.
    try {
        req.send(); // if (local?) server is down this throws
    } catch (e) {
        console.error(e);
        logError(type, req);
        return;
    }
    if (req.status !== 200 || !req.response.startsWith("#EXTM3U")) {
        // the #EXTM3U check is paranoid, but avoids an outright failure on weirdness
        console.log(`grabbing m3u8 failed, code ${req.status}, response: ${req.response}`);
        logError(type, req);
        return;
    }

    const m3u8 = stringToBase64(req.response);
    console.log(`redirecting ${type} ${id}`);
    return {redirectUrl: `data:application/vnd.apple.mpegurl;base64,${m3u8}`};
}

/** Log an error with a (hopefully) detailed message, both to the console and a toast notification. */
function logError(type: string, req: XMLHttpRequest) {
    try {
        if (req.status === 404 && type === "hls") {
            // When loading a streamer's page (even sometimes the /videos page?) Twitch seems to attempt to
            // load the live stream, then display the most recent VOD if that fails.
            // We don't care that it 404'd, that's expected behavior.
            sendError({
                maybeFake: true,
                message: "Failed to load livestream (404). If you aren't trying to watch a livestream, ignore this."
            });
            return;
        } else if (req.response !== null && !req.response.isEmpty()) {
            sendError({maybeFake: false, message: `Proxy error, server reported ${req.response}`});
            return;
        }
    } catch (e) {
        // handled with default text
    }
    const message = "Proxy error, you will see ads. Is the server running?";
    sendError({maybeFake: false, message: message});
}

export interface ExtError {
    /** Marks whether this error might be fake; that is, an error a user will never be impacted by. */
    maybeFake: boolean,
    message: string,
}

/** Send an error to the content script for display. */
function sendError(err: ExtError) {
    browser.tabs.query({active: true, currentWindow: true})
        .then(tabs => {
            if (tabs.length === 0 || typeof tabs[0].id === "undefined") {
                return;
            }
            // I don't understand JS Promises
            return browser.tabs.sendMessage(tabs[0].id, err).catch(e => console.log(`failed to send error due to ${e}`));
        }, e => {
            console.log(`failed to send error due to ${e}`);
        });
}

/** Converts a string to a base64 string. Safe for use with Unicode input, unlike {@link btoa}.
 *  The M3U8 doesn't *currently* use any non-ASCII text, but I'd rather not make it so easy for Twitch. */
function stringToBase64(input: string): string {
    const enc = new TextEncoder();
    const array = enc.encode(input);
    return arrayToBase64(array);
}

/** Convert a Uint8Array to a Base64 string.
 *
 * Taken from https://github.com/WebReflection/uint8-to-base64 and lightly modified.
 *
 * ISC License
 *
 * Copyright (c) 2020, Andrea Giammarchi, @WebReflection
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
 * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE. */
function arrayToBase64(array: Uint8Array): string {
    const output: string[] = [];
    for (let i = 0; i < array.length; i++) {
        output.push(String.fromCharCode(array[i]));
    }
    return btoa(output.join(""));
}

