function saveOptions(e: SubmitEvent) {
    browser.storage.sync.set({
        address: (document.querySelector("#address") as HTMLInputElement).value,
        port: (document.querySelector("#port") as HTMLInputElement).value
    }).catch(e => console.log("failed to save options due to", e));
    e.preventDefault();
}

function restoreOptions() {
    const storage = browser.storage.sync.get(["address", "port"]);
    storage.then((res) => {
        const address = document.querySelector("#address");
        const port = document.querySelector("#port");
        if (address instanceof HTMLInputElement && port instanceof HTMLInputElement) {
            address.value = res.address || "localhost";
            port.value = res.port || "9595";
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form")?.addEventListener("submit", saveOptions);