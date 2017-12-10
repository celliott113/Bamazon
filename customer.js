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

var productPurchased = [];

connection.connect();

//The connection to the MySQL database and queries information from the Products table and displays to the user.
connection.query('SELECT ItemID, ProductName, Price FROM Products', function(err, result){
	if(err) console.log(err);

	//Creates a table for product information from the MySQL database to be placed in.
	var table = new Table({
		head: ['Item Id#', 'Product Name', 'Price'],
		style: {
			head: ['blue'],
			compact: false,
			colAligns: ['center'],
		}
	});

	//A for loop to loop through each item in the mysql database and pushes that data into a new row in the table.
	for(var i = 0; i < result.length; i++){
		table.push(
			[result[i].ItemID, result[i].ProductName, result[i].Price]
		);
	}
	console.log(table.toString());

	purchase();
});

//The purchase function allowing the user to purchase items from the database.
var purchase = function(){

	//Variable to create questions that will be prompted to the user.
	var productInfo = {
		properties: {
			itemID:{description: colors.blue('Please enter the ID # of the item you wish to purchase!')},
			Quantity:{description: colors.green('How many items would you like to purchase?')}
		},
	};

	prompt.start();

	//A prompt to the responses from the variable at line 45.
	prompt.get(productInfo, function(err, res){

		//A variable to place the responses in the variable custPurchase.
		var custPurchase = {
			itemID: res.itemID,
			Quantity: res.Quantity
		};
		
		//Pushes the variable established to the productPurchased array.
		productPurchased.push(custPurchase);

		//Connects to the MySQL database and selects the item the user selected above by itemID.
		connection.query('SELECT * FROM Products WHERE ItemID=?', productPurchased[0].itemID, function(err, res){
				if(err) console.log(err, 'That item ID doesn\'t exist');
				
				//If the stock quantity available is less than what the user wanted to purchase the user will be alerted.
				if(res[0].StockQuantity < productPurchased[0].Quantity){
					console.log('There is only ' + StockQuantity + ' available. Please reduce your quantity selected.');
					connection.end();

				//Otherwise if the stock amount is available, the purchase will proceed.
				} else if(res[0].StockQuantity >= productPurchased[0].Quantity){

					console.log('');

					console.log(productPurchased[0].Quantity + ' items purchased');

					console.log(res[0].ProductName + ' ' + res[0].Price);

					//The purchase will create a variable of SaleTotal that contains the total amount the user is paying.
					var saleTotal = res[0].Price * productPurchased[0].Quantity;

					//Connection to the MySQL database Departments and updates the saleTotal for the id of the item purchased.
					connection.query("UPDATE Departments SET TotalSales = ? WHERE DepartmentName = ?;", [saleTotal, res[0].DepartmentName], function(err, resultOne){
						if(err) console.log('error: ' + err);
						return resultOne;
					})

					console.log('Total: ' + saleTotal);

					//Variable contains the newly updated stock quantity of the item purchased.
					newQuantity = res[0].StockQuantity - productPurchased[0].Quantity;
			
					//Connection to the MySQL database Products and updates the stock quantity for the item puchased.
					connection.query("UPDATE Products SET StockQuantity = " + newQuantity +" WHERE ItemID = " + productPurchased[0].itemID, function(err, res){
						if(err) throw err;
						console.log('A problem has occurred: ', err);
						console.log('');
						console.log(colors.cyan('Your transaction has been completed!'));
						console.log('');

						connection.end();
					})

				};

		})
	})

};