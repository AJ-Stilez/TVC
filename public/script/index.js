function darkMode(){
    const triggerModeBtn = document.getElementById("triggerModeBtn");
    const triggerModeLabel = document.getElementById("triggerModeLabel");

    if(triggerModeBtn.checked){
        triggerModeBtn.style.backgroundColor = "black";
        triggerModeBtn.style.color = "white";
        triggerModeLabel.innerText = "Light mode";
        document.body.style.backgroundColor = "#121212";
        document.body.style.transition = "ease 1s";
        document.body.classList.add("darkMode");
    }
    else{
        const triggerModeBtn = document.getElementById("triggerModeBtn");
        const triggerModeLabel = document.getElementById("triggerModeLabel");
        triggerModeBtn.style.backgroundColor = "white";
        triggerModeBtn.style.color = "black";
        triggerModeLabel.innerText = "Dark mode";
        document.body.style.backgroundColor = "#f0f3f7";
        document.body.style.transition = "ease 1s";
        document.body.classList.remove("darkMode");
    }
}

function toggleInvert() {
    const body = document.body;
    body.style.filter = body.style.filter === 'invert(1)' ? 'invert(0)' : 'invert(1)';
}
