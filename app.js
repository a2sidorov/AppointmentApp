const express = require('express');
let port = process.env.PORT || 3000;

const app = express();


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


app.get('/', (req, res) => {
	res.render('index');
});

app.listen(3000, () => {
	console.log(`listening on port ${port}`);
});

//changing something!!!
//another change