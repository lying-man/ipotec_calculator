
"use strict";

function getSelectElems(options) {
    
    let placeholder = (options.placeholder === "") ? "Placeholder по умолчанию" : options.placeholder;

    return `

            <div class="select-wrapper" data-select="startTab" tabindex="0">
                <div class="select-inner" data-select="inner">
                    <span class="select-text">${placeholder}</span>
                    <span class="select-icon"></span>
                </div>
                <div class="select-dropdown">
                    <ul class="select-list">
                        ${this.addItems(options.items)}
                    </ul>
                </div>
            </div>

    `;

}

class Select {

    constructor(selector, options) {

        this.itemsSelect = options.items;
        this.$el = document.querySelector(selector);
        this.$el.insertAdjacentHTML("afterbegin", getSelectElems.call(this, options));
        this.$textSelect = this.$el.querySelector(".select-text");
        this.$wrapSelect = this.$el.querySelector('[data-select="startTab"]');
        this.$lastItem = this.$el.querySelectorAll(".select-list-item");
        this.$lastItem = this.$lastItem[this.$lastItem.length - 1];
        this.selectedItem = options.selected ? options.items[options.items.selected] : null;
        this.callbacks = [];

        if (options.selected !== "") this.selectItem(options.selected);

        this.setControls();

    }

    setControls() {

        this.functionControl = this.control.bind(this);
        this.functionChooseElems = this.chooseSelectElems.bind(this);
        this.$el.addEventListener("click", this.functionControl);
        document.addEventListener("keydown", this.functionChooseElems);

        //close dropdown by other elem click
        document.documentElement.addEventListener("click", (e) => {
            let clickSelect = e.target;
            if (!clickSelect.closest("." + this.$el.className.split(" ")[0]) && this.$el.classList.contains("select--open")) this.close();
        });

    }

    control(event) {

        let { target } = event;

        //open & close select
        let inner = target.closest('[data-select="inner"]');

        if (inner) {
            this.$el.classList.contains("select--open") ? this.close() : this.open();
            return;
        }

        //choose item in select
        let item = target.dataset.select;

        if (item === "item") this.selectItem(target.dataset.id);

    }

    open() {
        this.$el.classList.add("select--open");
    }

    close() {
        this.$el.classList.remove("select--open");
    }

    selectItem(id) {

        let items = this.$el.querySelectorAll(".select-list-item");

        let elem = Array.from(items).find(el => el.dataset.id === String(id));
        if (elem === undefined) return;

        for (let item of items) { 
            item.classList.remove("select--checked");
        }

        this.callbackSelect(id);
        elem.classList.add("select--checked");
        this.$textSelect.textContent = elem.textContent;
        this.close();

    }

    addItems(elems) {

        let arrElems = elems.map(el => {

            return `<li class="select-list-item" tabindex="0" data-select="item" data-id="${el.id}">${el.value}</li>`;

        });

        return arrElems.join("");

    }

    chooseSelectElems(event) {

        let { code } = event;
        let currentElem = document.activeElement;
        let parentCurrentElem = currentElem.parentElement;

        if (code === "Enter" && currentElem.dataset.select === "startTab" && parentCurrentElem === this.$el) {
            this.$el.classList.contains("select--open") ? this.close() : this.open();
            return;
        }

        if (code === "Enter" && currentElem.classList.contains("select-list-item")) {
            this.selectItem(currentElem.dataset.id);
        }

        if (code === "Tab" && currentElem === this.$lastItem) setTimeout(function() {this.$wrapSelect.focus()}.bind(this), 0);

    }

    callbackSelect(id) {

        let elem = this.itemsSelect.find((elem) => elem.id === Number(id));
        this.selectedItem = elem;
        if (this.callbacks) {
            for (let cb of this.callbacks) cb(elem);
        }
        // console.log(elem)

    }

    getSelectedItem() { return this.selectedItem }

    addCallback(cb) { this.callbacks.push(cb); }

    destroy() {

        this.$el.removeEventListener("click", this.functionControl);
        document.removeEventListener("keydown", this.functionChooseElems);
        this.$el.innerHTML = "";
        
        for (let prop in this) {
            delete this[prop];
        }

    }

}