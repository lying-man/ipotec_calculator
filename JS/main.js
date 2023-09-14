"use strict";

//elems
const $inputsList = document.querySelectorAll(".input");
const $inputPrice = document.querySelector(".input-price");
const $inputFirstPay = document.querySelector(".input-firstPay");
const $priceRange = document.querySelector(".price-range");
const $priceRangeThumb = document.querySelector(".price-range-thumb");
const $firstPayBtns = document.querySelector(".btns-firstPay");
const $infoPrice = document.querySelector(".info-price");
const $inputTerms = document.querySelector(".input-terms");
const $termBtns = document.querySelector(".btns-terms");
const $inputProcent = document.querySelector(".input-procent");
const $btnIncProcent = document.querySelector(".up-procent");
const $btnDecProcent = document.querySelector(".down-procent");
const $resultBlock = document.querySelector(".result");
const $monthPayText = document.querySelector(".month-pay");
const $allProcentText = document.querySelector(".all-procent");
const $allDebtText = document.querySelector(".total-debt");
const $resultBtn = document.querySelector(".result-btn");
const $resultCopyBtns = document.querySelectorAll('[data-click="copy"]');
const $calcBlockInitial = document.querySelector(".calc-block-initial");
const $calcBlockInitialValue = document.querySelector(".info-procent-price");

const $alert = document.querySelector(".alert");
const $alertText = document.querySelector(".alert-text");

const alertMessages = [];
let isEmptyAlertMessages = true;

$resultBtn.addEventListener("click", calculateResultHandler);

function checkGlobalBtn() {

    if (!infoPriceValue) {
        setStateCalculateBtn("disable");
        return;
    }

    if (!checkInputTerms()) {
        setStateCalculateBtn("disable");
        return;
    }

    if (!checkInputProcent()) {
        setStateCalculateBtn("disable");
        return;
    }

    setStateCalculateBtn("enable");

}

function setStateCalculateBtn(status) {
    if (status === "disable") {
        $resultBtn.classList.add("disable");
        $resultBtn.setAttribute("disabled", "");
    } else {
        $resultBtn.classList.remove("disable");
        $resultBtn.removeAttribute("disabled");
    }
}

//copy values in result
$resultCopyBtns.forEach(el => el.addEventListener("click", handlerCopy));

function handlerCopy() {
    window.navigator.clipboard.writeText(this.textContent.trim());
    launchVisibilityAlert({ text: "Значение скопировано" });
}

//calculate result
function calculateResultHandler() {
    let startDebt = infoPriceValue;
    let termDebt = +$inputTerms.value;
    let { dataValue: termType } = selectTerms.getSelectedItem(); 
    let procentValue = +$inputProcent.value;

    let monthPay = 0;
    let totalProcent = 0;
    let totalDebt = 0;

    if (termType === "year") {
        monthPay = startDebt / (termDebt * 12);
        totalProcent = calculateTotalProcent(monthPay, procentValue, startDebt, termDebt);
        monthPay += totalProcent / (termDebt * 12);
        totalDebt = startDebt + totalProcent;
    } else {
        monthPay = startDebt / termDebt;
        let procentMonth = procentValue / 12 * termDebt;
        totalProcent = procentMonth * startDebt / 100;
        monthPay += totalProcent / termDebt;
        totalDebt = startDebt + totalProcent;
    }

    displayResults(monthPay, totalProcent, totalDebt, startDebt);
    window.scrollTo(0, 9999);
    
    launchVisibilityAlert({ text: "Рассчитано" });
}

//alert code
function launchVisibilityAlert(message) {
    alertMessages.push(message);
    if (isEmptyAlertMessages) setVisibilityAlert();
}

function setVisibilityAlert() {

    let currentMessage = alertMessages[0];
    isEmptyAlertMessages = false;

    $alertText.textContent = currentMessage.text;
    $alert.classList.add("active", "animate");

    setTimeout(() => {
        $alert.classList.remove("active");

        alertMessages.shift();
        if (alertMessages.length) {
            setTimeout(setVisibilityAlert, 500);
        } else {
            isEmptyAlertMessages = true;
        }

    }, 2300);

    setTimeout(() => $alert.classList.remove("animate"), 2600);

}

