var express = require('express');
var router = express.Router();
var path = require('path');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(path.join(__dirname, '..', '..', 'BREAD', 'db', 'todo.db'));





router.get('/',function (req, res,) {

  const url = req.url == "/" ? "/?page=1" : req.url

  const params = []


  if (req.query.id) {
    params.push(`id like '%${req.query.id}%'`)
  }
  if (req.query.complete) {
    params.push(`complete = ${req.query.string}`)
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
  let task = req.body.task
  //Quary Binding
  db.run('insert into todo(task) values (?)', [task], (err) => {
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
  const task = req.body.task
  const complete = JSON.parse(req.body.complete)
  db.run('update todo set task = ?, complete = ? where id = ?', [task, complete, id], (err, row) => {
    if (err) return res.send(err)
    res.redirect('/')
  })
  });




module.exports = router;
