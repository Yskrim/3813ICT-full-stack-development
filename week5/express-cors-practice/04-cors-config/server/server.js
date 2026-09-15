const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;
const API_KEY = "secret123";

let items = [
    { id: 1, name: "First item" },
    { id: 2, name: "Second item" },
];

// TODO: build a corsOptions object (origin, methods, allowedHeaders)
// and pass it to cors(). See TASK.md for the exact requirements.
const corsOptions = {
	origin: "http://localhost:5500",
    methods: ["PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "X-Api-Key"],
};

app.use(express.json());

function requireApiKey(req, res, next) {
    const apiKey = req.get('X-Api-Key');
	if( apiKey !== API_KEY){
		res.status(401).json({ error: "cors: API key not allowed" });
	}
	next();
} 


// TODO: GET /api/items -> return all items (public, any origin)
app.get("/api/items", cors(), (req, res) => {
	res.status(200).json({ items });
});

// TODO: middleware or inline check for X-Api-Key on PUT/DELETE below
app.options('/api/items/:id', cors(corsOptions));

// TODO: PUT /api/items/:id -> requires valid X-Api-Key, else 401
app.put("/api/items/:id", cors(corsOptions), requireApiKey, (req,res)=>{
	const id = Number(req.params.id);
	const { name } = req.body;
	const index = items.findIndex(i => i.id === id);
	
	if(items[index] && name){
		items[index] = { id, name };
		res.status(200).json({ status: "OK", items });
	} else {
		res.status(400).json({ error: "Name required" });
	}
});

// TODO: DELETE /api/items/:id -> requires valid X-Api-Key, else 401
app.delete('/api/items/:id', cors(corsOptions), requireApiKey, (req,res)=>{
	const id = Number(req.params.id);
	const index = items.findIndex(i => i.id === id);

	if(!id){
		res.status(400).json({ error: "Id required"});
	} else if (index === -1){
		res.status(400).json({ error: "Item not found"});
	} else {
		items.splice(index, 1);
		res.status(204).send();
	}
});


app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});


// в чем было дело и почему не работало?
// 	1. Функция проверки ключа должна вызываться на самом методе экспресса без скобок, чтобы сработала в нужный момент.
// 	2. Получение апи ключа либо через req.get('X-Api-Key') в регистре, либо через req.header['x-api-key'] в нижнем регистре.
//	3. Для того чтобы cors(corsOptions) заработали, их нужно передать в экспресс до вызова методов (сверху вниз) == app.options('/api/items/:id', cors(corsOptions));

// ошибка 1. Я сразу добавлял 1 и 3 в метод, но не добавлял в app.options('/api/items/:id', cors(corsOptions)), я просто этого не знал.
// ошибка 2. Я попытался ввести middleware перед путями, но сбивал использование настроек через общее присваивание app.use(requireApiKey).
// ошибка 3. Я убрал cors(corsOptions), requireApiKey из методов, потому что подумал, что app.use(requireApiKey) выполнит эту задачу самостоятельно.

// Вывод. Я понял как настроить корс. Но не знаю всех тонкостей. Буду учиться и пытаться в финальном проекте. Это важный аспект, чтобы приложение работало полноценно.