var db;
var db_div = document.getElementById("lost_camera_db");
var db_file = "/lost_camera_db/database.sqlite";
function init_sqljs() {
    initSqlJs().then(function (SQL) {
        document.getElementById("db_load_button").value = "載入中...";
        document.getElementById("db_load_button").disabled = true;
        const xhr = new XMLHttpRequest();
        if (db_file = db_div.getAttribute("db_file"));
        console.log("load db_file:", db_file);
        xhr.open('GET', "/lost_camera_db/database.sqlite", true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = e => {
            const uInt8Array = new Uint8Array(xhr.response);
            db = new SQL.Database(uInt8Array);
            document.getElementById("db_date").innerHTML = db.exec("SELECT `date` FROM `main` WHERE `ref`='我'")[0].values[0][0];
            document.getElementById("db_count").innerHTML = db.exec("SELECT count() as 'count' FROM `main`")[0].values[0][0];
            Array.from(document.getElementsByClassName("search")).forEach(element => {
                element.disabled ^= true;
            });
            document.getElementById("db_load_button").value = "資料庫ok!";
        };
        xhr.send();
    });
}
function make_table(div_id) {
    db_div = document.getElementById(div_id);
    db_div.innerHTML += " \
    <h2>遺失器材(相機/鏡頭/配件)序號列表</h2> \
    <div id=\"db_load\"> \
        <a href=\"https://github.com/gfes980617a/lost_camera_db\">資料庫@github</a> \
        <input id='db_load_button' style='width:7em;' type='button' onclick='init_sqljs()' value='載入資料庫' /> \
        <div>最後更新時間<span id='db_date'>0000-00-00</span>共<span id='db_count'>-?-</span>筆資料</div> \
    </div> \
    <table align='center' border='1' style='text-align:center;'> \
        <thead> \
            <tr><td>品牌</td><td>名稱</td><td>序號</td><td>日期</td><td>來源</td></tr> \
            <tr onchange='search_function()'> \
                <td style='width:25%'><input type='text' class='search' id='brand' disabled></td> \
                <td style='width:25%'><input type='text' class='search' id='model' disabled></td> \
                <td style='width:25%'><input type='text' class='search' id='sn' disabled></td> \
                <td style='width:25%'><input type='text' class='search' id='date' value='2023-' disabled></td> \
                <td style='width:25%'><input type='text' class='search' id='ref' disabled></td> \
            </tr> \
            <tr> \
                <td colspan='4'>找到<span id='db_search_count'>-?-</span>個符合的項目</td> \
                <td><input id='db_search_button' class='search' type='button' onclick='search_function()' value='搜尋' disabled/></td> \
            </tr> \
        </thead> \
        <tbody id='db_search_body'></tbody> \
    </table>";
}
function search_function() {
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

    let input = document.getElementsByClassName("search");
    let brand = input["brand"].value;
    let model = input["model"].value;
    let sn = input["sn"].value;
    let date = input["date"].value;
    let ref = input["ref"].value;
    console.log("Search:",brand,model,sn,date,ref);
    { // count
        var stmt = db.prepare("SELECT count(`sn`) as 'count' FROM `main`WHERE 1\
        AND `brand` like $brand \
        AND `model` like $model \
        AND `sn`    like $sn \
        AND `date`  like $date \
        AND `ref`   like $ref \
        ORDER BY`date` DESC; ");
        stmt.bind({
            $brand: "%" + brand + "%",
            $model: "%" + model + "%",
            $sn: "%" + sn + "%",
            $date: "%" + date + "%",
            $ref: "%" + ref + "%",
        });
        if (stmt.step()) {
            document.getElementById("db_search_count").innerHTML = stmt.getAsObject()['count'];
        }
    }
    { // rows
        var stmt = db.prepare("SELECT * FROM `main` WHERE 1\
        AND `brand` like $brand \
        AND `model` like $model \
        AND `sn`    like $sn \
        AND `date`  like $date \
        AND `ref`   like $ref \
        ORDER BY`date` DESC; ");
        stmt.bind({
            $brand: "%" + brand + "%",
            $model: "%" + model + "%",
            $sn: "%" + sn + "%",
            $date: "%" + date + "%",
            $ref: "%" + ref + "%",
        });
        let tbody = document.getElementById("db_search_body");
        tbody.innerHTML = "";
        while (stmt.step()) {
            tbody.innerHTML += append_table(stmt.getAsObject());
        }
    }
}