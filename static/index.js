const togglePassword = document.getElementsByClassName('toggle-password');
const password = document.getElementsByClassName('inputPassword');

Array.from(togglePassword).forEach((element, index) => {
    element.addEventListener('click', function (e) {
        // toggle the type attribute
        const type = password[index].getAttribute('type') === 'password' ? 'text' : 'password';
        password[index].setAttribute('type', type);
        // toggle the eye slash icon
        this.classList.toggle('fa-eye-slash');
    });
});

function showSignupPage(){
    $("#exampleModal-1").modal("show");
    $("#exampleModal-2").modal("hide");
}

setTimeout(() => {
    message = document.getElementById('message');
    message.classList.add("d-none");
    message.innerHTML = "";
}, 2000);