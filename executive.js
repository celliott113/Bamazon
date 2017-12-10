var mysql = require('mysql');
var prompt = require('prompt');
var colors = require('colors/safe');
var Table = require('cli-table');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'Bamazon', 
});

var newDept = [];


connection.connect();

//Variable creates question that will be prompted to the user.
var executiveOptions = {
	properties:{
		eOptions:{
			description: colors.blue('Key in one of the following options: 1) View Product Sales by Department 2) Create New Department')
		},
	},
};

prompt.start();

//Gets the information responded by the user.
prompt.get(executiveOptions, function(err, res){
	//If statement explains what should be done based on what the user answered to the prompt.
	if(res.eOptions == 1){
		viewProductSales();
	} else if(res.eOptions == 2){
		createDepartment();
	} else{
		console.log('That is not a valid option, please try again!');
		connection.end();
	}
});

//Function to be run when the user picks option 1.
var viewProductSales = function(){
	//Function creates a table for the data to be stored and displayed.
	var table = new Table({
		head: ['Department ID', 'Department Name', 'Overhead Cost', 'Total Sales', 'Total Profit'],
		style: {
			head:['blue'],
			compact: false,
			colAligns: ['center'],
		}
	});
	console.log(' ');
	console.log(colors.black.bgWhite.underline('Product Sales by Department'));

	//Connects to the MySQL database and grabs the information from the alias table called totalProfits.
	connection.query('SELECT * FROM totalprofits', function(err, res){
		if(err) console.log('Error: ' + err);

		//For loop through the data pulled from the totalProfits database and pushes it into the totalProfits.
		for(var i = 0; i<res.length; i++){
			table.push(
				[res[i].DepartmentId, res[i].DepartmentName, res[i].OverHeadCosts, res[i].TotalSales, res[i].TotalProfit]
				);
		}

		console.log(' ');
		console.log(table.toString());
		connection.end();
	})
};

//Function to be run when the user selects option 2.
var createDepartment = function(){

	//Creates the questions to be prompted to the user when option 2 is selected.
	var newDepartment = {
		properties: {
			newDeptName:{ description: colors.magenta('Please enter the name of the new department you would like to add: ')
			},
			newOverhead:{ description: colors.magenta('What are the overhead costs for this department? ')
			},
		}
	}

	prompt.start();
	//Gets the information the user entered from variable newDepartment.
	prompt.get(newDepartment, function(err, res){

		//Variable to store the user responses.
		var newDeptInfo = {
			deptName: res.newDeptName,
			overHeadNew: res.newOverhead,
			autoTotalSales: 0,
		};
		//Push user responses to the array defined by newDeptartment.
		newDept.push(newDeptInfo);
		//Connects to the MySQL database Departments and inserts the information received from the user.
		connection.query('INSERT INTO Departments (DepartmentName, OverHeadCosts, TotalSales) VALUES (?, ?, ?);', [newDept[0].deptName, newDept[0].overHeadNew, newDept[0].autoTotalSales], function(err, result){
			if(err){
				console.log('Error: ' + err);
				connection.end();
			} else {
				console.log('');
				console.log(colors.blue.underline('New Department sucessfully created!'));
				console.log(' ');
				connection.end();
			}
		})
	})
};