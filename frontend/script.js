function goTo(hash) {
    window.location.hash = hash; // changes URL
    showStep();
}

function showStep() {
    const hash = window.location.hash || "#welcome"; // default
    document.querySelectorAll(".step").forEach(step => {
        step.classList.remove("active");
    });
    const active = document.querySelector(hash);
    if (active) active.classList.add("active");
}

window.addEventListener("hashchange", showStep);
window.addEventListener("load", showStep);