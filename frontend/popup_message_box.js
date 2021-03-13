window.onload = () => {
    let elem = document.querySelector(".messages");
    console.log(elem);
    elem.scrollTop = elem.scrollHeight;
};