const button = document.querySelector(".btn");

button.addEventListener("click", function () {
    if (document.body.style.backgroundColor === "black") {
        // Switch to light mode
        document.body.style.backgroundColor = "white";
        document.body.style.color = "black";
        button.textContent = "Enable Dark Mode";
    } else {
        // Switch to dark mode
        document.body.style.backgroundColor = "black";
        document.body.style.color = "white";
        button.textContent = "Enable Light Mode";
    }
});