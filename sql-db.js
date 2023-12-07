var db;
function init_sqljs() {
    initSqlJs().then(function (SQL) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', "/lost_camera_db/database.sqlite", true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = e => {
            const uInt8Array = new Uint8Array(xhr.response);
            db = new SQL.Database(uInt8Array);
            document.getElementById("search_butt_td").innerHTML = "<input id='search_butt' class='search' type='button' onclick='search_butt()' value='開始搜尋' disabled/>";
            document.getElementById("db_date").innerHTML = db.exec("SELECT `date` FROM `main` WHERE `ref`='我'")[0].values[0][0];
            document.getElementById("db_count").innerHTML = db.exec("SELECT count() as 'count' FROM `main`")[0].values[0][0];
            Array.from(document.getElementsByClassName("search")).forEach(element => {
                element.disabled ^= true;
            });
        };
        xhr.send();
    });
}
function search_butt() {
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
    console.log(brand);
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
        while (stmt.step()) {
            document.getElementById("count").innerHTML = stmt.getAsObject()['count'];
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
        let tbody = document.getElementById("tbody");
        tbody.innerHTML = "";
        while (stmt.step()) {
            tbody.innerHTML += append_table(stmt.getAsObject());
        }
    }
}