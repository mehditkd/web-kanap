const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const productId = urlParams.get('id');

fetch("http://localhost:3000/api/products/" + productId).then(
    (res) => {
        res.json().then((res) => {
            parseProduct(res);
        })
    }
)

// display all product information
// all those informations are fetch in the API
let parseProduct = (p) => {
    let item_img = document.querySelector(".item__img");
    let price = document.querySelector("#price");
    let item_name = document.querySelector("#title");
    let item_description = document.querySelector("#description");
    let item_color = document.querySelector("#colors");
    item_img.innerHTML = `<img src="${p.imageUrl}" alt="${p.altTxt}">`;
    price.innerHTML = p.price;
    item_name.innerHTML = p.name;
    item_description.innerHTML = p.description;
    for (let c of p.colors) {
        item_color.innerHTML += `<option value="${c}">${c}</option>`;
    }
}

let addToCart = document.querySelector(".item__content__addButton");

addToCart.addEventListener("click", (e) => {
    let qteValue = document.querySelector("#quantity").value;
    let colorValue = document.querySelector("#colors").value;
    let cart = JSON.parse(localStorage.getItem("cart"));
    if (cart == null) {
        cart = [];
    }
    if (colorValue == "") {
        alert("Wrong color");
        return;
    }
    if(qteValue == "" || qteValue == 0 || qteValue > 100) {
        alert("Wrong quantity");
        return;
    }
    for (let item of cart) {
        if (item.productId == productId && item.color == colorValue) {
            item.qte = parseInt(item.qte) + parseInt(qteValue);
            localStorage.setItem("cart", JSON.stringify(cart));
            alert("Product added to cart");
            return;
        }
    }
    cart.push({
        productId: productId,
        qte: qteValue,
        color: colorValue
    })
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to cart");
})