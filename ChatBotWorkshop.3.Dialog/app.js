/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// var tableName = 'botdata';
// var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
// var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
// bot.set('storage', tableStorage);

bot.dialog('/', [function(session) {
    builder.Prompts.choice(session, 'Please select a Math operation', ['Add','Subtract']);
}, function(session, results){

    var mathOperation = results.response.entity;
    switch(mathOperation) {
        case 'Add':
            session.beginDialog('addDialog');
            break;
        case 'Subtract':
            session.beginDialog('subtractDialog');
            break;
    }
}]);

bot.dialog('addDialog', [function(session) {
    builder.Prompts.number(session, 'Enter first number');
}, function (session, results) {

    session.dialogData.firstNumber = results.response;
    builder.Prompts.number(session, 'Enter second number');
}, function (session, results) {

    session.dialogData.secondNumber = results.response;
    var sum = doTheMath(session.dialogData.firstNumber, 
                        session.dialogData.secondNumber,
                        'Add');

    session.send('The sum is: ' + sum);
    session.endDialog();
}]).triggerAction({
    matches: /^add$/i
});

bot.dialog('subtractDialog', [function(session) {
    builder.Prompts.number(session, 'Enter first number');
}, function (session, results) {

    session.dialogData.firstNumber = results.response;
    builder.Prompts.number(session, 'Enter second number');
}, function (session, results) {

    session.dialogData.secondNumber = results.response;
    var difference = doTheMath(session.dialogData.firstNumber, 
                        session.dialogData.secondNumber,
                        'Subtract');

    session.send('The difference is: ' + difference);
    session.endDialog();
}]);

function doTheMath(firstNumber, secondNumber, mathOperation) {
    switch(mathOperation) {
        case 'Add':
            return firstNumber + secondNumber;
        case 'Subtract':
            return firstNumber - secondNumber;
        default:
            return null;
    }
}

