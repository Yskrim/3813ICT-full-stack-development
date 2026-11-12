const express = require('express');
const cors = require('cors');
const PORT = 3000;
const app = express();

const books = [
	{
		id: 'b1',
		title: 'The man who mistook his wife for a hat',
		author: 'Oliver Sacks',
		copies: 3,
	},
	{
		id: 'b2',
		title: 'Pride and Prejudice',
		author: 'Jane Austen',
		copies: 4,
	},
	{
		id: 'b3',
		title: 'Crime and punishment',
		author: 'Fedor Dostoevskiy',
		copies: 5,
	},
	{
		id: 'b4',
		title: 'War and peace',
		author: 'Lev Tolstoy',
		copies: 6,
	},
];


// MIDDLEWARE

// json parser
app.use(express.json());

// cors; object == corsOptions in spread form
app.use(cors({ origin: 'http://localhost:4200' }));

// logger
app.use((req, res, next) => {
	const startTime = new Date();

	console.log('\nStart time:', startTime.toISOString());
	console.log('Request method:', req.method);
	console.log('Path:', req.url);
	console.log('Request origin', req.get('origin') ?? '-');

	res.on('finish', () => {
		console.log('Response time ms:', new Date() - startTime);
	});

	next();
});


// PUBLIC API ENDPOINTS
app.get('/api/health', (req, res) => {
	res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/books', (req, res) => {
	res.json({ books });
});

app.get('/api/books/:id', (req, res) => {
	const id = req.params.id;
	try {
		const book = books.find((b) => b.id === id);
		if (!book) return res.status(404).json({ message: 'book not found' });

		res.json({ book });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

app.post('/api/books/:id/borrow', (req, res) => {
	const id = req.params.id;
	try {
		const book = books.find((b) => b.id === id);

		if (!book) return res.status(404).json({ message: 'book not found' });
		if (!book.copies) return res.status(409).json({ message: 'no copies left' });

		book.copies--;

		return res.status(200).json({
			book,
			message: 'borrowed',
			copiesLeft: book.copies,
		});
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

app.post('/api/books/:id/return', (req, res) => {
	const id = req.params.id;
	try {
		const book = books.find((b) => b.id === id);

		if (!book) return res.status(404).json({ message: 'book not found' });

		book.copies++;

		return res.status(200).json({
			book,
			message: 'returned',
			copiesLeft: book.copies,
		});
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

// not found page fallback
app.use((req, res, next) => {
	return res.status(404).json({ message: 'page not found' });
});


// SERVER BOOT
app.listen(PORT, () => {
	console.log(`Server running on "http://localhost:${PORT}"`);
});
