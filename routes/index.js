var express = require('express');
var router = express.Router();
var path = require('path');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(path.join(__dirname, '..', '..', 'BREAD', 'db', 'todo.db'));
const { render } = require('express/lib/response');




router.get('/',function (req, res,) {

  const url = req.url == "/" ? "/?page=1" : req.url

  const params = []


  if (req.query.id) {
    params.push(`id like '%${req.query.id}%'`)
  }
  if (req.query.complete) {
    params.push(`bolean = ${req.query.bolean}`)
  }


  const page = req.query.page || 1
  const limit = 3
  const offset = (page - 1) * limit
  let sql = `select count(*) as total from todo`;
  if (params.length > 0) {
    sql += ` where ${params.join('and')}`
  }

  db.get(sql, (err, row) => {
    const pages = Math.ceil(row.total / limit)
    sql = "select * from todo"
    if (params.length > 0) {
      sql += ` where ${params.join(' and ')}`
    }

    sql += ` limit ? offset ? `
    db.all(sql, [limit, offset], (err, rows) => {
      if (err) return res.send(err)
      res.render('list', { data: rows, page, pages, query: req.query, url});
    })
  })  
})

router.get('/add', function (req, res) {
  res.render('add')
})

router.post('/add', function (req, res) {
  let string = req.body.string
  let integer = parseInt(req.body.integer)
  let float = parseFloat(req.body.float)
  let date = req.body.date
  let bolean = req.body.bolean
  


  //Quary Binding
  db.run('insert into todo(string, integer, float, date, bolean) values (?,?,?,?,?)', [string, integer, float, date, bolean], (err) => {
    if (err) return res.send(err)
    res.redirect('/')
  })
})

router.get('/delete/:id', function (req, res) {
  const id = req.params.id
  db.run('delete from todo where id = ?', [Number(id)], (err) => {
    if (err) return res.send(err)
    res.redirect('/')
  })
})

router.get('/edit/:id', function (req, res) {
  const id = req.params.id
  db.get('select * from todo where id = ?', [Number(id)], (err, item) => {
    if (err) return res.send(err)
    res.render('edit', { data: item })
  })
})

router.post('/edit/:id', function (req, res) {
  const id = Number(req.params.id)
  const string = req.body.string
  const integer = req.body.integer
  const float = req.body.float
  const date = req.body.date
  const bolean = req.body.bolean
  console.log(req)
  
  db.run('update todo set string = ?, integer = ?, float = ?, date = ?, bolean = ? where id = ?', [string, integer, float, date, bolean, id], (err, row) => {
    if (err) return res.send(err)
    
    res.redirect('/')
  });
  });




module.exports = router;
