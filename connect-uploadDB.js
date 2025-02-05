const mongoose = require('mongoose');


const seedUsers = require('./seeders/userSeeder');
const seedConversationSessions = require('./seeders/conversationSessionSeeder');
const seedArticleFiles = require('./seeders/articleFileSeeder');
const seedLocations = require('./seeders/locationSeeder');

const connectionParam = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect('mongodb+srv://admin:U385XYNq08fcb6uu@cluster0.om2fx.mongodb.net/GeoSI?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected!'));


// seedUsers();
// seedConversationSessions();
// seedArticleFiles();
seedLocations();
