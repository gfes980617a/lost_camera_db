var db;
var db_file = "/lost_camera_db/database.sqlite";

function sql_string() {
    var sql = "SELECT `brand`, `model`, `sn`, `date`, `ref`, `href` FROM \`main\` WHERE 1 ";
    Array.from(document.getElementsByClassName("input")).forEach(element => {
        if (element.value) {
            sql += `\nAND \`${element.id}\` LIKE '%${element.value}%' `
        }
    })
    sql += `\nORDER BY \`${document.getElementById("search_sort_by").value}\` ${document.getElementById("search_sort").value}`;
    if (document.getElementById("search_limit").value != '0')
        sql += `\nLIMIT ${document.getElementById("search_limit").value}`;
    sql += ";";
    document.getElementById("sql_code").value = sql;
    return sql;
}
function search_exec() {
    function append_table(row) {
        let tr = "<tr>";
        tr += `<td>${row["brand"]}</td>`;
        tr += `<td>${row["model"]}</td>`;
        tr += `<td>${row["sn"]}</td>`;
        tr += `<td>${row["date"]}</td>`;
        tr += `<td><a href="${row["href"]}">${row["ref"]}</a></td>`;
        tr += "</tr>";
        return tr;
    }
    var sql = document.getElementById("sql_code").value;
    // count ;
    document.getElementById("db_search_count").innerHTML =
        db.exec("SELECT count() " + sql.substring(sql.indexOf("FROM")))[0].values[0][0];
    // result    
    var stmt = db.prepare(sql);
    let tbody = document.getElementById("db_search_body");
    tbody.innerHTML = "";
    while (stmt.step()) {
        tbody.innerHTML += append_table(stmt.getAsObject());
    }
}
function init_sqldb() {
    if (document.getElementById("lost_camera_db") == undefined)
        return 0;
    function make_table(div_id) {
        db_div = document.getElementById(div_id);
        db_div.innerHTML += `
            <h2>遺失器材(相機/鏡頭/配件)序號列表</h2>
            <div id=\"db_load\">
                <a href=\"https://github.com/gfes980617a/lost_camera_db\" target=\"_blank\">原始碼+資料庫@github</a>
                <div id='db_status'>載入中......</div>
            </div>
            <form onsubmit="return false"><table border='1'>
                <thead>
                    <tr onkeyup='sql_string()'>
                        <td style='width:10%'>品牌 = <input type='text' class='search input' id='brand'></td>
                        <td style='width:10%'>名稱 = <input type='text' class='search input' id='model'></td>
                        <td style='width:10%'>序號 = <input type='text' class='search input' id='sn'></td>
                        <td style='width:10%'>日期 = <input type='text' class='search input' id='date'></td>
                        <td style='width:10%'>來源 = <input type='text' class='search input' id='ref'></td>
                    </tr>
                    <tr>
                        <td colspan='2' onchange='sql_string()'>
                            按照<select id="search_sort_by" class='search'>
                                <option value="brand">品牌</option>
                                <option value="model">名稱</option>
                                <option value="sn">序號</option>
                                <option value="date" selected>日期</option>
                                <option value="ref">來源</option>
                            </select>
                            排序<select id="search_sort" class='search'>
                                <option value="ASC">小到大</option>
                                <option value="DESC" selected>大到小</option>
                            </select>，
                            單頁顯示<select id="search_limit" class='search'>
                                <option value="1">1</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="0" selected>All</option>
                            </select>筆資料；
                        </td>
                        <td colspan='2'>
                            <input onchange='{Array.from(document.getElementsByClassName("search")).forEach(element => {element.disabled ^= true;});}' type='checkbox' id='search_dev'><label for='search_dev'>‼進階模式‼</label>
                            <textarea id='sql_code' rows='2' cols="80" class='search'  disabled></textarea>
                        </td>
                        <td>
                            <input type='submit' onclick='search_exec()' value='Search'/>
                            找到<span id='db_search_count'>??</span>個項目
                        </td>
                    </tr>
                </thead>
                <tbody id='db_search_body'></tbody>
            </table></form>`;
    }
    make_table("lost_camera_db");
    var script = document.createElement("script");
    script.src = "/lost_camera_db/sql.js";
    script.onload = () => {
        initSqlJs().then(function (SQL) {
            if (db_div.getAttribute("db_file")) {
                db_file = db_div.getAttribute("db_file");
            }
            fetch(db_file, { mode: 'no-cors' }).then(function (response) {
                return response.arrayBuffer();
            }).then(function (response) {
                db = new SQL.Database(new Uint8Array(response));
                const db_date = db.exec("SELECT `date` FROM `main` WHERE `ref`='我'")[0].values[0][0];
                const db_count = db.exec("SELECT count() FROM `main`")[0].values[0][0];
                document.getElementById("db_status").innerHTML = `最後更新時間${db_date}共${db_count}筆資料`;
                sql_string();
            });
        });
    };
    window.document.head.appendChild(script);
};
init_sqldb();
