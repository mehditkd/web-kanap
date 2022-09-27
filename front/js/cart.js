let section = document.querySelector("#cart__items");
let cart = JSON.parse(localStorage.getItem("cart"));
let cart_item = document.querySelector("#cart__items");
let cartQte = document.querySelector("#totalQuantity");
let cartPrice = document.querySelector("#totalPrice");
let totalPrice = 0;
let totalQte = 0;
let submitBtn = document.querySelector("#order");
let prices = {}

// Getting the element by Xpath
let getElementByXpath = (path) => {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// Getting all elements that match the xpath expression in the parent element
let getElementsByXPath = (xpath, parent) => {
    let results = [];
    let query = document.evaluate(xpath, parent || document,
        null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0, length = query.snapshotLength; i < length; ++i) {
        results.push(query.snapshotItem(i));
    }
    return results;
} 

submitBtn.addEventListener("click", (e) => {
    let firstNameDiv = document.querySelector("#firstName");
    let lastNameDiv = document.querySelector("#lastName");
    let addressDiv = document.querySelector("#address");
    let cityDiv = document.querySelector("#city");
    let emailDiv = document.querySelector("#email");
    let contact = {
        "firstName": firstNameDiv.value,
        "lastName": lastNameDiv.value,
        "address": addressDiv.value,
        "city": cityDiv.value,
        "email": emailDiv.value
    };

    let hasError = false;
    if (!contact["email"].includes("@")) {
        document.querySelector("#emailErrorMsg").innerHTML = "Veuillez entrer un email valide";
        hasError = true;
    }
    if (/\d/.test(contact["firstName"])) {
        document.querySelector("#firstNameErrorMsg").innerHTML = "Veuillez entrer un nom valide";
        hasError = true;
    }
    if (/\d/.test(contact["lastName"])) {
        document.querySelector("#lastNameErrorMsg").innerHTML = "Veuillez entrer un nom valide";
        hasError = true;
    }
    if (hasError) {
        return
    }
    let canaps = [];
    for (let item of cart) {
        for (let i = 0; i < item.qte; i++) {
            canaps.push(item.productId);
        }
    }
    fetch("http://localhost:3000/api/products/order", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contact: contact,
            products: canaps
        })
    }).then((res) => {
        if (res.status === 201) {
            localStorage.removeItem("cart");
            res.json().then((res) => {
                window.location.href = "confirmation.html?code=" + res.orderId;
            })
        } else if (res.status === 400) {
            alert("Votre commande n'as pas été prise en compte")
        }
    }).catch(err => {
        alert("Votre commande n'as pas été prise en compte")
    })
})

// Get all products informations in the cart and display them
let displayItems = () => {
    cart_item.innerHTML = "";
    totalQte = 0;
    totalPrice = 0;
    let allPromises = [];

    for (let item of cart) {
        allPromises.push(fetch("http://localhost:3000/api/products/" + item.productId));
    }
    Promise.all(allPromises).then((res) => {
        let jsonPromise = [];
        for (let r of res) {
            jsonPromise.push(r.json());
        }
        Promise.all(jsonPromise).then((res) => {
            for (let r in res) {
                prices[res[r]._id] = res[r].price;
                let item = cart[r]
                cart_item.innerHTML += parseProduct(res[r], item);
            }
            bindAllItems();
        })
    });
}  

// Calculate all cart informations
// like price and quantity depending on the products in the cart
let calcStorage = () => {
    let qte = 0
    let price = 0
    for (let item of cart) {
        qte += parseInt(item.qte);
        price += item.qte * prices[item.productId];
    }
    cartQte.innerHTML = qte;
    cartPrice.innerHTML = price;
}

// bind event delete and change to all products in the cart displayed
let bindAllItems = () => {
    let xpath = "//article";
    let divs = getElementsByXPath(xpath)
    for (let div of divs) {
        bindDelete(div, div.getAttribute("data-id"), div.getAttribute("data-color"));
        bindChange(div.getAttribute("data-id"), div.getAttribute("data-color"));
    }
}

// bind event when you changed data quantity
// it change all info in storage
let bindChange = (id, color) => {
    let xpath = `//article[@data-id='${id}' and @data-color='${color}']//input[@class='itemQuantity']`;
    let div = getElementByXpath(xpath)
    div.addEventListener("change", (e) => {
        e.preventDefault()
        for (let item of cart) {
            if (item.productId === id && item.color === color) {
                item.qte = parseInt(div.value);
                localStorage.setItem("cart", JSON.stringify(cart));
                calcStorage();
            }
        }
    })
}

// bind event when you click on delete button
let bindDelete = (parent, id, color) => {
    let xpath = `//article[@data-id='${id}' and @data-color='${color}']//p[@class='deleteItem']`;
    let div = getElementByXpath(xpath)
    div.addEventListener("click", (e) => {
        e.preventDefault()
        for (let c of cart) {
            if (c.productId === id && c.color === color) {
                cart.splice(cart.indexOf(c), 1);
                localStorage.setItem("cart", JSON.stringify(cart));
                calcStorage();
            }
        }
        parent.remove()
    })
}

displayItems();

// Parse product to html
// it return the html for one product
let parseProduct = (p, item) => {
    totalQte += parseInt(item.qte);
    totalPrice += p.price * item.qte;
    cartPrice.innerHTML = totalPrice;
    cartQte.innerHTML = totalQte;
    return `<article class="cart__item" data-id="${p._id}" data-color="${item.color}">
        <div class="cart__item__img">
            <img src="${p.imageUrl}" alt="${p.altTxt}">
        </div>
        <div class="cart__item__content">
            <div class="cart__item__content__description">
                <h2>${p.name}</h2>
                <p>${item.color}</p>
                <p>${p.price} €</p>
            </div>
            <div class="cart__item__content__settings">
                <div class="cart__item__content__settings__quantity">
                    <p>Qté : </p>
                    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${item.qte}">
                </div>
                <div class="cart__item__content__settings__delete">
                <p class="deleteItem">Supprimer</p>
                </div>
            </div>
        </div>
    </article>`
}