function calculateTotalProcent(monthPay, procent, startDebt, term) {

    let allProcent = 0;
    let yearPay = monthPay * 12;
    let restDebt = startDebt + yearPay;

    while (term > 0) {
        restDebt -= yearPay;
        allProcent += procent * restDebt / 100;
        term--;
    }

    return allProcent;

}

//display results
function displayResultsText(value, el) {
    value = value.toFixed(2);
    let dotIndex = value.indexOf(".");
    let firstPart = value.slice(0, dotIndex);
    let lastPart = value.slice(dotIndex);
    el.firstElementChild.textContent = formatInputNumbers(firstPart) + lastPart;
    el.lastElementChild.textContent = formatTextRuble(value);
}

function displayResults(monthPay, totalProcent, totalDebt, startDebt) {
    displayResultsText(monthPay, $monthPayText);
    displayResultsText(totalProcent, $allProcentText);
    displayResultsText(totalDebt, $allDebtText);
    generateChart(startDebt, totalProcent);
    $resultBlock.classList.add("show");
}

//chart
let chartElem = null;

function generateChart(debt, procent) {
    chartElem && chartElem.destroy();
    chartElem = null;
    let dataChart = [debt, procent];

    chartElem = new Chart(document.getElementById("chart-canvas"), {
        type: "pie",
        options: {
            plugins: {
                legend: {
                    onClick: () => { return },
                    align: "start",
                    labels: {
                        font: {
                            size: document.documentElement.offsetWidth <= 350 ? 14 : 18,
                            family: "Open Sans",
                        },
                        color: "#000",
                        boxHeight: 22,
                        padding: 14,
                    }
                }
            }
        },
        data: {
            labels: ["Долг без процентов", "Начисленные проценты"],
            datasets: [{ data: dataChart, backgroundColor: ["#3FC063", "#4778F5"] }]
        }
    });

}

//input procent functionallity
$inputProcent.addEventListener("input", inputProcentHandler);

$btnDecProcent.addEventListener("click", () => {
    let newValue = Number($inputProcent.value) - 1
    $inputProcent.value = newValue;
    if (!newValue) setClickableDecBtn("disable");
    checkGlobalBtn();
});

$btnIncProcent.addEventListener("click", () => {
    $inputProcent.value = Number($inputProcent.value || 0) + 1;
    setClickableDecBtn("enable");
    checkGlobalBtn();
});

function checkInputProcent() {
    let value = $inputProcent.value;
    if (!value.trim()) return false;
    if (value[0] === "0") return false;
    return true;
}

function inputProcentHandler() {

    if (!checkInputProcent()) {
        setClickableDecBtn("disable");
        checkGlobalBtn();
        return;
    }

    setClickableDecBtn("enable");
    checkGlobalBtn();

}

function setClickableDecBtn(status) {
    if (status === "disable") {
        $btnDecProcent.classList.add("disable");
        $btnDecProcent.setAttribute("disabled", "");
    } else {
        $btnDecProcent.classList.remove("disable");
        $btnDecProcent.removeAttribute("disabled", "");
    }
}

//input terms functionality
function checkInputTerms() {
    let value = $inputTerms.value;
    if (!value.trim()) return false;
    if (value[0] === "0") return false;
    if (Number(value) >= 100) return false;
    return true;
}

$termBtns.addEventListener("click", termHandler);
$inputTerms.addEventListener("input", inputTermsHandler);

function termHandler(e) {
    if (e.target.matches(".btn-item")) {
        $inputTerms.value = e.target.dataset.value;
        checkGlobalBtn();
    }
}

function inputTermsHandler() {
    checkGlobalBtn();
}

//calculate initial price functionallity
let infoPriceValue = null;
let infoPriceText = "Будет рассчитано";

$inputPrice.addEventListener("input", (e) => {
    e.target.value = formatInputNumbers(e.target.value);
    calculateStartDebt();
});

