function get_field_index(field) {
    return headers.indexOf(field);
}

let filter_data = {
    company: "",
    name: "",
    processor: "",
    camera: {
        from: "",
        to: ""
    },
    price: {
        from: "",
        to: ""
    }
}

let sort_data = [
    {
        field_index: -1,
        descend: false
    }, 
    {
        field_index: -1,
        descend: false
    }, 
    {
        field_index: -1,
        descend: false
    }, 
]

let header_types = {
    "Компания": "Строка", 
    "Название": "Строка", 
    "Процессор":"Строка" ,
    "Экран (Д)": "Число", 
    "Камера (МПикс)": "Число", 
    "Батарея (мАч)": "Число", 
    "Цена (руб)": "Число"
}


function compare_str(s1, s2, reverse) {
   
    if (reverse) {
        if (s1 > s2)
            return -1;
        if (s1 < s2)
            return 1;
        return 0;
    } else {
        if (s1 < s2)
            return -1;
        if (s1 > s2)
            return 1;
        return 0;
    }
}

function compare_num(n1, n2, reverse) {
    
    if (isNaN(n1)) {
        n1 = Infinity;
    }
    if (isNaN(n2)) {
        n2 = Infinity;
    }
    if (reverse) {
        return n2 - n1
    } else {
        return n1 - n2
    }
}


function get_compare_function() {
    // Возвращает функцию сравнения строк таблицы по трём параметрам
    let functions_list = [
        (data1, data2) => 0, 
        (data1, data2) => 0, 
        (data1, data2) => 0
    ];
    
    sort_data.forEach((el, i) => {
        if (el.field_index !== -1) { 
            let field = headers[el.field_index];
            if (header_types[field] == "Число") {
                functions_list[i] = (data1, data2) => compare_num(data1, data2, el.descend);
            } else if (header_types[field] == "Строка") {
                functions_list[i] = (data1, data2) => compare_str(data1, data2, el.descend);
            }
        }
    })
    
    return (row1, row2) => {
        let head_i1 = sort_data[0].field_index;
        let head_i2 = sort_data[1].field_index;
        let head_i3 = sort_data[2].field_index;
        return functions_list[0](row1[head_i1], row2[head_i1]) 
            || functions_list[1](row1[head_i2], row2[head_i2]) 
            || functions_list[2](row1[head_i3], row2[head_i3]);
    }
}


function get_sorted_filtered_data() {

    let data = table_data
    data = apply_filtering(data);
    data.sort(get_compare_function());
    return data;
}

function fill_table() {

    let data = get_sorted_filtered_data();

    let table = document.getElementsByClassName("main-table")[0];
    let tbody = table.getElementsByTagName("tbody")[0];
    data.forEach((data_row) => {
        let row = tbody.insertRow();
        data_row.forEach((data_cell) => {
            row.insertCell().innerHTML = data_cell;
        });
    });
}

function clear_table() {
    let table = document.getElementsByClassName("main-table")[0];
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}

function on_filter_change() {
    let f = document.forms["filter"];
    filter_data.company = f["company"].value;
    filter_data.name = f["name"].value;
    filter_data.processor = f["processor"].value;
    filter_data.camera.from = f["camFrom"].value;
    filter_data.camera.to = f["camTo"].value;
    filter_data.price.from = f["priceFrom"].value;
    filter_data.price.to = f["priceTo"].value;

    clear_table();
    fill_table();
}

function on_sort_change() {

    let f = document.forms["sort"];
    sort_data[0].field_index = +f["sortFirst"].value;
    sort_data[0].descend = f["descFirst"].checked;
    sort_data[1].field_index = +f["sortSecond"].value;
    sort_data[1].descend = f["descSecond"].checked;
    sort_data[2].field_index = +f["sortThird"].value;
    sort_data[2].descend = f["descThird"].checked;

    clear_table();
    fill_table();
    disableUsedSortOptions();
}


function set_filter_listeners() {
    let f = document.forms["filter"];
    for (let i in f.elements) {
        let el = f.elements[i];
        el.onchange = on_filter_change
    };
}

function set_sort_listeners() {

    let f = document.forms["sort"];
    for (let i in f.elements) {
        let el = f.elements[i];
        el.onchange = on_sort_change
    };
}

function apply_filtering(rows) {
    let res = [];  // Отфильтрованные строки
    for (let i in rows) {
        let el = rows[i];
        let company_ok = (!Boolean(filter_data.company)) || el[0].includes(filter_data.company);
        let name_ok = (!Boolean(filter_data.name)) || el[1].includes(filter_data.name);
        let processor_ok = (!Boolean(filter_data.processor)) || el[2].includes(filter_data.processor);
        
        let camFrom = filter_data.camera.from ? filter_data.camera.from: -Infinity;
        let camTo = filter_data.camera.to ? +filter_data.camera.to: Infinity;
        let priceFrom = filter_data.price.from ? filter_data.price.from: -Infinity;
        let priceTo = filter_data.price.to ? +filter_data.price.to: Infinity;
        let cam_ok =  el[4] >= camFrom && el[4] <= camTo;
        let price_ok =  el[6] >= priceFrom && el[6] <= priceTo;

        let is_ok = company_ok && name_ok && processor_ok && cam_ok && price_ok;
        if (is_ok) {
            res.push(el);
        }
    };
    return res;
}

function disableUsedSortOptions() {

    let f = document.forms["sort"];
    let options = [
        f["sortFirst"].getElementsByTagName("option"),
        f["sortSecond"].getElementsByTagName("option"),
        f["sortThird"].getElementsByTagName("option")
    ]
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < options[i].length; j++) {
            options[i][j].disabled = false;
        }
    }
    sort_data.forEach((el) => {
        if (el.field_index !== -1) {
            options[0][el.field_index + 1].disabled = true;
            options[1][el.field_index + 1].disabled = true;
            options[2][el.field_index + 1].disabled = true;
        }
    });
}

function clearFilter() {
    let f = document.forms["filter"];
    for (let i in f.elements) {
        let el = f.elements[i];
        el.value = ""
    };
    on_filter_change();
}

function clearSort() {
    let f = document.forms["sort"];
    f["sortFirst"].value = "-1"
    f["sortSecond"].value = "-1"
    f["sortThird"].value = "-1"
    f["descFirst"].checked = false;
    f["descSecond"].checked = false;
    f["descThird"].checked = false;
    on_sort_change();
}

document.addEventListener("DOMContentLoaded", () => {
    fill_table();
    set_filter_listeners();
    set_sort_listeners();
});