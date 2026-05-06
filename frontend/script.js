// ---------- UPLOAD ----------
function uploadFile() {
    const file = document.getElementById("fileInput").files[0];

    let formData = new FormData();
    formData.append("file", file);

    fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadData(); // auto load after upload
    });
}


// ---------- LOAD DATA ----------
function loadData() {
    fetch("http://127.0.0.1:5000/data")
    .then(res => res.json())
    .then(data => {
        displayTable(data);
        loadColumns();
    });
}


// ---------- LOAD COLUMNS ----------
function loadColumns() {
    fetch("http://127.0.0.1:5000/columns")
    .then(res => res.json())
    .then(cols => {
        let colSelect = document.getElementById("columnSelect");
        let displaySelect = document.getElementById("displayColumn");

        colSelect.innerHTML = "";
        displaySelect.innerHTML = "<option value=''>All Columns</option>";

        cols.forEach(c => {
            colSelect.innerHTML += `<option value="${c}">${c}</option>`;
            displaySelect.innerHTML += `<option value="${c}">${c}</option>`;
        });
    });
}


// ---------- DISPLAY TABLE ----------
function displayTable(data) {
    let table = document.getElementById("dataTable");
    table.innerHTML = "";

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td>No Data Found</td></tr>";
        return;
    }

    let headers = Object.keys(data[0]);

    let headerRow = "<tr>";
    headers.forEach(h => headerRow += `<th>${h}</th>`);
    headerRow += "</tr>";

    table.innerHTML += headerRow;

    data.forEach(row => {
        let rowHtml = "<tr>";
        headers.forEach(h => {
            rowHtml += `<td>${row[h]}</td>`;
        });
        rowHtml += "</tr>";
        table.innerHTML += rowHtml;
    });
}


// ---------- FILTER ----------
function applyFilter() {
    let search = document.getElementById("searchInput").value;
    let column = document.getElementById("columnSelect").value;
    let value = document.getElementById("filterInput").value;
    let selected = document.getElementById("displayColumn").value;

    fetch(`http://127.0.0.1:5000/filter?search=${search}&column=${column}&value=${value}&selected=${selected}`)
    .then(res => res.json())
    .then(data => displayTable(data));
}


// ---------- AUTO SEARCH (🔥 NEW) ----------
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("searchInput").addEventListener("input", applyFilter);
});