document.addEventListener('DOMContentLoaded', async () => {
    try {
        let list = await load();
        listToTable(filter(list, true), '.container');
    } catch (error) {
        throw new Error(error);
    }

})

async function load() {
    let response = await fetch('http://localhost:63342/RegexPractice/Tables/small.csv');
    if (!response.ok) throw new Error(response.statusText);
    let text = await response.text();

    // return createListBySplit(text);
    console.log(createListByRegex(text));
    return createListByRegex(text);
};

let printList = function (list) {
    let pre = document.createElement('pre');
    for(let city of list) {
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
    for(let match of matches) {
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

function filter(list, showRegion = false, showCity = false) {
    if(showRegion) {
        let filteredList = list.filter(item => {
            return item.code2 == '000' && item.code3 == '000' && item.code4 == '000' && item.levelCity == '1';
        });
        return filteredList;
    }

    if(showCity) {
        let filteredList = list.filter(item => {
            return item.code4 != '000' && item.levelCity == '2';
        })
        return filteredList;
    }
}
function listToTable(list, className) {
    let table = document.createElement('table');
    table.setAttribute('class', 'table')
    let tHead = document.createElement('thead');
    let tBody = document.createElement('tbody');
    table.appendChild(tHead);
    table.appendChild(tBody);


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


    for(let item of list) {
        // console.log(item.code);

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

    let tableBlock = document.querySelector(className);
    tableBlock.appendChild(table);


}

let inputRegion = document.querySelector('#region');
inputRegion.oninput = () => {
    let rows = document.getElementsByTagName('tr');
    if(inputRegion.value.length < 3) {
        for(let row of rows) {
            row.classList.remove('hidden');
        }
    };

    for(let row of rows) {
        let rowContent = row.cells.item(2).textContent;
        if (!rowContent.includes(inputRegion.value)) row.classList.add('hidden');
    }
};



