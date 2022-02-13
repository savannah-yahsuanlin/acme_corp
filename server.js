const express = require('express')
const morgan = require('morgan')
const {db, syncAndSeed, models:{Department, Employee}} = require('./db')

const app = express()

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }))
app.use(require('method-override')('_method'))

app.get('/', (req, res) => {res.redirect('/employee')})

app.post('/employee', async(req, res, next) => {
	try {
		await Employee.create(req.body)
		res.redirect('/employee')
	}
	catch(ex) {
		next()
	}
})

app.get('/employee', async(req, res, next) => {
	try {
		const employees = await Employee.findAll({
			include: [Department]
		})
		const departments = await Department.findAll()
		res.send(`
			<html>
				<head>
					<link rel="stylesheet" href="/style.css">
				</head>
				<body>
					<h1>Acme Corp</h1>
						<form method="POST">
							<input name="name" placeholder="employee name"/>
							<select name="departmentId">
								${departments.map(department => `
										<option value="${department.id}">${department.name}</option>
									
								`).join('')}
							</select>
							<button>save</button>
						</form>
					<ul>
						${employees.map(employee => `
							
							<li>
								${employee.name}
							<a href="/departments/${employee.departmentId}">${employee.department.name}</a>
							</li>
						`).join('')}
					</ul>
				</body>
			</html>
		`)
	}
	catch(ex) {
		next(ex)
	}
})

app.get('/departments/:id', async(req, res, next) => {
	try {
		const departments = await Department.findByPk(req.params.id, {include: [Employee]})
		res.send(`
			<html>
				<head>
					<link rel="stylesheet" href="/style.css">
				</head>
				<body>
					<h1>Acme Corp</h1>
					<ul>
						${departments.employees.map(employee => `
							<li>
								${employee.name}
							</li>
							<form method="POST" action="/employee/${employee.id}?_method=DELETE">
							<button>X</button>
							</form>
						`).join('')}
					</ul>
				</body>
			</html>
		`)
	}
	catch(ex) {
		next(ex)
	}
})

app.delete('/employee/:id', async(req, res, next) => {
	try {
		const employee = await Employee.findByPk(req.params.id)
		await employee.destroy()
		res.redirect('/employee')
	}
	catch(ex) {
		next(ex)
	}
})



const setUp = async()=> {
	try {
		await db.authenticate()
		await syncAndSeed()
		const port = process.env.PORT || 3002
		app.listen(port, () => {console.log(`Listening on port ${port}`)})
	}
	catch(ex) {
		console.log(ex)
	}
}

setUp()