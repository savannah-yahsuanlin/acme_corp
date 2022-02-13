const {Sequelize, DataTypes, models} = require('sequelize')
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_corp')

const Department = db.define('department', {
	name: {
		type: DataTypes.STRING,
		allowNull: false
	}
})

const Employee = db.define('employee', {
	name: {
		type: DataTypes.STRING,
		allowNull: false
	}
})

Employee.belongsTo(Department)
Department.hasMany(Employee)

const syncAndSeed = async() => {
	await db.sync({force: true})
	const eng = await Department.create({name: 'eng'})
	const hr = await Department.create({name: 'hr'})
	const marketing = await Department.create({name: 'marketing'})
	const fiance = await Department.create({name: 'fiance'})

	await Employee.create({name: 'moe', departmentId: eng.id })
	await Employee.create({name: 'lucy', departmentId: eng.id })
	await Employee.create({name: 'fred', departmentId: fiance.id })
	await Employee.create({name: 'john', departmentId: marketing.id })
	await Employee.create({name: 'prof', departmentId: eng.id })
}

module.exports = {
	db,
	syncAndSeed,
	models: {
		Department,
		Employee
	}
}