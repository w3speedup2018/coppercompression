function MiniCart() {
  const selectors = {
    minicart: '.js-minicart',
    minicartOpen: '[data-toggle-bag]',
    headerCount: '[data-cart-count]',
    minicartClose: '.js-close-minicart',
    minicartOverlay: '.js-minicart-overlay',
    minicartWrapper: '.js-minicart-items',
    minicartSubtotalCount: '.js-cart-count',
    minicartSubtotalEnding: '.js-cart-count-ending',
    minicartSubtotal: '.js-minicart-subtotal-price',
    minicartBar: '.js-minicart-progress-bar',
    minicartBarText: '.js-bar-progress-text',
    minicartRemove: 'minicart-item__btn-remove',
    minicartItem: '.minicart-item',
    minicartItemQuantity: 'js-minicart-item-quantity',
    minicartUpsell: '.js-minicart-upsell',
    minicartUpsellButton: 'js-upsell-btn',
    addToCartBtn: '#addToCartBtn',
    quickAdd: '[data-quick-add]',
    cartCountBubble: '[data-cart-count-bubble]',
    cartCount: '[data-cart-count]',
  };

  const minicart = document.querySelector(selectors.minicart);
  const minicartOpen = document.querySelector(selectors.minicartOpen);
  const minicartClose = document.querySelectorAll(selectors.minicartClose);
  const minicartWrapper = document.querySelector(selectors.minicartWrapper);
  const count = document.querySelector(selectors.minicartSubtotalCount);
  const ending = document.querySelector(selectors.minicartSubtotalEnding);
  const subtotal = document.querySelector(selectors.minicartSubtotal);
  const quickAddButtons = document.querySelectorAll(selectors.quickAdd);
  const minicartUpsell = document.querySelector(selectors.minicartUpsell);
  const cartCountBubble = document.querySelector(selectors.cartCountBubble);
  const cartCount = document.querySelector(selectors.cartCount);
  const bar = document.querySelector(selectors.minicartBar);
  const barText = document.querySelector(selectors.minicartBarText);

  function init() {
    if (!minicart) { return; }
    initCartDetails();
    initCartUpsells();
    setMiniCartListeners();
  }

  function setMiniCartListeners() {
    minicartOpen.addEventListener(
      'click',
      (evt) => {
        evt.preventDefault();
        openCart();
      }, false,
    );

    minicartClose.forEach((closeBtn) =>
      closeBtn.addEventListener(
        'click',
        (evt) => {
          evt.preventDefault();
          closeCart();
        }, false,
      ));

    document.addEventListener(
      'cartUpdated',
      cartUpdated.bind(this),
      false,
    );

    quickAddButtons.forEach((quickAdd) =>
      quickAdd.addEventListener(
        'click',
        (evt) => {
          evt.preventDefault();
          const variantId = evt.currentTarget.dataset.variantId;
          if (variantId) {
            const data = {
              id: variantId,
              quantity: 1,
            };
            theme.Helpers.addToCart(JSON.stringify(data));
          }
        }, false,
      ));

    /**
     * Because the entire cart is recreated when a cart item is updated,
     * we cannot cache the elements in the cart. Instead, we add the event
     * listeners on the cart's container to allow us to retain the event
     * listeners after rebuilding the cart when an item is updated.
     */
    minicartWrapper.addEventListener('click', removeItem.bind(this), false);
    minicartWrapper.addEventListener('change', updateItemQuantity.bind(this), false);
    minicart.addEventListener('click', addUpsell.bind(this), false);
  }

  function openCart() {
    document.body.classList.add('minicart--open');
  }

  function closeCart() {
    document.body.classList.remove('minicart--open');
  }

  async function initCartDetails() {
    const cart = await getCart();
    updateCartGeneralInfo(cart);
  }

  async function cartUpdated() {
    console.log('update Cart');
    const cart = await getCart();
    updateCartTemplate(cart);
    openCart();
  }

  function updateCartTemplate(cart) {
    setCartCountBubble(cart.item_count);
    if (cart.item_count === 0) {
      minicart.classList.add('empty');
      setFreeShippingBar(0);
    } else {
      minicart.classList.remove('empty');
      minicart.classList.add('minicart--loading');
      minicart.classList.add('minicart__upsells--loading');
      updateCartItems(cart);
      setCartUpsells(cart);
      updateCartGeneralInfo(cart);
    }
  }

  function updateCartItems(cart) {
    if (cart.items.lenght === 0) { return false; }

    minicartWrapper.innerHTML = '';
    cart.items.forEach((item, index) => {
      minicartWrapper.innerHTML += itemTemplate(item, index);
    });
    minicart.classList.remove('minicart--loading');
  }

  function itemTemplate(item, index) {
    let itemOptions = '';
    let quantitiesList = '';
    const itemKey = index + 1;

    if (!item.product_has_only_default_variant) {
      itemOptions = '<div class="minicart-item__options">';
      item.options_with_values.forEach((option) => {
        itemOptions += `<span class="minicart-item__option">${option.value}</span>`;
      });
      itemOptions += '</div>';
    }

    for (let i = 1; i <= 10; i++) {
      let isCurrentQuantity;
      if (item.quantity === i) { isCurrentQuantity = 'selected'; }
      quantitiesList += `<option value="${i}" ${isCurrentQuantity}>${i}</option>`;
    }

    const itemElement = `<div class="minicart-item" data-variant-id="${item.id}" data-index="${itemKey}">
      <div class="minicart-item__image-container">
        <div class="minicart-item__image-wrapper">
          <picture>
            <img
              src="${item.featured_image.url}"
              alt="${item.featured_image.alt}"
              alt=""
              class="minicart-item__image"
            >
          </picture>
        </div>
      </div>
      <div class="minicart-item__meta-wrapper">
        <header class="minicart-item__header">
          <h4 class="minicart-item__title">${item.product_title.replace('Copper Compression ', '')}</h4>
          <button class="minicart-item__btn-remove" aria-label="Remove product">
            <svg data-name="Group 420" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" class="icon icon-remove">
              <defs>
                <clipPath id="a">
                  <path data-name="Rectangle 31" d="M0 0h15v15H0z"></path>
                </clipPath>
              </defs>
              <g data-name="Group 419" style="clip-path:url(#a)">
                <path data-name="Path 455" d="M10.2 2.4V.75A.75.75 0 0 0 9.45 0h-3.9a.75.75 0 0 0-.75.75V2.4H0V3h15v-.6zM1.8 3.6v10.65a.75.75 0 0 0 .75.75h9.9a.75.75 0 0 0 .75-.75V3.6zM6 11.4h-.6V6H6zm3.6 0H9V6h.6z"></path>
              </g>
            </svg>
          </button>
        </header>
        ${itemOptions}
        <footer class="minicart-item__footer">
          <div class="minicart-item__quantity-wrapper">
            <div class="minicart-item__select-container">
              <select
                  name=""
                  id=""
                  class="js-minicart-item-quantity minicart-item__quantity"
              >
                ${quantitiesList}            
              </select>
            </div>
          </div>
          <div class="minicart-item-price-wrapper">
            <span class="minicart-item-price">${theme.Helpers.formatMoney(item.price)}</span>
          </div>
        </footer>
      </div>
    </div>`;

    return itemElement;
  }

  function updateCartGeneralInfo(cart) {
    count.innerHTML = cart.item_count;
    subtotal.innerHTML = theme.Helpers.formatMoney(cart.items_subtotal_price);
    cart.item_count > 1 ? ending.classList.add('active') : ending.classList.remove('active');
    setFreeShippingBar(cart.items_subtotal_price);
    setProgressBar(cart.items_subtotal_price);
  }

  function removeItem(evt) {
    if (!evt.target.classList.contains(selectors.minicartRemove)) { return; }
    evt.preventDefault();

    const lineItem = evt.target.closest('.minicart-item');
    const index = Number(lineItem.dataset.index);

    updateItem(index, 0);
  }

  function updateItemQuantity(evt) {
    if (!evt.target.classList.contains(selectors.minicartItemQuantity)) { return; }
    evt.preventDefault();

    const lineItem = evt.target.closest('.minicart-item');
    const index = Number(lineItem.dataset.index);
    const quantity = evt.target.value;

    updateItem(index, quantity);
  }

  function setFreeShippingBar(totalPrice) {
    const freeShippingBar = document.querySelector('.announcement-bar__free-shipping__text');
    if (!freeShippingBar) { return; }
    if (totalPrice < 5000) {
      freeShippingBar.innerHTML = theme.strings.amount_to_qualify_for_free_shipping.replace('[amount]', theme.Currency.formatMoney(5000 - totalPrice, theme.moneyFormat));
    } else {
      freeShippingBar.innerHTML = theme.strings.qualifies_for_free_shipping;
    }
  }

  function setProgressBar(totalPrice) {
    if (!bar) { return; }

    const treshold = barText.dataset.treshold * 100;
    const progressText = barText.dataset.processText;
    const successText = barText.dataset.successText;
    const barProgressPercent = totalPrice * 100 / treshold;
    bar.style.width = `${barProgressPercent}%`;

    if (totalPrice < treshold) {
      const shippingText = progressText.replace('{{amount}}', theme.Helpers.formatMoney(treshold - totalPrice));
      barText.innerHTML = shippingText;
    } else {
      barText.innerHTML = successText;
    }
  }

  function setCartCountBubble(quantity) {
    if (quantity > 0) {
      cartCountBubble.classList.remove('hide');
      cartCount.textContent = quantity;
    } else {
      cartCountBubble.classList.add('hide');
      cartCount.textContent = '';
    }
  }

  function updateItem(itemIndex, quantity) {

    const data = {
      line: itemIndex,
      quantity: String(quantity),
    };

    fetch('/cart/change.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    })
      .then((response) => {
        return response.json();
      })
      .then((cart) => {
        updateCartTemplate(cart);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  async function getCart() {
    const cart = await fetch('/cart.js')
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.log('Failed to fetch page: ', err);
      });
    return cart;
  }

  function initCartUpsells() {
    if (!minicartUpsell) { return; }
    new Swiper('.upsell-swiper', {
      slidesPerView: 'auto',
      spaceBetween: 20,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
  }

  async function setCartUpsells(cart) {
    if (!minicartUpsell || cart.items_count == 0) { return; }

    const lastAddedItem = cart.items[0].product_id;
    const upsellsRelatedProduct = minicartUpsell.querySelector('.upsell-products');

    if (!upsellsRelatedProduct || upsellsRelatedProduct.dataset.relatedProductId !== lastAddedItem) {
      minicartUpsell.innerHTML = await fetch('/cart?view=upsells')
        .then((response) => {
          return response.text();
        })
        .then((html) => {
          const parser = new DOMParser();
          const content = parser.parseFromString(html, 'text/html');
          const upsells = content.querySelector('.minicart-ajax-template-upsell').innerHTML;
          return upsells;

        })
        .catch((err) => {
          console.log('Failed to fetch page: ', err);
        });

      new Swiper('.upsell-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
      });
    }
    minicart.classList.remove('minicart__upsells--loading');
  }

  function addUpsell(evt) {
    if (!evt.target.classList.contains(selectors.minicartUpsellButton)) { return; }
    const upsellContainer = evt.target.closest('.upsell-products-item');
    const select = upsellContainer.querySelector('.js-upsell-variant');
    const upsellTitle = upsellContainer.querySelector('.upsell-products-item__title').innerHTML;
    const variantId = select.value;
    ga(`${ga.getAll()[0].get('name')}.send`, 'event', 'Upsell', 'Product Added', upsellTitle);

    if (variantId) {
      const data = {
        id: variantId,
        quantity: 1,
        properties: {
          cart_upsell: true,
        },
      };
      theme.Helpers.addToCart(JSON.stringify(data));
    } else {
      select.classList.add('error');
      setTimeout(() => {
        select.classList.remove('error');
      }, 1000);
    }
  }
  
  return {
    init,
  };

}

theme.MiniCart = MiniCart();
theme.MiniCart.init();