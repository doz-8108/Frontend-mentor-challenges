let photos = document.querySelectorAll("main div[id^='photo']");
let slider = document.querySelector("main .slider");
let thumbnails = document.querySelectorAll("main #thumbnail");

let basket = document.getElementById("basket");
let basketContent = document.getElementById("basket-content");
let addOneBtn = document.getElementById("add");
let removeOneBtn = document.getElementById("minus");
let qtyDisplay = document.getElementById("qty-display");
let checkout = document.getElementById("checkout");
let cartIcon = document.getElementById("cart");

let lightbox = document.querySelector(".lightbox");
let lightboxSlider = document.querySelector(".lightbox .slider");
let lightboxPhotos = document.querySelectorAll(".lightbox div[id^='photo']");
let lightboxThumbnails = document.querySelectorAll(".lightbox #thumbnail");
let closeLightbox = document.querySelector(".lightbox__close");
let prev = document.querySelectorAll("#prev");
let next = document.querySelectorAll("#next");

let sideNav = document.querySelector(".navbar__list");
let menu = document.getElementById("menu");
let closeMenu = document.getElementById("close-menu");

let currentPhotoIndex = 0;
let currentQty = 0;
let cart = [];
const selectedStyle = "thumbnails__photo-container--selected";

basket.style.visibility = "hidden";
basket.style.opacity = 0;

function addItemToCart() {
	if (!currentQty) return;

	const { productId } = this.dataset;

	// if product have already been added to cart, renew it
	const target = cart.find(
		targetItem => targetItem.dataset.productId === productId
	);

	// define a cart item
	const item = document.createElement("div");
	item.className = "basket__item";
	item.dataset.productId = productId;
	item.innerHTML = `
        <img
            class="basket__item-photo"
            src="images/image-product-1-thumbnail.jpg"
            alt="product"
        />
        <div class="basket__item-desc">
            <p>Fall Limited Edition Sneakers</p>
            <p>
                $125.00 x ${currentQty}
                <span class="basket__item-total">$${(125 * currentQty).toFixed(
							2
						)}</span>
            </p>
        </div>
    `;

	// define the button for removing item
	const removeItemBtn = document.createElement("button");
	removeItemBtn.className = "basket__item-remove";
	removeItemBtn.ariaLabel = "remove this item from cart";
	removeItemBtn.innerHTML = `
        <img
            src="images/icon-delete.svg"
            alt="remove an item from cart"
        />   
    `;
	removeItemBtn.addEventListener("click", removeFromCart);
	item.appendChild(removeItemBtn);

	// if product have already been added to cart, renew it
	if (target) {
		cart[0] = item;
	} else {
		cart.push(item);
	}
	basketContent.innerHTML = ``;
	basketContent.appendChild(item);

	if (!basketContent.lastElementChild.matches("button")) {
		// define the checkout button
		const checkoutBtn = document.createElement("button");
		checkoutBtn.className = "basket__checkout";
		checkoutBtn.ariaLabel = "checkout";
		checkoutBtn.textContent = "Checkout";

		basketContent.appendChild(checkoutBtn);
	}

	currentQty = 0;
	qtyDisplay.textContent = currentQty;
}

function removeFromCart() {
	this.parentElement.remove();
	basketContent.innerHTML = `<p class="basket__empty">Your cart is empty.</p>`;
	cart = [];
}

function adjustQty(action) {
	currentQty = Math.max(0, currentQty + action);
	qtyDisplay.textContent = currentQty;
}

function alterThumbnailsStyle() {
	lightboxThumbnails.forEach(thumbnail =>
		thumbnail.classList.remove(selectedStyle)
	);
	lightboxThumbnails[currentPhotoIndex].classList.add(selectedStyle);
	thumbnails.forEach(thumbnail => thumbnail.classList.remove(selectedStyle));
	thumbnails[currentPhotoIndex].classList.add(selectedStyle);
}

function switchPhoto() {
	lightboxPhotos[currentPhotoIndex].scrollIntoView();
	photos[currentPhotoIndex].scrollIntoView();
}

function slide(index) {
	currentPhotoIndex = index;
	alterThumbnailsStyle();
	switchPhoto();
}

function onCartHover() {
	basket.style.visibility = "visible";
	basket.style.opacity = 1;
}

function onCartLeave() {
	basket.style.visibility = "hidden";
	basket.style.opacity = 0;
}

function showLightbox() {
	if (window.matchMedia("(min-width: 1024px)").matches) {
		lightbox.style.display = "flex";
		lightboxPhotos[currentPhotoIndex].scrollIntoView();
	}
}

function prevPhotoLightbox(action) {
	currentPhotoIndex = Math.max(0, currentPhotoIndex + action);
	switchPhoto();
	alterThumbnailsStyle();
}

function nextPhotoLightBox(action) {
	currentPhotoIndex = Math.min(3, currentPhotoIndex + action);
	switchPhoto();
	alterThumbnailsStyle();
}

function hideLightbox() {
	lightbox.style.display = "none";
}

function adjustElements() {
	let { width } = basket.getBoundingClientRect();
	let { height, left } = cartIcon.getBoundingClientRect();

	basket.style.left = `-${width * 0.7}px`;
	basket.style.top = `${height}px`;

	if (window.matchMedia("(min-width: 1024px)").matches) showMenu();
	else hideMenu();
}

function showMenu() {
	sideNav.style.display = "flex";
	sideNav.style.visibility = "visible";
}

function hideMenu() {
	sideNav.style.display = "none";
	sideNav.style.visibility = "hidden";
}

for (let i = 0; i < 4; i++) {
	thumbnails[i].addEventListener("click", () => slide(i));
	lightboxThumbnails[i].addEventListener("click", () => slide(i));
}

adjustElements();
cartIcon.addEventListener("mouseenter", onCartHover);
cartIcon.addEventListener("mouseleave", onCartLeave);
addOneBtn.addEventListener("click", () => adjustQty(1));
removeOneBtn.addEventListener("click", () => adjustQty(-1));
checkout.addEventListener("click", addItemToCart);
slider.addEventListener("click", showLightbox);
closeLightbox.addEventListener("click", hideLightbox);
next.forEach(btn => btn.addEventListener("click", () => nextPhotoLightBox(1)));
prev.forEach(btn => btn.addEventListener("click", () => prevPhotoLightbox(-1)));
menu.addEventListener("click", showMenu);
closeMenu.addEventListener("click", hideMenu);
window.addEventListener("resize", adjustElements);