$inputFirstPay.addEventListener("input", (e) => {
    e.target.value = formatInputNumbers(e.target.value);
    calculateStartDebt();
});

function calculateStartDebt() {

    let resultCheckInputPrice = checkInputPrice();
    if (!resultCheckInputPrice) {
        setStateInfoPrice("reset");   
        calculateInitialPriceProcent("reset");
        return;
    }

    let resultCheckInputFirstPay = checkInputFirstPay();
    if (!resultCheckInputFirstPay) {
        setStateInfoPrice("reset");
        calculateInitialPriceProcent("reset");
        return;
    }

    let { dataValue } = selectFirstPay.getSelectedItem();
    let inputPriceValue = Number($inputPrice.value.replaceAll(" ", ""));
    let inputFirstPayValue = Number($inputFirstPay.value.replaceAll(" ", ""));

    if (dataValue === "procent") {
        let sum = inputFirstPayValue * inputPriceValue / 100;
        let diffProcentSum = sum;
        sum = inputPriceValue - sum;
        sum = sum.toFixed(2);
        setStateInfoPrice("calc", sum);
        calculateInitialPriceProcent("calc", inputFirstPayValue, diffProcentSum);
    } else {
        let sum = inputPriceValue - inputFirstPayValue;
        sum = sum.toFixed(2);
        setStateInfoPrice("calc", sum);
        calculateInitialPriceProcent("reset");
    }

}

function checkInputPrice() {
    let valueNoSpaces = $inputPrice.value.replaceAll(" ", "");
    let numberedValue = Number(valueNoSpaces);
    if (!valueNoSpaces.trim()) return false;
    if (valueNoSpaces[0] === "0") return false;
    if (numberedValue > 15000000) return false;
    return true;
}

function checkInputFirstPay() {

    let valueNoSpaces = $inputFirstPay.value.replaceAll(" ", "");
    let numberedValue = Number(valueNoSpaces);

    if (!valueNoSpaces.trim()) return false;
    if (valueNoSpaces[0] === "0") return false;

    let { dataValue } = selectFirstPay.getSelectedItem();

    if (dataValue === "procent") {
        if (numberedValue > 100) return false;
    }

    if (numberedValue >= Number($inputPrice.value.replaceAll(" ", ""))) return false;

    return true;

}

function setStateInfoPrice(status, value) {
    if (status === "calc") {
        let dotIndex = value.indexOf(".");
        let firstPart = value.slice(0, dotIndex);
        let lastPart = value.slice(dotIndex);
        $infoPrice.textContent = formatInputNumbers(firstPart) + lastPart + formatTextRuble(value);
        infoPriceValue = Number(value);
        $infoPrice.classList.add("calculated");
    } else {
        $infoPrice.textContent = infoPriceText;
        infoPriceValue = null;
        $infoPrice.classList.remove("calculated");
    }
    checkGlobalBtn();
}

function calculateInitialPriceProcent(status, procent, sum) {
    if (status === "calc") {
        sum = sum.toFixed(2);

        let indexComma = sum.indexOf(".");
        let numPart = sum.slice(0, indexComma);
        let commaPart = sum.slice(indexComma);

        numPart = formatInputNumbers(numPart);
        let rubleWord = formatTextRuble(commaPart);

        $calcBlockInitialValue.textContent = `${procent}% ~ ${numPart + commaPart} ${rubleWord}`;

        $calcBlockInitial.classList.add("calculated");
        $calcBlockInitialValue.classList.add("active");
    } else {
        $calcBlockInitial.classList.remove("calculated");
        $calcBlockInitialValue.classList.remove("active");
    }
}

//first pay
$firstPayBtns.addEventListener("click", firstPayHandler);

function firstPayHandler(e) {

    if (e.target.matches(".btn-item-firstPay")) {
        $inputFirstPay.value = e.target.dataset.value;
        selectFirstPay.selectItem(2);
        calculateStartDebt();
        $inputFirstPay.value = formatInputNumbers($inputFirstPay.value);
    }

}

