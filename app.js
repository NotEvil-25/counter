// получилось некрасиво =(
window.isOpenPopup = false;
window.inCart = JSON.parse(localStorage.getItem('inCart')) || [];
class Card {
    constructor (cardName, options) {
        this.cards = !options.isSingleCard
            ? document.querySelectorAll(cardName)
            : null;
        this.card = options.isSingleCard
            ? null 
            : document.querySelector(cardName);

        this.count = options.count || 0;

        if (!options.isSingleCard) {
            this.init();
            return;
        }

        this.handleCard();
    }

    init () {
        if (window.inCart) {
            this.cardData();
            this.countInCart(window.inCart);
        }

        this.cards.forEach((card, index) => {
            const btnDecrease = card.querySelector('.counter__decrease');
            const btnIncrease = card.querySelector('.counter__increase');
            const counterInput = card.querySelector('.counter__input');
            const btnAddToCard = card.querySelector('.product-card__add-to-cart');

            btnAddToCard.addEventListener('click', () => {
                if (window.isOpenPopup) return;

                fetch(window.location.href)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Произошла ошибка при выполнении запроса.');
                    }
                    return response.text();
                })
                .then((data) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
                    const card = doc.querySelector(`#product-${index + 1}`);
                    const popup = new Popup(card, counterInput.value);

                    window.isOpenPopup = true;
                    popup.open();
                    popup.handleClose();
                })
            });

            btnDecrease.addEventListener('click', () => {
                const value = Number(counterInput.value);
                
                if (value === 0) return;

                counterInput.setAttribute('value', value - 1);
            });

            btnIncrease.addEventListener('click', () => {
                const value = Number(counterInput.value);

                counterInput.setAttribute('value', value + 1);
            });
        })
    }

    handleCard () {
        const popup = document.querySelector('.popup');
        const btnDecrease = popup.querySelector('.counter__decrease');
        const btnIncrease = popup.querySelector('.counter__increase');
        const counterInput = popup.querySelector('.counter__input');
        const card = popup.querySelector('.product-card');
        const cardId = card.getAttribute('id');
        const btnAddToCard = popup.querySelector('.product-card__add-to-cart');

        counterInput.setAttribute('value', this.count);

        btnDecrease.addEventListener('click', () => {
            const value = Number(counterInput.value);
            
            if (value === 0) return;

            this.count = value - 1;
            counterInput.setAttribute('value', this.count);

            const mainCard = document.querySelector(`#${cardId}`);
            const mainCounter = mainCard.querySelector('.counter__input');
            mainCounter.setAttribute('value', this.count);
        });

        btnIncrease.addEventListener('click', () => {
            const value = Number(counterInput.value);

            this.count = value + 1;
            counterInput.setAttribute('value', this.count);

            const mainCard = document.querySelector(`#${cardId}`);
            const mainCounter = mainCard.querySelector('.counter__input');
            mainCounter.setAttribute('value', this.count);
        });

        btnAddToCard.addEventListener('click', () => { 
            this.addToCart({ id: cardId, count: Number(this.count) }) 
        });
    }

    addToCart (newItem) {
        if (!window.inCart) {
            window.inCart.push(newItem);
            localStorage.setItem('inCart', JSON.stringify(window.inCart));
            this.countInCart(window.inCart);
            return;
        }

        const existingItem = window.inCart.find((item) => item.id === newItem.id);

        if (existingItem) {
          existingItem.count = newItem.count;
        } else {
          window.inCart.push(newItem);
        }

        localStorage.setItem('inCart', JSON.stringify(window.inCart));
        this.countInCart(window.inCart);
    }

    countInCart (items) {
        let total = 0;

        items.forEach((item) => {
            total += item.count;
        });

        document.querySelector('.cart-count').textContent = total;
    }

    cardData () {
        window.inCart.forEach((item) => {
            const card = document.querySelector(`#${item.id}`);
            const input = card.querySelector('.counter__input');

            input.setAttribute('value', item.count);
        });
    }
}
class Popup {
    constructor (card, count) {
        this.card = card;
        this.cardId = this.card.getAttribute('id');
        this.count = count;
    }

    open () {
        const divOverlay = document.createElement('div');
        divOverlay.className = 'overlay';
        const divPopup = document.createElement('div');
        divPopup.className = 'popup';
        const btnClose = document.createElement('button');
        btnClose.className = 'popup__close-btn';
        btnClose.textContent = 'X';

        divPopup.append(this.card, btnClose);
        divOverlay.append(divPopup);
        document.body.append(divOverlay);

        const description = this.card.querySelector('.product-card__description');
        description.removeAttribute('hidden');

        const addToCardBtn = this.card.querySelector('.product-card__add-to-cart');
        addToCardBtn.textContent = 'Добавить в корзину';

        const cardId = this.card.getAttribute('id')
        new Card(`#${cardId}`, { 
            isSingleCard: true,
            count: this.count
        });
    }

    handleClose () {
        const closeBtn = document.querySelector('.popup__close-btn');
        closeBtn.addEventListener('click', () => { this.close() });
    }

    close () {
        const popup = document.querySelector('.overlay');
        popup.remove();
        window.isOpenPopup = false;
    }
}

new Card ('.product-card', { isSingleCard: false });