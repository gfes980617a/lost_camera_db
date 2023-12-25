var dev_mode = true;
var db;
var db_file = "/lost_camera_db/database.sqlite";
var search_opt = { "fast": false };
function make_table(div_id) {
    db_div = document.getElementById(div_id);
    db_div.innerHTML += `
    <h2>遺失器材(相機/鏡頭/配件)序號列表</h2>
    <div id=\"db_load\">
        <a href=\"https://github.com/gfes980617a/lost_camera_db\" target=\"_blank\">原始碼+資料庫@github</a>
        <div id='db_status'>載入中......</div>
    </div>
    <form><table align='center' border='1' style='text-align:center;'>
        <thead>
            <tr><td>品牌</td><td>名稱</td><td>序號</td><td>日期</td><td>來源</td></tr>
            <tr onchange='{if(!search_opt.fast)search_exec()}' onkeyup='{if(search_opt.fast)search_exec()}'>
                <td style='width:25%'><input type='text' class='search' id='brand' disabled></td>
                <td style='width:25%'><input type='text' class='search' id='model' disabled></td>
                <td style='width:25%'><input type='text' class='search' id='sn' disabled></td>
                <td style='width:25%'><input type='text' class='search' id='date' disabled></td>
                <td style='width:25%'><input type='text' class='search' id='ref' disabled></td>
            </tr>
            <tr>
                <td colspan='4'>
                    <input type='checkbox' id='search_fast' onclick='search_option()' checked disabled><label for='search_fast'>不用按ENTER的快速搜尋模式，顯示大量資料時請小心使用</label><br>
                    <input type='checkbox' id='search_xxx' disabled><label for='search_fast'>xxx模式</label><br>
                </td>
                <td><input id='db_search_button' type='button' onclick='search_exec()' value='Search' disabled/></td>
            </tr>
            <tr>
                <td colspan='4'><code id='sql_code'>SELECT * FROM \`main\` WHERE 1</code></td>
                <td>找到<span id='db_search_count'>??</span>個項目</td>
            </tr>
        </thead>
        <tbody id='db_search_body'></tbody>
    </table></form>`;
}
function search_option() {
    search_opt["fast"] = document.getElementById("search_fast").checked;
    // search_opt["fast"] = document.getElementById("search_fast").checked;
}
function search_exec() {
    function append_table(row) {
        let tr = "<tr>";
        tr += "<td>" + row["brand"] + "</td>";
        tr += "<td>" + row["model"] + "</td>";
        tr += "<td>" + row["sn"] + "</td>";
        tr += "<td>" + row["date"] + "</td>";
        tr += "<td><a href=\"" + row["href"] + "\">" + row["ref"] + "</a></td>";
        tr += "</tr>";
        return tr;
    }
    function sql_string() {
        var sql = "SELECT * FROM \`main\` WHERE 1 \n";
        Array.from(document.getElementsByClassName("search")).forEach(element => {
            if (element.value) { // if input not null, add to sql
                sql += `AND \`${element.id}\` like '%${element.value}%' `
            }
        })
        sql += "\nORDER BY \`date\` DESC; ";
        return sql;
    }
    var count = db.exec(sql_string().replace("*", "count()"))[0].values[0][0];
    document.getElementById("db_search_count").innerHTML = count;

    var stmt = db.prepare(sql_string());
    document.getElementById("sql_code").innerHTML = stmt.getSQL().replace("\n\n", "\n").replaceAll("\n", "<br>");
    let tbody = document.getElementById("db_search_body");
    tbody.innerHTML = "";
    while (stmt.step()) {
        tbody.innerHTML += append_table(stmt.getAsObject());
    }
}
function init_sqldb() {
    if (document.getElementById("lost_camera_db") == undefined)
        return 0;
    make_table("lost_camera_db");
    var script = document.createElement("script");
    script.src = "/lost_camera_db/sql.js";
    script.onload = () => {
        initSqlJs().then(function (SQL) {
            if (db_div.getAttribute("db_file")) {
                db_file = db_div.getAttribute("db_file");
            }
            console.log("db file:", db_file);
            fetch(db_file, { mode: 'no-cors' }).then(function (response) {
                return response.arrayBuffer();
            }).then(function (response) {
                db = new SQL.Database(new Uint8Array(response));

                const db_date = db.exec("SELECT `date` FROM `main` WHERE `ref`='我'")[0].values[0][0];
                const db_count = db.exec("SELECT count() FROM `main`")[0].values[0][0];
                document.getElementById("db_status").innerHTML = "最後更新時間" + db_date + " 共" + db_count + "筆資料";
                console.log("db status:", db_date, ",", db_count);

                Array.from(document.getElementsByTagName("input")).forEach(element => {
                    element.disabled ^= true;
                });
                search_option();
                // search_exec();
            });
        });
    };
    window.document.head.appendChild(script);
};
init_sqldb();