//setup range
$priceRangeThumb.addEventListener("pointerdown", startMoveRange);
$priceRangeThumb.addEventListener("pointerup", cancelMoveRange);

let maxPrice = 15000000;
let maxWidthPrice = $inputPrice.offsetWidth  - $priceRangeThumb.offsetWidth;
let offsetPriceLeft = $priceRange.getBoundingClientRect().left;
let clickCordX = null;
let step = maxWidthPrice / 15;

let arrSteps = generateSteps(step);

function generateSteps(step) {
    let initialValue = 0 - step;
    let arr = [];
    while (initialValue <= maxWidthPrice) {
        initialValue += step;
        arr.push(initialValue);
    }
    return arr;
}

function startMoveRange(e) {

    clickCordX = e.clientX - this.getBoundingClientRect().left;
    this.setPointerCapture(e.pointerId);
    this.addEventListener("pointermove", moveRange);
    this.classList.add("active");
    
}

function moveRange(e) {
    let offset = e.clientX - offsetPriceLeft - clickCordX;

    if (offset < 0) offset = 0;
    if (offset > maxWidthPrice) offset = maxWidthPrice;

    displayValueStep(offset, arrSteps);
    $inputPrice.value = formatInputNumbers($inputPrice.value);

    this.style.left = offset + "px";
}

function cancelMoveRange() {
    calculateStartDebt();
    this.removeEventListener("pointermove", moveRange);
    this.classList.remove("active");
}

function displayValueStep(offset, arr) {

    if (offset === maxWidthPrice) $inputPrice.value = 15000000;

    let index = arr.length - 1;

    while (index >= 0) {
        if (offset > arr[index]) {
            $inputPrice.value = index * 1000000;
            return;
        }
        index--;
    }

}

//setup inputs digit
$inputsList.forEach(el => {

    let allowCodes = ["Backspace", "ArrowRight", "ArrowLeft", "Tab"];

    el.addEventListener("keydown", (e) => {
        
        let { code, key } = e;

        let isDigit = key >= 0 & key <= 9;
        let isAllowCode = allowCodes.includes(code);

        if (code === "Space") e.preventDefault();
        if (!isDigit && !isAllowCode) e.preventDefault();

    })

});

//initialize selects
let itemsFirstPay = [
    { value: "В рублях", id: 1, dataValue: "ruble" },
    { value: "В процентах", id: 2, dataValue: "procent" },
];

let selectFirstPay = new Select(".dropdown-first-pay", { placeholder: " ", items: itemsFirstPay, selected: 1 });

let itemsTerms = [
    { value: "Лет", id: 1, dataValue: "year" },
    { value: "Месяцев", id: 2, dataValue: "month" },
];

let selectTerms = new Select(".dropdown-terms", { placeholder: " ", items: itemsTerms, selected: 1 });

selectFirstPay.addCallback(calculateStartDebt);

//utils
function formatInputNumbers(value) {
    value = value.replaceAll(" ", "");
    let valueLength = String(value.length);
    if (numbersNoSpaces.includes(valueLength) || value[0] === "0") {
        value = value.trim();
        return value;
    }
    return numbersFormatFns[valueLength](value);
}

const numbersNoSpaces = ["3", "2", "1", "0"];

function insertSpaces(arrPositions, value) {
    let arr = value.split("");
    for (let position of arrPositions) arr.splice(position, 0, " ");
    return arr.join("");
}

const numbersFormatFns = {
    "8": (value) => insertSpaces([2, 6], value),
    "7": (value) => insertSpaces([1, 5], value),
    "6": (value) => insertSpaces([3], value),
    "5": (value) => insertSpaces([2], value),
    "4": (value) => insertSpaces([1], value)
};

let numberFormatList = [2, 3, 4];

function formatTextRuble(number) {
    let lastNum = String(number);
    lastNum = +lastNum[lastNum.length - 1];
    if (numberFormatList.includes(lastNum)) return " рубля";
    return " рублей"
}



