function saveOptions(e: SubmitEvent) {
    browser.storage.sync.set({
        address: (document.querySelector("#address") as HTMLInputElement).value
    }).catch(e => console.log("failed to save options due to", e));
    e.preventDefault();
}

function restoreOptions() {
    const storage = browser.storage.sync.get(["address"]);
    storage.then((res) => {
        const address = document.querySelector("#address");
        if (address instanceof HTMLInputElement) {
            address.value = res.address || "http://localhost:9595";
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form")?.addEventListener("submit", saveOptions);