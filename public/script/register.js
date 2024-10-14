const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const signUpBtn = document.getElementById("signUpBtn");

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const symbols = [];

signUpBtn.addEventListener("click", event => {
    event.preventDefault();
    signUpBtn.style.display = "none"
})