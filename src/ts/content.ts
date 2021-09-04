import {toast} from "bulma-toast";

browser.runtime.onMessage.addListener((err) => {
    const type = err.maybeFake ? "is-warning" : "is-danger";
    const duration = err.maybeFake ? 5000 : 10000;
    toast({
        message: err.message,
        type: type,
        position: "bottom-center",
        duration: duration
    });
});
