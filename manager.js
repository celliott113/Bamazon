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

var inventoryUpdate = [];
var addedProduct = [];

connection.connect();

//Will create the prompt that will be loaded when the app loads.
var managerOptions = {
	properties:{
		mOptions:{
			description: colors.blue('Key in one of the following options: 1) View Products for Sale 2) View Low Inventory 3) Add to Inventory 4) Add New Product')
		},
	},
};

//Start the prompt.
prompt.start();
//The prompt above question action is determined by below if/else statements.
prompt.get(managerOptions, function(err, res){
	if(res.mOptions == 1){
		viewProducts();
	} else if(res.mOptions == 2){
		viewInventory();
	} else if(res.mOptions == 3){
		addInventory();
	} else if(res.mOptions ==4){
		addNewProduct();
	} else {
		console.log('You picked an invalid choice.');
		connection.end();
	}
});

//This is the function for option 1.
var viewProducts = function(){
	//Connects to the MySQL database Products and returns the information from that database.
	connection.query('SELECT * FROM Products', function(err, res){
		console.log('');
		console.log('Products for Sale')
		console.log('');	

		//This variable will create a new table and organize the data.
		var table = new Table({
			head: ['Item Id#', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
			style: {
				head: ['blue'],
				compact: false,
				colAligns: ['center'],
			}
		});

		//This will loop through the MySQL connection and for each item that is returned, the information is then pushed to the table.
		for(var i=0; i<res.length; i++){
			table.push(
				[res[i].ItemID, res[i].ProductName, res[i].DepartmentName, res[i].Price, res[i].StockQuantity]
			);
		}

		console.log(table.toString());
		connection.end();
	})
};

//This is the function for option 2.
var viewInventory = function(){

	//Connects to the MySQL database Products and returns an alert when product quantity is less than 5.
	connection.query('SELECT * FROM Products WHERE StockQuantity < 5', function(err, res){
		console.log('');
		console.log('Items With Low Inventory');
		console.log('');

		var table = new Table({
			head: ['Item Id#', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
			style: {
				head: ['blue'],
				compact: false,
				colAligns: ['center'],
			}
		});

		//A for loop to go through the data returned from MySQL and pushes it into the table.
		for(var i=0; i<res.length; i++){
			table.push(
				[res[i].ItemID, res[i].ProductName, res[i].DepartmentName, res[i].Price, res[i].StockQuantity]
			);
		}

		console.log(table.toString());
		connection.end();
	})
};

//This is the function for option 3.
var addInventory = function(){
	//Variable that will prompt the information needed to replenish the stock quantity of an item from the product list.
	var addInvt = {
		properties:{
			inventoryID: {
				description: colors.green('Please input Product ID for quantity replenish.')
			},
			inventoryAmount:{
				description: colors.green('Please input the quanity to replenish with.')
			}
		},
	};

	prompt.start();

	//Gets the information provided from quantity replenishment.
	prompt.get(addInvt, function(err, res){

		//Variable created from prompt questions.
		var invtAdded = {
			inventoryAmount: res.inventoryAmount,
			inventoryID: res.inventoryID,
		}

		//Push the response to the inventoryUpdate array.
		inventoryUpdate.push(invtAdded);

		//Connect to the MySQL database Products and sets the stock quanitity to the number entered in the prompt above + the current stock quantity for a specific itemID.
		connection.query("UPDATE Products SET StockQuantity = (StockQuantity + ?) WHERE ItemID = ?;", [inventoryUpdate[0].inventoryAmount, inventoryUpdate[0].inventoryID], function(err, result){

			if(err) console.log('error '+ err);

			//Selects the updated information from the MySQL database and console logs a confirmation.
			connection.query("SELECT * FROM Products WHERE ItemID = ?", inventoryUpdate[0].inventoryID, function(error, resOne){
				console.log('');
				console.log('The new updated stock quantity for id# '+inventoryUpdate[0].inventoryID+ ' is ' + resOne[0].StockQuantity);
				console.log('');
				connection.end();
			})

		})
	})
};

//This is the function for option 4.
var addNewProduct = function(){
	//Variable for newProduct which contains the questions that are to be prompted to the user.
	var newProduct = {
		properties: {
			newIdNum:{ description: colors.gray('Please enter a unique 5 digit item Id: ')},
			newItemName:{ description: colors.gray('Please enter the name of the product you wish to add: ')},
			newItemDepartment: { description: colors.gray('What department does this item belong in? ')},
			newItemPrice: { description: colors.gray('Please enter the price of the item in the format of 00.00: ')},
			newStockQuantity: { description: colors.gray('Please enter a stock quantity for this item: ')},
		}
	}

	prompt.start();

	//Gets responses from newProduct.
	prompt.get(newProduct, function(err, res){

		//Variable to log responses.
		var newItem = {
			newIdNum: res.newIdNum,
			newItemName: res. newItemName,
			newItemDepartment: res.newItemDepartment,
			newItemPrice: res.newItemPrice,
			newStockQuantity: res.newStockQuantity,

		};

		//Pushes the variable and the response data to the addedProduct array.
		addedProduct.push(newItem);

		//Connects to MySQL and inserts the responses to the prompt into the MySQL database.
		connection.query('INSERT INTO Products (ItemID, ProductName, DepartmentName, Price, StockQuantity) VALUES (?, ?, ?, ?, ?);', [addedProduct[0].newIdNum, addedProduct[0].newItemName, addedProduct[0].newItemDepartment, addedProduct[0].newItemPrice, addedProduct[0].newStockQuantity], function(err, result){

			if(err) console.log('Error: ' + err);

			console.log('New item successfully added to the inventory!');
			console.log(' ');
			console.log('Item id#: ' + addedProduct[0].newIdNum);
			console.log('Item name: ' + addedProduct[0].newItemName);
			console.log('Department: ' + addedProduct[0].newItemDepartment);
			console.log('Price: $' + addedProduct[0].newItemPrice);
			console.log('Stock Quantity: ' + addedProduct[0].newStockQuantity);

			connection.end();
		})
	})
};