let activeElement = null;
let list = null;


document.addEventListener('DOMContentLoaded', async () => {
    list = await load();
    displayTable(filter(list, null, true, false), 'regionTable');
});

async function load() {
    let response = await fetch('http://localhost:63342/JsRegexPracticeJs/Tables/small.csv');
    if (!response.ok) throw new Error(response.statusText);
    let text = await response.text();

    // return createListBySplit(text);
    return createListByRegex(text);
};

let printList = function (list) {
    let pre = document.createElement('pre');
    for (let city of list) {
        let p = document.createElement('p');
        p.textContent = city.code + ' ' + city.levelCity + ' ' + city.nameCity;
        pre.appendChild(p);
    }
    document.querySelector('.container').appendChild(pre);
}

function createListBySplit(text) {
    let list = [];
    text.split(/\n/).forEach(string => {
        let splitString = string.replace(/\"/g, '').split(';');
        list.push({
            code1: splitString[0],
            code2: splitString[1],
            code3: splitString[2],
            code4: splitString[3],
            code: splitString[0] + ' ' + splitString[1] + ' ' + splitString[2] + ' ' + splitString[3],
            levelCity: splitString[5],
            nameCity: splitString[6]
        });
    });
    return list;
}

function createListByRegex(text) {
    let list = [];
    const regex = /(?<code1>\d+)";"(?<code2>\d+)";"(?<code3>\d+)";"(?<code4>\d+)";"\d+";"(?<lvl>\d+)";"(?<name>.*?)"/g;
    let matches = text.matchAll(regex);
    for (let match of matches) {
        let {code1, code2, code3, code4, lvl, name} = match.groups;
        list.push({
            code1: code1,
            code2: code2,
            code3: code3,
            code4: code4,
            code: code1 + ' ' + code2 + ' ' + code3 + ' ' + code4,
            levelCity: lvl,
            nameCity: name
        });
    }
    return list;
}

function filter(list, currentElement, showRegion, showCity) {
    if (currentElement)
        if (showRegion && currentElement) {
            let elementCode1 = currentElement[0];    //Убрать, принимать как параметр
            let filteredList = list.filter(item => {
                return item.code1 == elementCode1
                    && item.code2 != '000'
                    && item.code4 == '000'
                    && item.levelCity == '1';
            });
            return filteredList;
        }

    if (showCity && currentElement) {
        let elementCode2 = currentElement[1];
        let elementCode3 = currentElement[2];

        let filteredList = list.filter(item => {
            return item.code2 == elementCode2
                && item.code3 == elementCode3
                && item.code4 != '000'
                && item.levelCity == '2';
        })
        return filteredList;
    }
    return list.filter(item => {
        return item.code2 == '000' && item.levelCity == '1';
    })
}


function displayTable(currentList, tableName) {


    if (tableName == 'regionTable') {
        let currentTable = createTable(currentList, tableName);
        let regionBlock = document.querySelector('.region');
        regionBlock.appendChild(currentTable);
        regionBlock.addEventListener('click', event => {
            let selectedRow = event.target.closest('tr');

            if (!selectedRow) return;
            if (activeElement) {
                activeElement.classList.remove('active');
                //Проверяется, что активный элемент - это регион
                if (selectedRow.parentElement.parentElement.classList.contains('regionTable')) {
                    let subTable = document.querySelector('.subTable');
                    if (subTable) {
                        subTable.parentElement.remove();
                        subTable.remove();
                    }
                }
            }
            activeElement = selectedRow;
            activeElement.classList.add('active');
            displaySubTable(activeElement);


        });
    }

    if (tableName == 'cityTable') {
        let cityTable = document.querySelector('.cityTable');
        if (cityTable) cityTable.remove();
        let currentTable = createTable(currentList, tableName);
        let cityBlock = document.querySelector('.city');
        cityBlock.appendChild(currentTable);
    }
}

function createTable(tableList, tableName) {
    let table = document.createElement('table');
    table.classList.add(tableName);
    let tHead = document.createElement('thead');
    table.appendChild(tHead);

    let headerCode = document.createElement('th');
    headerCode.innerHTML = 'Code';
    let headerLvl = document.createElement('th');
    headerLvl.innerHTML = 'Level';
    let headerName = document.createElement('th');
    headerName.innerHTML = 'Name';

    let tableRowHeaders = document.createElement('tr');
    tableRowHeaders.appendChild(headerCode);
    tableRowHeaders.appendChild(headerLvl);
    tableRowHeaders.appendChild(headerName);
    tHead.appendChild(tableRowHeaders);

    let tBody = document.createElement('tbody');
    table.appendChild(tBody);


    for (let item of tableList) {
        let tableDataCode = document.createElement('td');
        tableDataCode.innerHTML = item.code;
        let tableDataLvl = document.createElement('td');
        tableDataLvl.innerHTML = item.levelCity;
        let tableDataName = document.createElement('td');
        tableDataName.innerHTML = item.nameCity;

        let tableRow = document.createElement('tr');
        tableRow.appendChild(tableDataCode);
        tableRow.appendChild(tableDataLvl);
        tableRow.appendChild(tableDataName);

        tBody.appendChild(tableRow);
    }
    return table;
}


function displaySubTable(selectedElement) {
    let subTable = document.querySelector('.subTable');

    if (!subTable) {
        let subTableList = filter(list, selectedElement.firstChild.textContent.split(' '), true, false);
        if (subTableList.length == 0) return;

        subTable = createTable(subTableList, 'subTable');
        let row = document.createElement('tr');
        let td = document.createElement('td');
        td.colSpan = 3;
        td.appendChild(subTable);
        row.appendChild(td);
        selectedElement.insertAdjacentElement('afterend', row);
    }

    subTable.addEventListener('click', event => {
        console.log('ok');
        let selectedDistrict = event.target.closest('tr');
        if (!selectedDistrict) return;
        let filteredList = filter(list, selectedDistrict.firstChild.textContent.split(' '), false, true);
        let cityTable = document.querySelector('.cityTable');
        if (cityTable) {
            cityTable.remove();
        }
        if (filteredList.length == 0) return;

        displayTable(filteredList, 'cityTable');
    });
}

let inputRegion = document.querySelector('#region');
inputRegion.oninput = () => {
    let regionTable = document.querySelector('.regionTable');
    let rows = regionTable.getElementsByTagName('tr');
    if (inputRegion.value.length < 3) {
        for (let row of rows) {
            row.classList.remove('hidden');
        }
    } else {
        for (let row of rows) {
            let rowContent = row.cells[2].textContent;
            if (!rowContent.includes(inputRegion.value)) row.classList.add('hidden');
        }
    }

};

let inputCity = document.querySelector('#city');
inputCity.oninput = () => {
    let cityTable = document.querySelector('.cityTable');
    if (!cityTable) return;
    let rows = cityTable.getElementsByTagName('tr');
    if (inputCity.value.length < 3) {
        for (let row of rows) {
            row.classList.remove('hidden');
        }
    } else {
        let counter = 0;
        for (let row of rows) {
            if (counter == 20) break;
            let rowContent = row.cells.item(2).textContent;
            if (!rowContent.includes(inputCity.value)) row.classList.add('hidden');
        }
    }
}

// function displayFilterInfo(rows, activeInput) {
//     if(checkInput(rows, activeInput.value.length)) hideMismatches(rows, activeInput.value)
// }
// function checkInput(rows, inputValueLength) {
//     if(inputValueLength < 3) {
//         for(let row of rows) {
//             row.classList.remove('hidden');
//         }
//     }
//     else return false;
// }
// function hideMismatches(rows, inputName) {
//     for(let row of rows) {
//         let rowContent = row.cells[2].textContent;
//         if(!rowContent.includes(inputName.value)) row.classList.add('hidden');
//     }
// }





