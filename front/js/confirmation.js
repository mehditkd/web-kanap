const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const productId = urlParams.get('code');

let orderDiv = document.querySelector("#orderId");

orderDiv.innerHTML = productId;