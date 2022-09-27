fetch("http://localhost:3000/api/products").then((res) => {
    res.json().then((res) => {
        insertProducts(res);
    })
})

// display in the main page all products fetched from the API
let createProduct = (p) => {
    return (
        `<a href="./product.html?id=${p._id}">
            <article>
                <img src="${p.imageUrl}" alt="${p.altTxt}">
                <h3 class="productName">${p.name}</h3>
                <p class="productDescription">${p.description}</p>
            </article>
        </a>`
    );
}

// insert all products in balise
let insertProducts = (products) => {
    let section = document.querySelector("#items");
    for (let p of products) {
        section.innerHTML += createProduct(p);
    }
}
