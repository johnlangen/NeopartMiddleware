// server.js

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json

const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'John3278',
    database: 'test_db'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to the database.');
});

app.get('/parts', (req, res) => {
    const partNumber = req.query.partNumber;
    const keyword = req.query.keyword;
    const location = req.query.location; 

    let sqlQuery = 'SELECT * FROM TRNDV_PartSearch WHERE 1=1';
    let queryParams = [];

    if(partNumber) {
        sqlQuery += ' AND vendor_part_no = ?';
        queryParams.push(partNumber);
    } 
    
    if(keyword) {
        sqlQuery += ' AND descrip LIKE ?';
        queryParams.push('%' + keyword + '%');
    }

    if(location) { 
        sqlQuery += ' AND location = ?';
        queryParams.push(location);
    }

    db.query(sqlQuery, queryParams, (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (results.length > 0) {
                res.json(results);
            } else {
                res.status(404).json({ error: "No parts found" });
            }
        }
    });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (results.length > 0) {
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        }
    });
});

app.post('/part-sign-out', (req, res) => {
    const {
        mechanicId,
        busId,
        workOrder,
        partNumber,
        quantity,
        supervisorInitials,
        dateTime,
        possibleWarranty,
        possibleDoubleBilling,
        doubleBillingLastOrder,
        warrantyLastOrder,
        warrantyLastOrderDate,
        lastPdPrice,
        fifoDate,
        vendno,
        description,
        inServiceDate,
        vmrsCode,
        neopartPn,
        inServiceYear,
        vin,
        vendorName,
        lastPo,
        lastPoDate,
        excluded,
    } = req.body;
    
    const sqlQuery = `
        INSERT INTO signout_sheet 
            (
                mechanic_id, bus_id, work_order, part_number, quantity, supervisor_initials, 
                datetime, possible_warranty, possible_double_billing, double_billing_last_order,
                warranty_last_order, warranty_last_order_date, last_pd_price, fifo_date,
                vendno, description, in_service_date, vmrs_code, neopart_pn,
                in_service_year, vin, vendor_name, last_po, last_po_date,
                excluded
            ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const queryParams = [
        mechanicId, busId, workOrder, partNumber, quantity, supervisorInitials,
        dateTime, possibleWarranty, possibleDoubleBilling, doubleBillingLastOrder,
        warrantyLastOrder, warrantyLastOrderDate, lastPdPrice, fifoDate,
        vendno, description, inServiceDate, vmrsCode, neopartPn,
        inServiceYear, vin, vendorName, lastPo, lastPoDate,
        excluded,
    ];
    
    db.query(sqlQuery, queryParams, (err, result) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json({ success: true });
        }
    });
});

app.use((req, res) => {
    res.status(404).send({url: req.originalUrl + ' not found'});
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
